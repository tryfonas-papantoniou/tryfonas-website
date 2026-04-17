---
id: cash-application
title: Cash Application
owner: Cash Application Team
version: 4.0
---

# Cash Application

## Purpose

Cash application is the process of matching incoming customer payments to open invoices on the ledger. Done well, it is invisible. Done badly, it is the root cause of "fake" overdue invoices, wrong dunning letters, and every kind of customer complaint about "I already paid".

## The daily flow

Every morning, the team runs the following sequence:

1. Download the prior day's bank statement (MT940 or camt.054 format).
2. Load into SAP via the electronic bank statement (EBS) transaction.
3. Run auto-match on invoice number, amount, and customer reference.
4. Work the exceptions queue: payments that did not auto-match.
5. Post and clear by the 11:00 cut-off so that the daily cash position is accurate.

Target auto-match rate is 75 to 85 percent. The remaining 15 to 25 percent are exceptions that need a human to decide how to apply the cash.

## Common exceptions

- **One payment covers many invoices.** The customer sends a remittance advice separately. Match by remittance, not by guessing.
- **Payment does not match the invoice amount.** Either the customer took a discount, applied a deduction, or the payment belongs to a different invoice.
- **Payment with no reference.** Requires a phone call or email to the customer to identify the invoices.
- **Payment from a different legal entity than the billed customer.** Often a parent-subsidiary situation. We need written confirmation from both entities before applying.
- **Overpayment.** Posted to an "unapplied cash" account and either offset against the next invoice or refunded per the customer's instruction.

## Remittance advice

The single biggest driver of auto-match rate is remittance quality. We actively work with customers to improve it:

- Remittance sent by email to a dedicated mailbox (remittance@...), parsed automatically.
- Template provided to large customers listing: invoice number, invoice amount, deduction amount, reason code.
- For customers who genuinely cannot send a remittance, the collector sends a payment advice after the match is done to confirm allocation.

## Unapplied cash

Unapplied cash is money that has landed in our bank but has not yet been applied to an invoice. It distorts the aging and, if left unmanaged, grows into a large, hard-to-clean-up balance.

Rules:

- Unapplied items are reviewed daily and cleared within five working days.
- Items older than 30 days are escalated to the Cash Application Manager.
- Items older than 90 days are reported to the Credit Director with a recovery plan.

## Month-end

On the last working day of the month, the cash application team runs a cut-off process:

- Every payment received on the bank by the last working day is applied in that month's books.
- Payments received after the cut-off but with a value date in the month stay in the following month's books.
- Unapplied items are reconciled between the bank side and the general ledger side to catch posting errors.

A clean month-end in cash application is the foundation of a clean AR aging report.

## Key metrics

- **Auto-match rate** — percentage of payments cleared without manual touch.
- **Unapplied balance** — total cash sitting in suspense, aged.
- **Time to clear** — average days between payment arrival and full clearing.

These are published weekly. A drop in auto-match rate is usually the first visible sign of a customer-side process change (new ERP, new payment platform, new remittance format) and is a useful leading indicator.
