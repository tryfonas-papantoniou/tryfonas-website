/**
 * Synthetic end-of-day position data for the reconciliation demo.
 *
 * The story: Brookline Capital is a fictional asset manager. Every
 * trading day they receive a position file from their custodian
 * (the bank that actually holds the securities) and compare it to
 * their internal Investment Book of Record (IBOR). The two should
 * match exactly. When they don't, ops analysts have to find the
 * breaks, classify them, and decide what to do.
 *
 * The data below is hand-tuned to seed exactly four kinds of breaks
 * so the demo always has something interesting to show:
 *
 *   1. Price break          (NVDA  - same trade, different price)
 *   2. Quantity break       (MSFT  - same trade, different qty)
 *   3. Missing in custodian (TSLA  - present in IBOR, not in feed)
 *   4. Settle date drift    (GOOGL - T+2 vs T+3 settlement)
 *
 * The remaining six trades match cleanly so the result panel shows
 * both clean matches and breaks - a more honest demo than one where
 * everything is broken.
 *
 * Identifiers (CUSIP, ISIN) are real-world formatted but the prices
 * and quantities are made up. Trade date 2026-04-15.
 */

export const TRADE_DATE = "2026-04-15";

export const CUSTODIAN_FEED = [
  {
    id: "C-001",
    symbol: "AAPL",
    cusip: "037833100",
    isin: "US0378331005",
    side: "BUY",
    quantity: 5_000,
    price: 184.32,
    currency: "USD",
    tradeDate: "2026-04-15",
    settleDate: "2026-04-17",
  },
  {
    id: "C-002",
    symbol: "MSFT",
    cusip: "594918104",
    isin: "US5949181045",
    side: "BUY",
    quantity: 12_000,
    price: 421.05,
    currency: "USD",
    tradeDate: "2026-04-15",
    settleDate: "2026-04-17",
  },
  {
    id: "C-003",
    symbol: "NVDA",
    cusip: "67066G104",
    isin: "US67066G1040",
    side: "BUY",
    quantity: 3_500,
    price: 882.40,
    currency: "USD",
    tradeDate: "2026-04-15",
    settleDate: "2026-04-17",
  },
  {
    id: "C-004",
    symbol: "GOOGL",
    cusip: "02079K305",
    isin: "US02079K3059",
    side: "SELL",
    quantity: 2_200,
    price: 161.78,
    currency: "USD",
    tradeDate: "2026-04-15",
    settleDate: "2026-04-17",
  },
  {
    id: "C-005",
    symbol: "AMZN",
    cusip: "023135106",
    isin: "US0231351067",
    side: "BUY",
    quantity: 1_800,
    price: 178.94,
    currency: "USD",
    tradeDate: "2026-04-15",
    settleDate: "2026-04-17",
  },
  {
    id: "C-006",
    symbol: "META",
    cusip: "30303M102",
    isin: "US30303M1027",
    side: "BUY",
    quantity: 900,
    price: 504.20,
    currency: "USD",
    tradeDate: "2026-04-15",
    settleDate: "2026-04-17",
  },
  {
    id: "C-007",
    symbol: "JPM",
    cusip: "46625H100",
    isin: "US46625H1005",
    side: "BUY",
    quantity: 4_200,
    price: 198.65,
    currency: "USD",
    tradeDate: "2026-04-15",
    settleDate: "2026-04-17",
  },
  {
    id: "C-008",
    symbol: "AVGO",
    cusip: "11135F101",
    isin: "US11135F1012",
    side: "BUY",
    quantity: 600,
    price: 1_345.10,
    currency: "USD",
    tradeDate: "2026-04-15",
    settleDate: "2026-04-17",
  },
  {
    id: "C-009",
    symbol: "BRK.B",
    cusip: "084670702",
    isin: "US0846707026",
    side: "BUY",
    quantity: 800,
    price: 412.55,
    currency: "USD",
    tradeDate: "2026-04-15",
    settleDate: "2026-04-17",
  },
  {
    id: "C-010",
    symbol: "ORCL",
    cusip: "68389X105",
    isin: "US68389X1054",
    side: "SELL",
    quantity: 3_000,
    price: 124.18,
    currency: "USD",
    tradeDate: "2026-04-15",
    settleDate: "2026-04-17",
  },
];

