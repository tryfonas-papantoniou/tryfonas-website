---
id: payment-terms
title: Payment Terms and Early-Payment Discounts
owner: Global Credit Team
version: 2.9
---

# Payment Terms and Early-Payment Discounts

## Standard terms

The group's standard payment term is **Net 30 days from invoice date**. Every customer inherits this term at onboarding unless a different term is approved in writing.

Common alternative terms in use across the business:

- **Net 14** — new or higher-risk customers, some distributor channels.
- **Net 45** — large retail accounts with contractual terms.
- **Net 60** — public-sector customers, a small number of legacy contracts.
- **End-of-month plus N** — e.g., EOM + 30, common with French and Italian customers.
- **Pro-forma** — payment before delivery, used for D-category risk or accounts on credit hold.

## Who can change the standard term

Non-standard payment terms require approval because they have a direct impact on working capital. A single day of extra term on the full book is worth roughly 2.7M EUR in cash tied up in receivables, so this is not negotiable case-by-case at the rep level.

| Requested term | Approver |
| --- | --- |
| Net 45 or EOM+15 | Credit Manager |
| Net 60 or EOM+30 | Regional Credit Director + Commercial Director |
| Anything beyond Net 60 | CFO |

Approvals are logged in the customer master and reviewed annually. A non-standard term that is not used for 12 months reverts to Net 30 automatically.

## Early-payment discount programme

The programme lets customers take a small discount for paying early. It is optional for the customer and structured as follows:

- **2/10 Net 30** — 2% off if paid within 10 days, otherwise full amount at 30.
- **1/15 Net 45** — 1% off if paid within 15 days, otherwise full at 45.
- **1/10 Net 60** — 1% off if paid within 10 days, otherwise full at 60.

The annualised cost of 2/10 Net 30 is roughly 37% — it is expensive for us, so we only offer it to strategic accounts where the cash acceleration funds a real cost of capital saving or where the customer has conditioned continued trade on the discount.

## How discounts are handled in cash application

When a customer takes the discount, they pay the discounted amount and the short-pay is cleared against the discount reason code in SAP. If the payment arrives after the discount window has closed, the short-pay is treated as a deduction and routed to disputes for resolution — not automatically written off.

The cut-off for the discount window is the value date of the payment on our bank statement, not the date the customer booked the transfer.

## Interest on overdue balances

Interest on overdue balances is governed by the EU Late Payment Directive (in EU jurisdictions) or the applicable local law. Our default position is to reserve the right to charge interest but only invoice it selectively — typically as a negotiation tool on accounts that have developed a consistent pattern of late payment, or at the end of a recovery process.

## Documentation

Every deviation from standard terms sits in the customer master as a hard-coded term code plus an approval note. Audit tests a sample of deviations each quarter and asks for the supporting approval.
