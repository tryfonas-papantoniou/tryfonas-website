/**
 * Synthetic accounts receivable dataset for the AR Insights demo.
 *
 * The story: Aurelia Industries is a fictional B2B services and
 * supplies company. Their finance team runs end-of-month AR analysis
 * to spot risk concentrations, late payers, and DSO trends.
 *
 * Dataset shape:
 *   - 25 customers across mixed industries and geographies
 *   - 150 invoices spanning Nov 2025 through Apr 2026 (6 months)
 *   - Hand-tuned to surface a few interesting patterns:
 *
 * Patterns deliberately seeded so the demo always has something to
 * say:
 *   - DriftWood Hotels Group: chronic late payer, large balance,
 *     close to its credit limit. The "risk" answer.
 *   - Wexford Education Trust: slow-pay industry, consistent 60+
 *     days overdue. The "structural late" example.
 *   - Vanguard Tech Solutions: large balance, perfect payment record.
 *     The contrast case for "biggest exposure but is it risky?".
 *   - DSO drifting from 38 (Nov) up to 47 (Apr) - a real trend the
 *     dashboard surfaces in the trend question.
 *
 * "Today" for the demo is 2026-04-30. All overdue calculations use
 * that as the reference date so figures are stable run-to-run.
 */

export const REPORT_DATE = "2026-04-30";

export const CUSTOMERS = [
  { id: "C-001", name: "Vanguard Tech Solutions",       industry: "Technology",      country: "US", creditLimit: 1_500_000, paymentTerms: "Net 30" },
  { id: "C-002", name: "Helios Manufacturing Co",       industry: "Manufacturing",   country: "US", creditLimit: 1_200_000, paymentTerms: "Net 45" },
  { id: "C-003", name: "Pinnacle Financial Services",   industry: "Finance",         country: "US", creditLimit: 2_000_000, paymentTerms: "Net 30" },
  { id: "C-004", name: "Atlantic Healthcare Partners",  industry: "Healthcare",      country: "US", creditLimit: 800_000,   paymentTerms: "Net 45" },
  { id: "C-005", name: "Brookhaven Retail Group",       industry: "Retail",          country: "US", creditLimit: 600_000,   paymentTerms: "Net 30" },
  { id: "C-006", name: "Northwind Logistics Inc",       industry: "Logistics",       country: "US", creditLimit: 500_000,   paymentTerms: "Net 30" },
  { id: "C-007", name: "Krakow Software Sp. z o.o.",    industry: "Technology",      country: "PL", creditLimit: 400_000,   paymentTerms: "Net 30" },
  { id: "C-008", name: "Sapphire Hotels Ltd",           industry: "Hospitality",     country: "UK", creditLimit: 700_000,   paymentTerms: "Net 45" },
  { id: "C-009", name: "Greystone Mining Corp",         industry: "Mining",          country: "CA", creditLimit: 1_000_000, paymentTerms: "Net 60" },
  { id: "C-010", name: "Caraway Foods Distribution",    industry: "Food Service",    country: "US", creditLimit: 300_000,   paymentTerms: "Net 30" },
  { id: "C-011", name: "Meridian Insurance Group",      industry: "Finance",         country: "US", creditLimit: 1_800_000, paymentTerms: "Net 30" },
  { id: "C-012", name: "Helena Apparel Co",             industry: "Retail",          country: "US", creditLimit: 250_000,   paymentTerms: "Net 30" },
  { id: "C-013", name: "Northstar Logistics Inc",       industry: "Logistics",       country: "US", creditLimit: 200_000,   paymentTerms: "Net 30" },
  { id: "C-014", name: "Riverside Pharmaceutical",      industry: "Healthcare",      country: "US", creditLimit: 900_000,   paymentTerms: "Net 45" },
  { id: "C-015", name: "Ironclad Construction LLC",     industry: "Construction",    country: "US", creditLimit: 1_100_000, paymentTerms: "Net 60" },
  { id: "C-016", name: "Maple Leaf Tech Inc",           industry: "Technology",      country: "CA", creditLimit: 600_000,   paymentTerms: "Net 30" },
  { id: "C-017", name: "Polaris Energy Group",          industry: "Energy",          country: "US", creditLimit: 1_400_000, paymentTerms: "Net 60" },
  { id: "C-018", name: "Hudson Bay Trading Co",         industry: "Wholesale",       country: "CA", creditLimit: 700_000,   paymentTerms: "Net 45" },
  { id: "C-019", name: "Wexford Education Trust",       industry: "Education",       country: "UK", creditLimit: 350_000,   paymentTerms: "Net 60" },
  { id: "C-020", name: "Bauer GmbH",                    industry: "Manufacturing",   country: "DE", creditLimit: 950_000,   paymentTerms: "Net 30" },
  { id: "C-021", name: "Cypress Capital Advisors",      industry: "Finance",         country: "US", creditLimit: 1_300_000, paymentTerms: "Net 30" },
  { id: "C-022", name: "DriftWood Hotels Group",        industry: "Hospitality",     country: "US", creditLimit: 800_000,   paymentTerms: "Net 45" },
  { id: "C-023", name: "Echo Bay Imports",              industry: "Wholesale",       country: "US", creditLimit: 200_000,   paymentTerms: "Net 30" },
  { id: "C-024", name: "Forge Industries",              industry: "Manufacturing",   country: "US", creditLimit: 850_000,   paymentTerms: "Net 45" },
  { id: "C-025", name: "Gemini Health Systems",         industry: "Healthcare",      country: "US", creditLimit: 1_000_000, paymentTerms: "Net 45" },
];