export const IBOR_POSITIONS = [
  {
    id: "I-001",
    symbol: "AAPL",
    cusip: "037833100",
    isin: "US0378331005",
    side: "BUY",
    quantity: 5_000,
    price: 184.32,
    currency: "USD",
    tradeDate: "2026-04-15",
    settleDate: "2026-04-17",
  },
  {
    // QUANTITY BREAK - IBOR shows 12,500 vs custodian 12,000
    id: "I-002",
    symbol: "MSFT",
    cusip: "594918104",
    isin: "US5949181045",
    side: "BUY",
    quantity: 12_500,
    price: 421.05,
    currency: "USD",
    tradeDate: "2026-04-15",
    settleDate: "2026-04-17",
  },
  {
    // PRICE BREAK - IBOR shows 882.04 vs custodian 882.40 (likely a digit transposition)
    id: "I-003",
    symbol: "NVDA",
    cusip: "67066G104",
    isin: "US67066G1040",
    side: "BUY",
    quantity: 3_500,
    price: 882.04,
    currency: "USD",
    tradeDate: "2026-04-15",
    settleDate: "2026-04-17",
  },
  {
    // SETTLE DATE DRIFT - IBOR shows T+3 settle (Apr 18) vs custodian T+2 (Apr 17)
    id: "I-004",
    symbol: "GOOGL",
    cusip: "02079K305",
    isin: "US02079K3059",
    side: "SELL",
    quantity: 2_200,
    price: 161.78,
    currency: "USD",
    tradeDate: "2026-04-15",
    settleDate: "2026-04-18",
  },
  {
    id: "I-005",
    symbol: "AMZN",
    cusip: "023135106",
    isin: "US0231351067",
    side: "BUY",
    quantity: 1_800,
    price: 178.94,
    currency: "USD",
    tradeDate: "2026-04-15",
    settleDate: "2026-04-17",
  },
  {
    id: "I-006",
    symbol: "META",
    cusip: "30303M102",
    isin: "US30303M1027",
    side: "BUY",
    quantity: 900,
    price: 504.20,
    currency: "USD",
    tradeDate: "2026-04-15",
    settleDate: "2026-04-17",
  },
  {
    id: "I-007",
    symbol: "JPM",
    cusip: "46625H100",
    isin: "US46625H1005",
    side: "BUY",
    quantity: 4_200,
    price: 198.65,
    currency: "USD",
    tradeDate: "2026-04-15",
    settleDate: "2026-04-17",
  },
  {
    id: "I-008",
    symbol: "AVGO",
    cusip: "11135F101",
    isin: "US11135F1012",
    side: "BUY",
    quantity: 600,
    price: 1_345.10,
    currency: "USD",
    tradeDate: "2026-04-15",
    settleDate: "2026-04-17",
  },
  {
    id: "I-009",
    symbol: "BRK.B",
    cusip: "084670702",
    isin: "US0846707026",
    side: "BUY",
    quantity: 800,
    price: 412.55,
    currency: "USD",
    tradeDate: "2026-04-15",
    settleDate: "2026-04-17",
  },
  {
    id: "I-010",
    symbol: "ORCL",
    cusip: "68389X105",
    isin: "US68389X1054",
    side: "SELL",
    quantity: 3_000,
    price: 124.18,
    currency: "USD",
    tradeDate: "2026-04-15",
    settleDate: "2026-04-17",
  },
  {
    // MISSING IN CUSTODIAN - this trade is on the IBOR but absent
    // from the custodian's end-of-day file. Either the trade hasn't
    // settled on their side yet, or it was dropped.
    id: "I-011",
    symbol: "TSLA",
    cusip: "88160R101",
    isin: "US88160R1014",
    side: "BUY",
    quantity: 1_500,
    price: 248.30,
    currency: "USD",
    tradeDate: "2026-04-15",
    settleDate: "2026-04-17",
  },
];
