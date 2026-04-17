---
id: customer-onboarding
title: Customer Onboarding and Credit Check
owner: Master Data + Credit
version: 3.8
---

# Customer Onboarding and Credit Check

## Purpose

Onboarding is the first — and often the last — chance to catch a problem before it ends up as an unrecoverable receivable. This document covers the end-to-end flow from sales request to the moment the customer is active in SAP.

## Stages

1. **Request submitted** — sales files a customer creation request with the legal name, registered address, VAT number, and expected annual revenue.
2. **Duplicate check** — master data searches the customer table by VAT number, then by fuzzy legal name match, to avoid creating a duplicate.
3. **Legal verification** — the registered name and address are confirmed against the local trade registry or equivalent (EU business register, Companies House, the state filing for US customers).
4. **Credit check** — the credit analyst pulls an external report and calculates the provisional limit per the Credit Limit Policy.
5. **KYC and sanctions screening** — the customer is screened against OFAC, EU consolidated list, UK HMT, and UN sanctions. Any partial match is reviewed by compliance before the case can move on.
6. **Account creation** — master data creates the account in SAP, assigns the payment terms, risk category, and credit limit, and notifies sales.

## Service level

Target is five working days from a complete request to an active account. The single biggest cause of delay is an incomplete request — typically a missing VAT number or registered address. Master data rejects incomplete requests on the same day rather than holding them.

## Required documents

- Certificate of incorporation or equivalent registry extract (dated within the last 12 months).
- VAT registration certificate (EU).
- Most recent audited financial statements, where available. For private customers, the most recent unaudited statements or a year-to-date management account are acceptable.
- Bank details on company letterhead, signed by a director, used for refund and credit note processing.
- Beneficial ownership declaration above the 25% threshold.

Where the customer cannot provide audited accounts — most small private companies — the credit analyst relies on the external credit report and sets a conservative starting limit, then reviews after six months.

## Risk categories

At the end of onboarding, the customer is assigned to one of four risk categories:

- **A — low risk**: rated investment grade by a major agency, no payment issues on any group ledger, limit above 1M EUR.
- **B — standard**: most customers sit here, no adverse flags, standard payment terms apply.
- **C — elevated**: recent score downgrade, thin trade history, or a prior dispute history. Watch list, shorter review cycle.
- **D — high risk**: declined external score, litigation history, or a bankruptcy event within the last five years. Restricted to pro-forma or letter of credit only.

The risk category drives the dunning cadence, the review frequency, and whether the customer can carry a limit at all.

## Handover to sales

Once the account is active, sales receives a one-page summary: the approved limit, the payment terms, the risk category, and any conditions attached (e.g., "review after first three deliveries", "letter of credit required for orders above 250k"). Sales signs off on this summary before placing the first order.
