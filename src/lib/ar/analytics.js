/**
 * Pure analytics functions over the AR dataset.
 *
 * Every function in this module is the JS equivalent of a stored
 * procedure: it takes structured arguments, runs deterministic logic
 * over the in-memory dataset, and returns structured results. There
 * is no LLM in here.
 *
 * The API route exposes these to Claude as a fixed set of tools.
 * Claude's job is to pick the right one (or chain a few) for the
 * user's question and synthesize the answer. This split is the
 * point of the demo: the LLM is a router and a writer, the actual
 * data work is auditable, reproducible code.
 *
 * Conventions:
 *   - All functions return `{ data, summary, chart? }`.
 *   - `data` is the structured records that backed the answer
 *     (always citeable, always rendered in the audit panel).
 *   - `summary` is a short string the LLM can quote or paraphrase.
 *   - `chart` (optional) is a hint for the UI to render a specific
 *     visualization. Shape: { type: 'bar' | 'line', ...spec }.
 */

import {
  CUSTOMERS,
  INVOICES,
  CUSTOMER_BY_ID,
  INVOICES_BY_CUSTOMER,
  REPORT_DATE,
} from "./data.js";

const AGING_BUCKETS = ["current", "1-30", "31-60", "61-90", "90+"];

const fmtUSD = (n) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

/* ============================================================
 * 1. risk_summary
 *    High-level KPI snapshot: total AR, % overdue, top exposure,
 *    average days overdue across unpaid invoices.
 * ============================================================ */
export function risk_summary() {
  const unpaid = INVOICES.filter((i) => i.status !== "paid");
  const totalAR = unpaid.reduce((s, i) => s + i.amount, 0);
  const overdue = unpaid.filter((i) => i.daysOverdue > 0);
  const overdueAR = overdue.reduce((s, i) => s + i.amount, 0);
  const overduePct = totalAR === 0 ? 0 : (overdueAR / totalAR) * 100;
  const avgDaysOverdue =
    overdue.length === 0
      ? 0
      : overdue.reduce((s, i) => s + i.daysOverdue, 0) / overdue.length;

  // Top exposure customer = highest unpaid balance.
  const byCustomer = new Map();
  for (const inv of unpaid) {
    byCustomer.set(inv.customerId, (byCustomer.get(inv.customerId) || 0) + inv.amount);
  }
  const sortedExposure = [...byCustomer.entries()].sort((a, b) => b[1] - a[1]);
  const [topCustId, topCustAmt] = sortedExposure[0] || [null, 0];
  const topCustomer = topCustId ? CUSTOMER_BY_ID.get(topCustId) : null;
  const topPctOfLimit = topCustomer
    ? (topCustAmt / topCustomer.creditLimit) * 100
    : 0;

  return {
    data: {
      reportDate: REPORT_DATE,
      totalAR,
      overdueAR,
      overduePct: Number(overduePct.toFixed(1)),
      avgDaysOverdue: Number(avgDaysOverdue.toFixed(1)),
      activeCustomers: byCustomer.size,
      totalInvoices: unpaid.length,
      topCustomer: topCustomer
        ? {
            id: topCustomer.id,
            name: topCustomer.name,
            amount: topCustAmt,
            creditLimit: topCustomer.creditLimit,
            pctOfLimit: Number(topPctOfLimit.toFixed(1)),
          }
        : null,
    },
    summary: `Total open AR is ${fmtUSD(totalAR)} across ${byCustomer.size} customers. ${overduePct.toFixed(1)}% (${fmtUSD(overdueAR)}) is past due. Average days overdue on past-due balances is ${avgDaysOverdue.toFixed(0)}. Largest single exposure: ${topCustomer?.name} at ${fmtUSD(topCustAmt)} (${topPctOfLimit.toFixed(0)}% of their credit limit).`,
  };
}

/* ============================================================
 * 2. top_customers_by
 *    Rank customers by a metric. Useful for "most overdue",
 *    "biggest exposure", "highest credit utilization" questions.
 *
 *    metric: 'outstanding'   - total unpaid balance
 *            'overdue'       - past-due balance only
 *            'days_overdue'  - max days any one invoice is past due
 *            'utilization'   - outstanding / creditLimit (%)
 * ============================================================ */
