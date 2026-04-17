---
id: dispute-resolution
title: Dispute and Deduction Resolution
owner: Collections + Customer Service
version: 3.6
---

# Dispute and Deduction Resolution

## What counts as a dispute

A dispute is any invoice or part of an invoice that the customer is not willing to pay pending resolution of an issue. The issue might be commercial (price mismatch, promotion not honored), logistical (short delivery, damaged goods), or administrative (missing PO, wrong bill-to, tax error).

A deduction is similar but specific to cash application: the customer pays an invoice minus an amount they have decided to withhold. Until the deduction is justified by a credit note or written off, it sits as an open item on the account.

## Logging a dispute

Every dispute goes into the dispute management tool with a minimum of:

- Invoice number and disputed amount.
- Dispute reason code, selected from a controlled list.
- A free-text description of what the customer is actually claiming.
- Target resolution date (calculated from the reason code).

Controlled reason codes keep the reporting clean. The current list has 18 codes grouped under four families:

1. **Pricing** — unit price wrong, discount not applied, currency error.
2. **Delivery** — short shipment, wrong product, damage on arrival.
3. **Documentation** — wrong PO, missing delivery note, wrong bill-to.
4. **Commercial** — rebate not accrued, promo not honored, retro discount.

Free-text is for context only. Reporting is driven by the code.

## Ownership

Every dispute has an owner — a named person, not a team. The owner depends on the reason family:

- Pricing and commercial disputes: Sales + Credit.
- Delivery disputes: Customer Service + Supply Chain.
- Documentation disputes: Collections + Master Data.

Collections remains the single point of contact with the customer. Internal owners feed the answer back to collections, who closes the loop with the customer.

## Service level

Target time to resolve:

- Pricing or documentation: 10 working days.
- Delivery: 15 working days.
- Commercial: 20 working days.

A dispute open beyond the target without a credible next action is escalated to the Credit Manager for a decision: push harder, accept the customer's claim and issue a credit note, or reject and resume dunning.

## Credit note approval

Resolving a dispute often requires a credit note. Approval levels match the credit limit matrix:

| Credit note value | Approver |
| --- | --- |
| Up to 5,000 | Team Lead |
| 5,001 to 50,000 | Credit Manager |
| 50,001 to 250,000 | Credit Director + Commercial Director |
| Above 250,000 | CFO |

The customer does not see the approval process. They see a single credit note on their account with the invoice number and the reason.

## Write-offs on the dispute side

When a dispute is found to be invalid but the amount is too small to chase economically, the collector can recommend a small-balance write-off. Limits:

- Up to 50 per item, aggregated monthly.
- Monthly total per customer capped at 500.
- Anything above requires a formal write-off approval (see the Bad Debt Provisioning and Write-off policy).

Small-balance write-offs are reported quarterly and reviewed for patterns — a customer that routinely makes small "rounding" deductions is a flag for the account manager.

## Why this matters

Disputes are one of the largest causes of elevated DSO. Resolving them quickly protects cash flow and, just as importantly, removes friction from the customer relationship. An invoice that sits in dispute for six months is effectively lost even if we are technically right.
