/**
 * Deterministic field-level diff between a custodian feed and an
 * IBOR position file.
 *
 * Why deterministic: the diff itself is a job for code, not an LLM.
 * It must be reproducible, fast, cheap, and auditable - given the
 * same two inputs you should always get the same break list. The
 * LLM only enters the picture later, in the API route, to *explain*
 * each break in plain English.
 *
 * Match key: (symbol, tradeDate). Two records with the same symbol
 * and trade date are considered the same trade and get field-level
 * compared. Records that exist on only one side are flagged as
 * missing on the other.
 *
 * Compared fields: quantity, price, settleDate. (Side is part of the
 * trade identity; if it disagrees we'd treat it as a different trade
 * and surface it as missing on both sides - simpler than introducing
 * a fifth break category for the demo.)
 *
 * Float comparison: prices are compared with a small epsilon to
 * avoid spurious breaks on rounding. The epsilon (0.005) is well
 * below any meaningful market move so anything bigger is a real
 * break worth investigating.
 */

const PRICE_EPSILON = 0.005;

function keyOf(row) {
  return `${row.symbol}|${row.tradeDate}`;
}

function indexBy(rows, getKey) {
  const out = new Map();
  for (const row of rows) out.set(getKey(row), row);
  return out;
}

/**
 * @param {Array} custodian
 * @param {Array} ibor
 * @returns {{
 *   matches: number,
 *   breaks: Array<{
 *     id: string,
 *     tradeKey: string,
 *     category: 'price_break' | 'quantity_break' | 'settle_date_drift'
 *               | 'missing_in_custodian' | 'missing_in_ibor',
 *     custodianRow: object | null,
 *     iborRow: object | null,
 *     field: string | null,
 *     custodianValue: any,
 *     iborValue: any,
 *     delta: number | null,
 *   }>
 * }}
 */
export function diff(custodian, ibor) {
  const cByKey = indexBy(custodian, keyOf);
  const iByKey = indexBy(ibor, keyOf);
  const allKeys = new Set([...cByKey.keys(), ...iByKey.keys()]);

  let matches = 0;
  const breaks = [];
  let breakCounter = 1;
  const nextId = () =>
    `B-${String(breakCounter++).padStart(3, "0")}`;

  // Sort keys to keep the output stable from run to run - useful for
  // the demo and important for any downstream caching.
  const sortedKeys = [...allKeys].sort();

  for (const key of sortedKeys) {
    const c = cByKey.get(key);
    const i = iByKey.get(key);

    if (c && !i) {
      breaks.push({
        id: nextId(),
        tradeKey: key,
        category: "missing_in_ibor",
        custodianRow: c,
        iborRow: null,
        field: null,
        custodianValue: null,
        iborValue: null,
        delta: null,
      });
      continue;
    }
    if (!c && i) {
      breaks.push({
        id: nextId(),
        tradeKey: key,
        category: "missing_in_custodian",
        custodianRow: null,
        iborRow: i,
        field: null,
        custodianValue: null,
        iborValue: null,
        delta: null,
      });
      continue;
    }

    // Both sides have the trade - field-level compare.
    let recordHasBreak = false;

    if (c.quantity !== i.quantity) {
      breaks.push({
        id: nextId(),
        tradeKey: key,
        category: "quantity_break",
        custodianRow: c,
        iborRow: i,
        field: "quantity",
        custodianValue: c.quantity,
        iborValue: i.quantity,
        delta: i.quantity - c.quantity,
      });
      recordHasBreak = true;
    }

    if (Math.abs(c.price - i.price) > PRICE_EPSILON) {
      breaks.push({
        id: nextId(),
        tradeKey: key,
        category: "price_break",
        custodianRow: c,
        iborRow: i,
        field: "price",
        custodianValue: c.price,
        iborValue: i.price,
        delta: Number((i.price - c.price).toFixed(4)),
      });
      recordHasBreak = true;
    }

    if (c.settleDate !== i.settleDate) {
      breaks.push({
        id: nextId(),
        tradeKey: key,
        category: "settle_date_drift",
        custodianRow: c,
        iborRow: i,
        field: "settleDate",
        custodianValue: c.settleDate,
        iborValue: i.settleDate,
        delta: null,
      });
      recordHasBreak = true;
    }

    if (!recordHasBreak) matches++;
  }

  return { matches, breaks };
}

/**
 * Human-friendly category labels for the UI.
 */
export const CATEGORY_LABELS = {
  price_break: "Price break",
  quantity_break: "Quantity break",
  settle_date_drift: "Settlement date drift",
  missing_in_custodian: "Missing in custodian",
  missing_in_ibor: "Missing in IBOR",
};