export function top_customers_by({ metric = "outstanding", limit = 5 }) {
  const safeLimit = Math.max(1, Math.min(20, limit));
  const rows = CUSTOMERS.map((c) => {
    const invs = (INVOICES_BY_CUSTOMER.get(c.id) || []).filter(
      (i) => i.status !== "paid"
    );
    const outstanding = invs.reduce((s, i) => s + i.amount, 0);
    const overdueInvs = invs.filter((i) => i.daysOverdue > 0);
    const overdue = overdueInvs.reduce((s, i) => s + i.amount, 0);
    const maxDaysOverdue = overdueInvs.reduce(
      (m, i) => Math.max(m, i.daysOverdue),
      0
    );
    const utilization = c.creditLimit > 0 ? (outstanding / c.creditLimit) * 100 : 0;
    return {
      customerId: c.id,
      customerName: c.name,
      industry: c.industry,
      country: c.country,
      creditLimit: c.creditLimit,
      outstanding,
      overdue,
      maxDaysOverdue,
      utilization: Number(utilization.toFixed(1)),
      invoiceCount: invs.length,
    };
  });

  const sortKey = {
    outstanding: (r) => r.outstanding,
    overdue: (r) => r.overdue,
    days_overdue: (r) => r.maxDaysOverdue,
    utilization: (r) => r.utilization,
  }[metric] || ((r) => r.outstanding);

  rows.sort((a, b) => sortKey(b) - sortKey(a));
  const top = rows.slice(0, safeLimit).filter((r) => sortKey(r) > 0);

  const labelByMetric = {
    outstanding: "outstanding balance",
    overdue: "overdue balance",
    days_overdue: "days past due",
    utilization: "credit utilization",
  };

  const valueFmt = {
    outstanding: (v) => fmtUSD(v),
    overdue: (v) => fmtUSD(v),
    days_overdue: (v) => `${v} days`,
    utilization: (v) => `${v.toFixed(1)}%`,
  }[metric];

  return {
    data: {
      metric,
      limit: safeLimit,
      rows: top,
    },
    summary:
      top.length === 0
        ? `No customers have a non-zero value for ${labelByMetric[metric]}.`
        : `Top ${top.length} customers by ${labelByMetric[metric]}: ` +
          top
            .map((r, i) => `${i + 1}. ${r.customerName} (${valueFmt(sortKey(r))})`)
            .join("; ") +
          ".",
    chart: {
      type: "bar",
      orientation: "horizontal",
      title: `Top ${top.length} customers by ${labelByMetric[metric]}`,
      data: top.map((r) => ({
        label: r.customerName,
        value: sortKey(r),
        formatted: valueFmt(sortKey(r)),
      })),
      valueLabel: labelByMetric[metric],
    },
  };
}

/* ============================================================
 * 3. customer_aging
 *    Aging breakdown - either for the entire portfolio
 *    (customerId omitted) or for one customer.
 * ============================================================ */
export function customer_aging({ customerId = null }) {
  const scope = customerId
    ? (INVOICES_BY_CUSTOMER.get(customerId) || []).filter((i) => i.status !== "paid")
    : INVOICES.filter((i) => i.status !== "paid");

  const buckets = Object.fromEntries(AGING_BUCKETS.map((b) => [b, 0]));
  for (const inv of scope) {
    buckets[inv.agingBucket] += inv.amount;
  }
  const total = Object.values(buckets).reduce((s, v) => s + v, 0);

  const customer = customerId ? CUSTOMER_BY_ID.get(customerId) : null;
  const scopeLabel = customer ? customer.name : "the entire portfolio";

  return {
    data: {
      customerId,
      customerName: customer?.name || null,
      reportDate: REPORT_DATE,
      total,
      buckets,
      pctByBucket: Object.fromEntries(
        AGING_BUCKETS.map((b) => [
          b,
          total === 0 ? 0 : Number(((buckets[b] / total) * 100).toFixed(1)),
        ])
      ),
    },
    summary:
      total === 0
        ? `No open balances for ${scopeLabel}.`
        : `Aging for ${scopeLabel} totals ${fmtUSD(total)}. ` +
          AGING_BUCKETS.filter((b) => buckets[b] > 0)
            .map(
              (b) =>
                `${b}: ${fmtUSD(buckets[b])} (${((buckets[b] / total) * 100).toFixed(0)}%)`
            )
            .join("; ") +
          ".",
    chart: {
      type: "bar",
      orientation: "vertical",
      title: `Aging breakdown - ${scopeLabel}`,
      data: AGING_BUCKETS.map((b) => ({
        label: b,
        value: buckets[b],
        formatted: fmtUSD(buckets[b]),
      })),
      valueLabel: "USD outstanding",
    },
  };
}

