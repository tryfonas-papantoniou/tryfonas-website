---
id: ar-aging
title: Aged Receivables Reporting
owner: Credit + Controlling
version: 3.2
---

# Aged Receivables Reporting

## Purpose

The AR aging report is the weekly (or daily in closing week) source of truth for how much cash is owed to us, by whom, and for how long it has been outstanding. Every cash forecast, every provision calculation, and every collections review starts here.

## Structure

Standard aging buckets used across all entities:

- **Not yet due** — invoice date is within the payment term.
- **1 to 30 days past due**.
- **31 to 60 days past due**.
- **61 to 90 days past due**.
- **91 to 180 days past due**.
- **Over 180 days past due**.

Each bucket is broken down by currency, by sales organisation, and by customer risk category. Credit notes and unapplied cash are shown separately and not netted until the customer level.

## Daily vs. weekly

The report runs weekly as a baseline. It runs daily during the last five working days of the month and the first five of the next month — the period that drives month-end cash and provision numbers.

The daily version is sent by 09:00 local time. The weekly version is sent Monday morning. Both come from the same SAP transaction (S_ALR_87012168 or the equivalent custom report) and are parsed into a standard Excel format by the reporting macro.

## What the team does with it

The aging report is not a reading-only document. It drives action:

- Collectors work their portfolio from oldest bucket to newest each morning.
- Credit managers review the 61+ bucket weekly with the analysts.
- The credit director reviews the 91+ bucket weekly and decides the escalation path for each customer.
- Controlling uses the aging profile to calculate the general provision.
- Sales leadership receives a summary of the top 20 overdue customers, by value, each Monday.

## Watchlist items

Customers that meet any of these criteria appear on a watchlist flagged at the top of the report:

- Balance above 1M and at least one invoice over 45 days past due.
- Balance above 250k and deteriorating two weeks in a row.
- Dispute open above 100k for more than 30 days.
- Customer on credit hold for more than 14 consecutive days.
- Customer is subject to a credit insurance notification.

The watchlist is the agenda for the weekly credit committee.

## Reconciliation to the general ledger

The total of the aging report must tie to the trade receivables line on the balance sheet each month-end. Any difference is investigated and resolved before the books close. Common causes of differences:

- Timing — payment posted to bank but not yet cleared to invoice.
- Currency — aging at transaction currency vs GL at reporting currency.
- Intercompany — netted in one view, not the other.
- Manual journals — accrued credit notes or provision movements not yet mirrored in the subledger.

The reconciliation is signed off by the GL accountant and filed with the month-end folder.

## Parked and blocked items

Invoices that are parked (saved but not posted) or blocked (posted but flagged) do not appear on the aging. They are tracked on a separate report and cleared weekly. A parked or blocked item more than five working days old is escalated — it is almost always the symptom of a stuck process somewhere else.

## Distribution

The aging report goes to: the collections team (detail), credit management (full), sales leadership (summary), controlling (full), FP&A (summary), and — for selected customers — to the sales reps themselves. Distribution is controlled by the reporting team and reviewed annually for access rights.
