---
id: collections-metrics
title: Key Collections Metrics (DSO, CEI)
owner: Global Credit Team + FP&A
version: 2.7
---

# Key Collections Metrics

## Why measurement matters

Credit and collections is one of the few functions where performance translates directly into cash on the balance sheet. A one-day improvement in DSO releases working capital proportional to one day of sales. On a group with 3Bn in annual revenue, that is roughly 8.2M in cash.

Two metrics drive the scoreboard: DSO and CEI. Others (ADD, best possible DSO, dispute resolution time) support and explain the top-line numbers.

## DSO — Days Sales Outstanding

DSO measures how long it takes on average to collect revenue. Calculation:

```
DSO = (Total AR / Total credit sales in the period) * number of days in the period
```

We use a three-month rolling DSO as the primary view. It smooths out month-end lumpiness without hiding a genuine trend.

**What DSO does not tell you:**

- A rising DSO can mean slower collections, longer payment terms, or a shift in customer mix. Always decompose before drawing conclusions.
- DSO is distorted by seasonality. Compare like periods year on year, not sequential months.
- A customer that pays late with a high volume drags DSO up more than many small late payers. The size-weighted ageing is the better input for action.

## Best Possible DSO

The lowest DSO achievable if every customer paid exactly on their term. It is calculated from the invoice mix and terms currently on the ledger. The gap between actual DSO and best-possible DSO is the collections efficiency opportunity.

## CEI — Collection Effectiveness Index

CEI measures how effectively we collect what was due in a given period.

```
CEI = ((Opening AR + period credit sales - Closing total AR) /
       (Opening AR + period credit sales - Closing current AR)) * 100
```

A CEI of 100% means we collected everything that came due. Our target is 92% or better at the group level. Below 85% is a red flag that triggers a credit committee review.

CEI is harder to game than DSO — shifting terms or pulling cash from next month does not help the index — which is why it sits alongside DSO as a dual metric.

## ADD — Average Days Delinquent

ADD = DSO - Best Possible DSO

Pure measure of lateness. Isolates the collections performance from the commercial decision about payment terms. Useful when comparing portfolios with different term mixes.

## Portfolio-level metrics

At the collector level we also track:

- **% current (on time)** — share of the portfolio not yet due or paid on time.
- **Past due %** — share of the portfolio over the due date.
- **Past due >60d %** — share of the portfolio more than 60 days past due, the single strongest leading indicator of a bad debt.
- **Dispute resolution time** — average working days from logging to closing.
- **Promise-to-pay kept rate** — percentage of promises that land on the committed date.

## Benchmark targets

Indicative — actual targets are set each year by entity.

| Metric | Target |
| --- | --- |
| DSO (3m rolling) | within 3 days of best possible |
| CEI | 92% or better |
| Past due > 60 days | less than 3% of total AR |
| % promise-to-pay kept | 75% or better |
| Dispute resolution time | 12 working days average |

## Cadence

- Daily: collections dashboard with past-due balances by collector.
- Weekly: DSO, CEI, watchlist, top 20 overdue.
- Monthly: full scorecard by entity, sales org, and region; reviewed by the Credit Director and CFO.
- Quarterly: benchmarking against external peer data and internal annual targets.

## What the metrics are not for

Metrics are a tool, not a goal. A collector who hits the DSO target by allowing a single large customer to take bigger deductions is making the number look better at the cost of margin. The credit manager reviews the mix of behaviours behind the numbers each quarter — not just the numbers themselves.