/* ============================================================
 * 4. invoices_filtered
 *    Slice the invoice ledger by criteria. Used for "show me
 *    invoices over 60 days late" or "all unpaid invoices for
 *    DriftWood" style questions.
 * ============================================================ */
export function invoices_filtered({
  customerId = null,
  minDaysOverdue = null,
  maxDaysOverdue = null,
  status = null,
  minAmount = null,
  limit = 20,
}) {
  const safeLimit = Math.max(1, Math.min(50, limit));
  let rows = INVOICES;
  if (customerId) rows = rows.filter((i) => i.customerId === customerId);
  if (status) rows = rows.filter((i) => i.status === status);
  if (minDaysOverdue !== null && minDaysOverdue !== undefined) {
    rows = rows.filter((i) => i.daysOverdue >= minDaysOverdue);
  }
  if (maxDaysOverdue !== null && maxDaysOverdue !== undefined) {
    rows = rows.filter((i) => i.daysOverdue <= maxDaysOverdue);
  }
  if (minAmount !== null && minAmount !== undefined) {
    rows = rows.filter((i) => i.amount >= minAmount);
  }
  const sorted = [...rows].sort((a, b) => b.daysOverdue - a.daysOverdue || b.amount - a.amount);
  const truncated = sorted.slice(0, safeLimit);
  const total = sorted.reduce((s, i) => s + i.amount, 0);

  // Decorate with customer name for readability
  const decorated = truncated.map((i) => ({
    ...i,
    customerName: CUSTOMER_BY_ID.get(i.customerId)?.name || i.customerId,
  }));

  return {
    data: {
      filters: { customerId, minDaysOverdue, maxDaysOverdue, status, minAmount, limit: safeLimit },
      reportDate: REPORT_DATE,
      total,
      matchCount: sorted.length,
      returnedCount: truncated.length,
      rows: decorated,
    },
    summary: `${sorted.length} invoice${sorted.length === 1 ? "" : "s"} matched the filter (${fmtUSD(total)} total). Showing top ${truncated.length} by days overdue then amount.`,
  };
}

/* ============================================================
 * 5. dso_trend
 *    Average collection period by month over the dataset window.
 *    For each issue-date month: average (paidDate - issueDate)
 *    for paid invoices, plus (REPORT_DATE - issueDate) for unpaid
 *    ones still outstanding. The drift in the value tells the
 *    "things are slowing down / speeding up" story.
 * ============================================================ */