/**
 * Helper: derive an invoice's aging bucket from issueDate, dueDate,
 * and status given the report date.
 *
 * Buckets follow the standard AR aging report:
 *   - "current"  - paid OR not yet due
 *   - "1-30"     - 1 to 30 days past due
 *   - "31-60"    - 31 to 60
 *   - "61-90"    - 61 to 90
 *   - "90+"      - more than 90 days past due
 */
function bucketFor(invoice, reportDateISO) {
  if (invoice.status === "paid") return "current";
  const due = Date.parse(invoice.dueDate);
  const ref = Date.parse(reportDateISO);
  const days = Math.floor((ref - due) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "current";
  if (days <= 30) return "1-30";
  if (days <= 60) return "31-60";
  if (days <= 90) return "61-90";
  return "90+";
}

/**
 * Days overdue as of REPORT_DATE. Negative means not yet due.
 * Paid invoices return 0 by convention.
 */
function daysOverdue(invoice, reportDateISO) {
  if (invoice.status === "paid") return 0;
  const due = Date.parse(invoice.dueDate);
  const ref = Date.parse(reportDateISO);
  const d = Math.floor((ref - due) / (1000 * 60 * 60 * 24));
  return d;
}

const RAW_INVOICES = [
  // Vanguard Tech Solutions (C-001) - large, very reliable, mostly paid
  { id: "INV-1001", customerId: "C-001", issueDate: "2025-11-12", dueDate: "2025-12-12", amount: 187_500, status: "paid",   paidDate: "2025-12-08" },
  { id: "INV-1002", customerId: "C-001", issueDate: "2025-12-08", dueDate: "2026-01-07", amount: 245_000, status: "paid",   paidDate: "2026-01-05" },
  { id: "INV-1003", customerId: "C-001", issueDate: "2026-01-15", dueDate: "2026-02-14", amount: 198_400, status: "paid",   paidDate: "2026-02-12" },
  { id: "INV-1004", customerId: "C-001", issueDate: "2026-02-20", dueDate: "2026-03-22", amount: 220_000, status: "paid",   paidDate: "2026-03-19" },
  { id: "INV-1005", customerId: "C-001", issueDate: "2026-03-25", dueDate: "2026-04-24", amount: 265_750, status: "paid",   paidDate: "2026-04-22" },
  { id: "INV-1006", customerId: "C-001", issueDate: "2026-04-12", dueDate: "2026-05-12", amount: 312_500, status: "unpaid" },

  // Helios Manufacturing Co (C-002) - reliable mid-large
  { id: "INV-1010", customerId: "C-002", issueDate: "2025-11-20", dueDate: "2026-01-04", amount: 145_200, status: "paid",   paidDate: "2025-12-30" },
  { id: "INV-1011", customerId: "C-002", issueDate: "2025-12-15", dueDate: "2026-01-29", amount: 168_900, status: "paid",   paidDate: "2026-01-28" },
  { id: "INV-1012", customerId: "C-002", issueDate: "2026-01-22", dueDate: "2026-03-08", amount: 210_400, status: "paid",   paidDate: "2026-03-05" },
  { id: "INV-1013", customerId: "C-002", issueDate: "2026-02-28", dueDate: "2026-04-14", amount: 155_500, status: "unpaid" },
  { id: "INV-1014", customerId: "C-002", issueDate: "2026-03-30", dueDate: "2026-05-14", amount: 192_800, status: "unpaid" },

  // Pinnacle Financial Services (C-003) - large, perfect payment
  { id: "INV-1020", customerId: "C-003", issueDate: "2025-11-05", dueDate: "2025-12-05", amount: 295_000, status: "paid",   paidDate: "2025-12-01" },
  { id: "INV-1021", customerId: "C-003", issueDate: "2025-12-10", dueDate: "2026-01-09", amount: 312_400, status: "paid",   paidDate: "2026-01-06" },
  { id: "INV-1022", customerId: "C-003", issueDate: "2026-01-18", dueDate: "2026-02-17", amount: 388_900, status: "paid",   paidDate: "2026-02-15" },
  { id: "INV-1023", customerId: "C-003", issueDate: "2026-02-22", dueDate: "2026-03-24", amount: 425_600, status: "paid",   paidDate: "2026-03-22" },
  { id: "INV-1024", customerId: "C-003", issueDate: "2026-03-28", dueDate: "2026-04-27", amount: 360_000, status: "paid",   paidDate: "2026-04-25" },

  // Atlantic Healthcare Partners (C-004) - mid, mostly on time, one slip
  { id: "INV-1030", customerId: "C-004", issueDate: "2025-11-18", dueDate: "2026-01-02", amount: 88_400, status: "paid",   paidDate: "2026-01-08" }, // 6 days late
  { id: "INV-1031", customerId: "C-004", issueDate: "2025-12-22", dueDate: "2026-02-05", amount: 110_200, status: "paid",   paidDate: "2026-02-03" },
  { id: "INV-1032", customerId: "C-004", issueDate: "2026-01-25", dueDate: "2026-03-11", amount: 95_700, status: "paid",   paidDate: "2026-03-10" },
  { id: "INV-1033", customerId: "C-004", issueDate: "2026-03-04", dueDate: "2026-04-18", amount: 124_500, status: "unpaid" },

  // Brookhaven Retail Group (C-005) - chronic late payer
  { id: "INV-1040", customerId: "C-005", issueDate: "2025-11-25", dueDate: "2025-12-25", amount: 67_800, status: "paid",   paidDate: "2026-01-20" }, // 26 days late
  { id: "INV-1041", customerId: "C-005", issueDate: "2025-12-30", dueDate: "2026-01-29", amount: 82_400, status: "paid",   paidDate: "2026-03-02" }, // 32 days late
  { id: "INV-1042", customerId: "C-005", issueDate: "2026-01-28", dueDate: "2026-02-27", amount: 95_100, status: "unpaid" },
  { id: "INV-1043", customerId: "C-005", issueDate: "2026-02-25", dueDate: "2026-03-27", amount: 110_600, status: "unpaid" },
  { id: "INV-1044", customerId: "C-005", issueDate: "2026-03-22", dueDate: "2026-04-21", amount: 78_300, status: "unpaid" },

  // Northwind Logistics Inc (C-006) - mid, on time
  { id: "INV-1050", customerId: "C-006", issueDate: "2025-12-05", dueDate: "2026-01-04", amount: 56_900, status: "paid",   paidDate: "2026-01-02" },
  { id: "INV-1051", customerId: "C-006", issueDate: "2026-01-12", dueDate: "2026-02-11", amount: 71_200, status: "paid",   paidDate: "2026-02-10" },
  { id: "INV-1052", customerId: "C-006", issueDate: "2026-02-18", dueDate: "2026-03-20", amount: 84_500, status: "paid",   paidDate: "2026-03-19" },
  { id: "INV-1053", customerId: "C-006", issueDate: "2026-03-25", dueDate: "2026-04-24", amount: 98_300, status: "unpaid" },
  { id: "INV-1054", customerId: "C-006", issueDate: "2026-04-08", dueDate: "2026-05-08", amount: 105_700, status: "unpaid" },

  // Krakow Software (C-007) - mid, on time
  { id: "INV-1060", customerId: "C-007", issueDate: "2025-11-28", dueDate: "2025-12-28", amount: 48_200, status: "paid",   paidDate: "2025-12-23" },
  { id: "INV-1061", customerId: "C-007", issueDate: "2026-01-08", dueDate: "2026-02-07", amount: 62_400, status: "paid",   paidDate: "2026-02-05" },
  { id: "INV-1062", customerId: "C-007", issueDate: "2026-02-12", dueDate: "2026-03-14", amount: 73_900, status: "paid",   paidDate: "2026-03-13" },
  { id: "INV-1063", customerId: "C-007", issueDate: "2026-03-18", dueDate: "2026-04-17", amount: 81_500, status: "unpaid" },

  // Sapphire Hotels Ltd (C-008) - hospitality, seasonal, slightly late in winter
  { id: "INV-1070", customerId: "C-008", issueDate: "2025-11-10", dueDate: "2025-12-25", amount: 92_400, status: "paid",   paidDate: "2026-01-08" }, // 14 days late
  { id: "INV-1071", customerId: "C-008", issueDate: "2025-12-15", dueDate: "2026-01-29", amount: 78_300, status: "paid",   paidDate: "2026-02-12" }, // 14 days late
  { id: "INV-1072", customerId: "C-008", issueDate: "2026-01-20", dueDate: "2026-03-06", amount: 105_600, status: "paid",   paidDate: "2026-03-04" },
  { id: "INV-1073", customerId: "C-008", issueDate: "2026-02-25", dueDate: "2026-04-11", amount: 124_200, status: "unpaid" },
  { id: "INV-1074", customerId: "C-008", issueDate: "2026-03-30", dueDate: "2026-05-14", amount: 138_900, status: "unpaid" },

  // Greystone Mining Corp (C-009) - heavy industry, Net 60, slow pay
  { id: "INV-1080", customerId: "C-009", issueDate: "2025-11-05", dueDate: "2026-01-04", amount: 188_400, status: "paid",   paidDate: "2026-01-02" },
  { id: "INV-1081", customerId: "C-009", issueDate: "2025-12-22", dueDate: "2026-02-20", amount: 215_700, status: "paid",   paidDate: "2026-02-25" }, // 5 days late
  { id: "INV-1082", customerId: "C-009", issueDate: "2026-01-30", dueDate: "2026-03-31", amount: 245_900, status: "unpaid" },
  { id: "INV-1083", customerId: "C-009", issueDate: "2026-03-12", dueDate: "2026-05-11", amount: 198_500, status: "unpaid" },

  // Caraway Foods Distribution (C-010) - reliable
  { id: "INV-1090", customerId: "C-010", issueDate: "2025-12-08", dueDate: "2026-01-07", amount: 38_900, status: "paid",   paidDate: "2026-01-04" },
  { id: "INV-1091", customerId: "C-010", issueDate: "2026-01-18", dueDate: "2026-02-17", amount: 45_200, status: "paid",   paidDate: "2026-02-15" },
  { id: "INV-1092", customerId: "C-010", issueDate: "2026-02-22", dueDate: "2026-03-24", amount: 51_800, status: "paid",   paidDate: "2026-03-21" },
  { id: "INV-1093", customerId: "C-010", issueDate: "2026-03-30", dueDate: "2026-04-29", amount: 58_400, status: "unpaid" },

  // Meridian Insurance (C-011) - large, very reliable
  { id: "INV-1100", customerId: "C-011", issueDate: "2025-11-12", dueDate: "2025-12-12", amount: 245_000, status: "paid",   paidDate: "2025-12-09" },
  { id: "INV-1101", customerId: "C-011", issueDate: "2025-12-15", dueDate: "2026-01-14", amount: 278_400, status: "paid",   paidDate: "2026-01-12" },
  { id: "INV-1102", customerId: "C-011", issueDate: "2026-01-22", dueDate: "2026-02-21", amount: 305_600, status: "paid",   paidDate: "2026-02-19" },
  { id: "INV-1103", customerId: "C-011", issueDate: "2026-02-28", dueDate: "2026-03-30", amount: 342_800, status: "paid",   paidDate: "2026-03-28" },
  { id: "INV-1104", customerId: "C-011", issueDate: "2026-04-02", dueDate: "2026-05-02", amount: 398_100, status: "unpaid" },

  // Helena Apparel (C-012) - small retail, late
  { id: "INV-1110", customerId: "C-012", issueDate: "2025-11-22", dueDate: "2025-12-22", amount: 28_900, status: "paid",   paidDate: "2026-01-15" }, // 24 days late
  { id: "INV-1111", customerId: "C-012", issueDate: "2026-01-05", dueDate: "2026-02-04", amount: 34_700, status: "paid",   paidDate: "2026-03-02" }, // 26 days late
  { id: "INV-1112", customerId: "C-012", issueDate: "2026-02-10", dueDate: "2026-03-12", amount: 42_300, status: "unpaid" },
  { id: "INV-1113", customerId: "C-012", issueDate: "2026-03-15", dueDate: "2026-04-14", amount: 38_500, status: "unpaid" },

  // Northstar Logistics (C-013) - new customer, just one invoice
  { id: "INV-1120", customerId: "C-013", issueDate: "2026-04-05", dueDate: "2026-05-05", amount: 24_800, status: "unpaid" },

  // Riverside Pharmaceutical (C-014) - mid healthcare, on time
  { id: "INV-1130", customerId: "C-014", issueDate: "2025-12-02", dueDate: "2026-01-16", amount: 78_400, status: "paid",   paidDate: "2026-01-14" },
  { id: "INV-1131", customerId: "C-014", issueDate: "2026-01-20", dueDate: "2026-03-06", amount: 92_800, status: "paid",   paidDate: "2026-03-04" },
  { id: "INV-1132", customerId: "C-014", issueDate: "2026-02-25", dueDate: "2026-04-11", amount: 105_600, status: "unpaid" },
  { id: "INV-1133", customerId: "C-014", issueDate: "2026-03-28", dueDate: "2026-05-12", amount: 118_900, status: "unpaid" },

  // Ironclad Construction (C-015) - construction, slow industry, mostly OK on Net 60
  { id: "INV-1140", customerId: "C-015", issueDate: "2025-11-08", dueDate: "2026-01-07", amount: 156_400, status: "paid",   paidDate: "2026-01-12" }, // 5 days late
  { id: "INV-1141", customerId: "C-015", issueDate: "2025-12-18", dueDate: "2026-02-16", amount: 198_700, status: "paid",   paidDate: "2026-02-22" }, // 6 days late
  { id: "INV-1142", customerId: "C-015", issueDate: "2026-01-28", dueDate: "2026-03-29", amount: 245_900, status: "unpaid" },
  { id: "INV-1143", customerId: "C-015", issueDate: "2026-03-15", dueDate: "2026-05-14", amount: 215_300, status: "unpaid" },

  // Maple Leaf Tech (C-016) - on time
  { id: "INV-1150", customerId: "C-016", issueDate: "2025-12-12", dueDate: "2026-01-11", amount: 58_400, status: "paid",   paidDate: "2026-01-09" },
  { id: "INV-1151", customerId: "C-016", issueDate: "2026-01-25", dueDate: "2026-02-24", amount: 65_900, status: "paid",   paidDate: "2026-02-22" },
  { id: "INV-1152", customerId: "C-016", issueDate: "2026-02-28", dueDate: "2026-03-30", amount: 78_300, status: "paid",   paidDate: "2026-03-28" },
  { id: "INV-1153", customerId: "C-016", issueDate: "2026-04-04", dueDate: "2026-05-04", amount: 84_700, status: "unpaid" },

  // Polaris Energy (C-017) - oil & gas, Net 60
  { id: "INV-1160", customerId: "C-017", issueDate: "2025-11-15", dueDate: "2026-01-14", amount: 245_900, status: "paid",   paidDate: "2026-01-12" },
  { id: "INV-1161", customerId: "C-017", issueDate: "2025-12-22", dueDate: "2026-02-20", amount: 285_400, status: "paid",   paidDate: "2026-02-25" }, // 5 days late
  { id: "INV-1162", customerId: "C-017", issueDate: "2026-01-30", dueDate: "2026-03-31", amount: 312_700, status: "unpaid" },
  { id: "INV-1163", customerId: "C-017", issueDate: "2026-03-08", dueDate: "2026-05-07", amount: 285_900, status: "unpaid" },

  // Hudson Bay Trading (C-018) - import/export
  { id: "INV-1170", customerId: "C-018", issueDate: "2025-11-25", dueDate: "2026-01-09", amount: 88_400, status: "paid",   paidDate: "2026-01-15" }, // 6 days late
  { id: "INV-1171", customerId: "C-018", issueDate: "2026-01-12", dueDate: "2026-02-26", amount: 105_700, status: "paid",   paidDate: "2026-02-28" }, // 2 days late
  { id: "INV-1172", customerId: "C-018", issueDate: "2026-02-22", dueDate: "2026-04-08", amount: 124_500, status: "unpaid" },
  { id: "INV-1173", customerId: "C-018", issueDate: "2026-03-30", dueDate: "2026-05-14", amount: 138_900, status: "unpaid" },

  // Wexford Education Trust (C-019) - structurally slow payer (UK education)
  { id: "INV-1180", customerId: "C-019", issueDate: "2025-11-02", dueDate: "2026-01-01", amount: 68_900, status: "unpaid" }, // 119 days overdue at report date
  { id: "INV-1181", customerId: "C-019", issueDate: "2025-12-08", dueDate: "2026-02-06", amount: 78_400, status: "unpaid" }, //  83 days overdue
  { id: "INV-1182", customerId: "C-019", issueDate: "2026-01-15", dueDate: "2026-03-16", amount: 85_700, status: "unpaid" }, //  45 days overdue
  { id: "INV-1183", customerId: "C-019", issueDate: "2026-02-22", dueDate: "2026-04-23", amount: 92_300, status: "unpaid" }, //   7 days overdue

  // Bauer GmbH (C-020) - German, on time
  { id: "INV-1190", customerId: "C-020", issueDate: "2025-12-05", dueDate: "2026-01-04", amount: 142_400, status: "paid",   paidDate: "2026-01-03" },
  { id: "INV-1191", customerId: "C-020", issueDate: "2026-01-18", dueDate: "2026-02-17", amount: 168_900, status: "paid",   paidDate: "2026-02-15" },
  { id: "INV-1192", customerId: "C-020", issueDate: "2026-02-22", dueDate: "2026-03-24", amount: 185_700, status: "paid",   paidDate: "2026-03-22" },
  { id: "INV-1193", customerId: "C-020", issueDate: "2026-03-28", dueDate: "2026-04-27", amount: 198_400, status: "paid",   paidDate: "2026-04-25" },
  { id: "INV-1194", customerId: "C-020", issueDate: "2026-04-15", dueDate: "2026-05-15", amount: 215_600, status: "unpaid" },

  // Cypress Capital Advisors (C-021) - large, on time
  { id: "INV-1200", customerId: "C-021", issueDate: "2025-12-10", dueDate: "2026-01-09", amount: 198_400, status: "paid",   paidDate: "2026-01-07" },
  { id: "INV-1201", customerId: "C-021", issueDate: "2026-01-20", dueDate: "2026-02-19", amount: 225_700, status: "paid",   paidDate: "2026-02-17" },
  { id: "INV-1202", customerId: "C-021", issueDate: "2026-02-28", dueDate: "2026-03-30", amount: 258_400, status: "paid",   paidDate: "2026-03-28" },
  { id: "INV-1203", customerId: "C-021", issueDate: "2026-04-05", dueDate: "2026-05-05", amount: 285_900, status: "unpaid" },

  // === DriftWood Hotels Group (C-022) - the big risk story ===
  { id: "INV-1210", customerId: "C-022", issueDate: "2025-11-08", dueDate: "2025-12-23", amount: 145_700, status: "unpaid" }, // 128 days overdue
  { id: "INV-1211", customerId: "C-022", issueDate: "2025-12-15", dueDate: "2026-01-29", amount: 168_900, status: "unpaid" }, //  91 days overdue
  { id: "INV-1212", customerId: "C-022", issueDate: "2026-01-22", dueDate: "2026-03-08", amount: 185_400, status: "unpaid" }, //  53 days overdue
  { id: "INV-1213", customerId: "C-022", issueDate: "2026-02-28", dueDate: "2026-04-14", amount: 198_700, status: "unpaid" }, //  16 days overdue
  { id: "INV-1214", customerId: "C-022", issueDate: "2026-03-25", dueDate: "2026-05-09", amount: 142_300, status: "unpaid" }, //   not yet due
  // Total exposure: 841,000 against 800,000 credit limit -> over limit

  // Echo Bay Imports (C-023) - small, sporadic
  { id: "INV-1220", customerId: "C-023", issueDate: "2025-12-15", dueDate: "2026-01-14", amount: 18_500, status: "paid",   paidDate: "2026-01-25" }, // 11 days late
  { id: "INV-1221", customerId: "C-023", issueDate: "2026-02-08", dueDate: "2026-03-10", amount: 24_700, status: "paid",   paidDate: "2026-03-22" }, // 12 days late
  { id: "INV-1222", customerId: "C-023", issueDate: "2026-03-22", dueDate: "2026-04-21", amount: 31_400, status: "unpaid" },

  // Forge Industries (C-024) - reliable
  { id: "INV-1230", customerId: "C-024", issueDate: "2025-11-20", dueDate: "2026-01-04", amount: 95_400, status: "paid",   paidDate: "2026-01-02" },
  { id: "INV-1231", customerId: "C-024", issueDate: "2025-12-28", dueDate: "2026-02-11", amount: 112_700, status: "paid",   paidDate: "2026-02-09" },
  { id: "INV-1232", customerId: "C-024", issueDate: "2026-02-05", dueDate: "2026-03-22", amount: 128_900, status: "paid",   paidDate: "2026-03-20" },
  { id: "INV-1233", customerId: "C-024", issueDate: "2026-03-15", dueDate: "2026-04-29", amount: 145_700, status: "unpaid" },

  // Gemini Health Systems (C-025) - mid, occasional late
  { id: "INV-1240", customerId: "C-025", issueDate: "2025-11-12", dueDate: "2025-12-27", amount: 105_700, status: "paid",   paidDate: "2026-01-08" }, // 12 days late
  { id: "INV-1241", customerId: "C-025", issueDate: "2025-12-22", dueDate: "2026-02-05", amount: 128_400, status: "paid",   paidDate: "2026-02-15" }, // 10 days late
  { id: "INV-1242", customerId: "C-025", issueDate: "2026-01-28", dueDate: "2026-03-14", amount: 142_900, status: "paid",   paidDate: "2026-03-25" }, // 11 days late
  { id: "INV-1243", customerId: "C-025", issueDate: "2026-03-08", dueDate: "2026-04-22", amount: 168_500, status: "unpaid" },
  { id: "INV-1244", customerId: "C-025", issueDate: "2026-04-12", dueDate: "2026-05-27", amount: 185_900, status: "unpaid" },
];

/**
 * Pre-compute aging bucket and daysOverdue once at module load. The
 * report date is fixed for the demo so this is stable. We expose the
 * enriched array as INVOICES so the analytics functions never need
 * to recompute these values per-call.
 */
export const INVOICES = RAW_INVOICES.map((inv) => ({
  ...inv,
  agingBucket: bucketFor(inv, REPORT_DATE),
  daysOverdue: daysOverdue(inv, REPORT_DATE),
}));

/** Quick lookup helpers - used by analytics functions. */
export const CUSTOMER_BY_ID = new Map(CUSTOMERS.map((c) => [c.id, c]));
export const INVOICES_BY_CUSTOMER = (() => {
  const m = new Map();
  for (const inv of INVOICES) {
    if (!m.has(inv.customerId)) m.set(inv.customerId, []);
    m.get(inv.customerId).push(inv);
  }
  return m;
})();
