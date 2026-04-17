---
id: credit-limit-policy
title: Credit Limit Policy
owner: Global Credit Team
version: 4.2
---

# Credit Limit Policy

## Purpose

This policy defines how we set, review, and change customer credit limits. The goal is to let sales grow the book without exposing the business to losses we can't recover.

## Who it applies to

All trading customers across the group, including intercompany counterparties that carry an external settlement risk. It does not cover cash-in-advance or pro-forma accounts, which are tracked separately.

## How a credit limit is set

Every new customer starts with a provisional limit based on three inputs:

1. **Requested line** — the volume sales expects in the first 12 months.
2. **External credit score** — we use Dun & Bradstreet as the primary source, with a secondary check in Creditsafe for EU counterparties.
3. **Payment history** — if the customer has traded with another group entity, we pull their 12-month payment record from that ledger.

The provisional limit is the lower of: 10% of the customer's net worth, the D&B recommended limit, or the requested line.

## Approval matrix

| Limit requested (EUR) | Approver                           |
| --------------------- | ---------------------------------- |
| Up to 50,000          | Credit Analyst                     |
| 50,001 – 250,000      | Credit Manager                     |
| 250,001 – 1,000,000   | Regional Credit Director           |
| 1,000,001 – 5,000,000 | Global Credit Director             |
| Above 5,000,000       | CFO + Global Credit Director       |

All approvals must be in writing (email is accepted if archived to the credit case folder). Verbal approvals are never valid.

## Annual review

Every active customer is reviewed once per year. The review can trigger one of four outcomes:

- **Confirm** — keep the current limit.
- **Increase** — supported by clean payment history and a fresh external score.
- **Decrease** — triggered by deteriorating DSO, disputes, or score downgrades.
- **Suspend** — the customer moves to pro-forma until the issue is resolved.

Reviews are scheduled in SAP via transaction FD32 and tracked on the credit team's aging review dashboard.

## Off-cycle reviews

An off-cycle review is mandatory when any of the following happens:

- External credit score drops by two or more notches.
- Customer misses two consecutive invoices by more than 30 days past due.
- A disputed invoice above 100,000 EUR stays unresolved for 45 days.
- Sales requests a limit increase above 25% of the current line.

The analyst has five working days to issue a recommendation. A recommendation that cannot be closed in that window is escalated to the Credit Manager.

## Temporary overrides

Sales can request a temporary credit limit increase for a single order — for example, a seasonal peak or a one-off project. Temporary overrides:

- Must be tied to a specific sales order number.
- Expire automatically when the order is invoiced and paid, or after 60 days.
- Cannot exceed 150% of the standing limit.
- Require the same approval level as a permanent increase of the same size.

## Documentation

Every limit decision is stored in the customer master record with: the requested amount, the approval level, the supporting documents (external score PDF, payment history extract), and the date. Audit pulls a monthly sample of 25 decisions across regions.