export function dso_trend() {
  const ref = Date.parse(REPORT_DATE);
  const byMonth = new Map(); // 'YYYY-MM' -> { sum, count }

  for (const inv of INVOICES) {
    const issue = Date.parse(inv.issueDate);
    const monthKey = inv.issueDate.slice(0, 7);
    const end =
      inv.status === "paid" ? Date.parse(inv.paidDate) : ref;
    const days = Math.max(0, Math.floor((end - issue) / (1000 * 60 * 60 * 24)));
    if (!byMonth.has(monthKey)) byMonth.set(monthKey, { sum: 0, count: 0 });
    const b = byMonth.get(monthKey);
    b.sum += days;
    b.count += 1;
  }

  const months = [...byMonth.keys()].sort();
  const series = months.map((m) => {
    const b = byMonth.get(m);
    const avg = b.count === 0 ? 0 : b.sum / b.count;
    return {
      month: m,
      avgCollectionDays: Number(avg.toFixed(1)),
      invoiceCount: b.count,
    };
  });

  const first = series[0]?.avgCollectionDays || 0;
  const last = series[series.length - 1]?.avgCollectionDays || 0;
  const direction = last - first;
  const trendWord =
    Math.abs(direction) < 1
      ? "roughly flat"
      : direction > 0
        ? `drifting up by ${direction.toFixed(0)} days`
        : `improving by ${Math.abs(direction).toFixed(0)} days`;

  return {
    data: {
      reportDate: REPORT_DATE,
      series,
    },
    summary:
      series.length === 0
        ? "No invoice history available for trend."
        : `Average collection period over the last ${series.length} months: ${trendWord}. Started at ${first.toFixed(0)} days (${series[0].month}), ended at ${last.toFixed(0)} days (${series[series.length - 1].month}).`,
    chart: {
      type: "line",
      title: "Average collection period (days) by month",
      data: series.map((s) => ({
        label: s.month,
        value: s.avgCollectionDays,
        formatted: `${s.avgCollectionDays.toFixed(0)} days`,
      })),
      valueLabel: "Days to collection",
    },
  };
}

/* ============================================================
 * 6. customer_detail
 *    Full per-customer snapshot: identity, terms, every invoice,
 *    aging breakdown, utilization. Used when the user names a
 *    specific customer.
 * ============================================================ */
export function customer_detail({ customerId }) {
  const c = CUSTOMER_BY_ID.get(customerId);
  if (!c) {
    return {
      data: { customerId, found: false },
      summary: `No customer with id "${customerId}" exists in the dataset.`,
    };
  }
  const invs = (INVOICES_BY_CUSTOMER.get(customerId) || []).slice().sort(
    (a, b) => Date.parse(b.issueDate) - Date.parse(a.issueDate)
  );
  const unpaid = invs.filter((i) => i.status !== "paid");
  const outstanding = unpaid.reduce((s, i) => s + i.amount, 0);
  const overdueInvs = unpaid.filter((i) => i.daysOverdue > 0);
  const overdue = overdueInvs.reduce((s, i) => s + i.amount, 0);
  const utilization = c.creditLimit > 0 ? (outstanding / c.creditLimit) * 100 : 0;
  const overLimit = outstanding > c.creditLimit;

  // Payment history score: % of paid invoices paid on or before due
  // date. Higher is better. If they have no paid invoices, return null.
  const paid = invs.filter((i) => i.status === "paid");
  const onTime = paid.filter(
    (i) => Date.parse(i.paidDate) <= Date.parse(i.dueDate)
  ).length;
  const onTimePct = paid.length === 0 ? null : (onTime / paid.length) * 100;

  return {
    data: {
      customer: c,
      reportDate: REPORT_DATE,
      outstanding,
      overdue,
      utilization: Number(utilization.toFixed(1)),
      overLimit,
      onTimePaymentPct: onTimePct === null ? null : Number(onTimePct.toFixed(1)),
      invoiceCount: invs.length,
      paidCount: paid.length,
      unpaidCount: unpaid.length,
      invoices: invs,
    },
    summary:
      `${c.name} (${c.industry}, ${c.country}, terms ${c.paymentTerms}). ` +
      `Outstanding: ${fmtUSD(outstanding)} against ${fmtUSD(c.creditLimit)} credit limit (${utilization.toFixed(0)}% utilization${overLimit ? ", OVER LIMIT" : ""}). ` +
      `Past due: ${fmtUSD(overdue)} across ${overdueInvs.length} invoice${overdueInvs.length === 1 ? "" : "s"}. ` +
      (onTimePct === null
        ? "No paid invoices on file."
        : `Payment history: ${onTimePct.toFixed(0)}% of paid invoices were on or before due date.`),
  };
}

/**
 * Tool registry used by the API route to dispatch by name.
 */
export const TOOLS = {
  risk_summary,
  top_customers_by,
  customer_aging,
  invoices_filtered,
  dso_trend,
  customer_detail,
};
