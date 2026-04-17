---
id: dunning-collections
title: Dunning and Collections Escalation
owner: Collections Team
version: 5.1
---

# Dunning and Collections Escalation

## What dunning is for

Dunning is the structured sequence of reminders and escalations we use when an invoice goes past due. It has two purposes: to recover the cash, and to create a paper trail that stands up if the case ever goes to legal.

The cadence below is the default for B-category customers. A-category customers follow a softer version. C- and D-category customers are on an accelerated version with tighter steps.

## Default cadence (B-category)

| Level | Trigger (days past due) | Action | Owner |
| --- | --- | --- | --- |
| L1 | +7 | Friendly reminder email, copy of the invoice attached | Automated (SAP F150) |
| L2 | +21 | Second reminder, firmer tone, phone follow-up attempted | Collector |
| L3 | +45 | Formal demand letter, credit hold applied | Collector + Credit |
| L4 | +60 | Final notice, case review with Credit Manager | Credit Manager |
| L5 | +90 | Handover to external collections or legal | Credit Director |

L1 and L2 are run from SAP on a weekly dunning cycle. L3 through L5 are manual — they require a judgement call on whether to escalate, negotiate a payment plan, or pause while a dispute is resolved.

## When to pause dunning

Dunning is paused, not skipped, when the customer has a formal dispute open on the invoice. The pause lasts until the dispute is resolved and the invoice is re-aged from the resolution date. If the dispute turns out to be invalid, dunning resumes from the level it was at when paused.

Dunning is never paused because the customer "promised to pay tomorrow". A promise to pay is logged in the collector's notes and followed up. If the promise is broken, the case moves up one level the next business day.

## Accelerated cadence (C and D)

| Level | Days past due |
| --- | --- |
| L1 | +3 |
| L2 | +10 |
| L3 | +21 |
| L4 | +35 |
| L5 | +60 |

On arriving at L3, credit hold is applied automatically. The analyst cannot override without Credit Manager approval.

## Phone calls

Emails alone recover maybe 40 to 50 percent of simple late payments. Adding a structured phone call at L2 lifts recovery by another 20 percent and shortens the average days-to-resolution by about a week. The collector's phone notes are logged in the credit case with: time of call, who was spoken to, what was committed, and the next action date.

## Payment plans

A payment plan is a documented agreement to settle a balance over two or more installments. Requirements:

- Signed by a customer representative with clear authority (finance director or above).
- First installment is typically 20% or more of the outstanding balance and due on signing.
- Schedule does not stretch beyond 180 days without Credit Director approval.
- Customer accepts that a missed installment triggers immediate acceleration of the full remaining balance.

Payment plans sit in the collector's notes and as a side-agreement document attached to the customer master.

## Handover to legal or external agency

The decision to move a case to L5 is made jointly by the Credit Director and Legal. Inputs to the decision: the age and size of the balance, the customer's engagement level, the cost of action, and whether the customer is still trading. Once a case is with an external agency, all communication runs through them — the collector does not contact the customer directly.
