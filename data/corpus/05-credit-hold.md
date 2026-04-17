---
id: credit-hold
title: Credit Hold and Order Release
owner: Credit Team + Customer Service
version: 3.4
---

# Credit Hold and Order Release

## What credit hold means

When a customer is on credit hold, new sales orders are blocked in SAP and cannot be delivered until the hold is released. It is the single most effective tool we have for protecting receivables — and also the single most unpopular one with sales, so clear rules are essential.

## What triggers a hold

An order is placed on automatic credit hold when any of the following is true at the time the order is saved:

- The open receivable plus the new order exceeds the credit limit.
- An invoice is more than 45 days past due (30 days for C-category, 15 days for D-category).
- The customer's credit block flag is set (e.g., sanctions hit, compliance issue, pending annual review).
- A formal dispute above 100,000 EUR has been open for more than 45 days.

Automatic holds happen at order entry, not at delivery. This catches the issue early and gives time to fix it before the warehouse picks stock.

## Release process

A credit analyst reviews every held order. The possible outcomes:

- **Release** — the issue has been resolved (payment received, dispute closed, limit increased).
- **Partial release** — the order is split, and the portion covered by available credit is released. The rest stays on hold.
- **Convert to pro-forma** — customer pays in advance for this order.
- **Reject** — the order is canceled and sales is notified.

Target response time is four working hours during local business hours. In practice, routine releases are done in under an hour. Complex cases (negotiating a one-off limit increase, structuring a payment plan) take longer and are flagged to sales with an expected resolution time.

## The role of customer service

Customer service is the front line with the customer. When an order is held:

- Customer service receives an automated notification with the reason.
- The sales rep is cc'd.
- If the held balance is small and payment is expected soon, customer service can ask the customer for a proof of payment and, once it arrives, forward it to credit for release.

Customer service does not release orders themselves. That authority is restricted to credit.

## Overrides

In rare cases, a credit hold is overridden to protect a strategic delivery or to honor a prior commitment. The rules:

- Overrides above 250,000 EUR require Credit Director sign-off.
- Overrides above 1,000,000 EUR require CFO sign-off.
- Every override is logged with a reason, an expected recovery date, and a responsible owner.
- The outstanding balance is reported weekly until it is cleared.

Sales cannot request an override that exceeds 150% of the standing limit.

## Review of customers on hold

A customer on hold for more than 14 consecutive days moves into an "extended hold" category and is reviewed by the Credit Manager. Options:

- Reduce or remove the credit limit.
- Negotiate a payment plan to clear the backlog.
- Move to pro-forma for all future orders.
- Handover to collections escalation.

The longer a customer sits on hold, the less likely they are to come back. Extended hold triggers a clear decision — not drift.

## Reporting

Credit publishes a weekly held-orders report to sales leadership showing: the number of held orders, their total value, the reasons, and the age of the hold. The metric that matters most is average age of held orders; the target is under five working days.
