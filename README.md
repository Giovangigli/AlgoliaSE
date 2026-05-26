# Algolia Restaurant Discovery Demo

Live demo: https://giovangigli.github.io/AlgoliaSE/

A restaurant discovery experience built with Algolia to demonstrate instant search, geo-aware discovery, cuisine faceting, persistent experience filters, application-level relevance explanations, and lightweight intent enrichment.

---

# Assignment Requirements Covered

- Used Algolia JS Helper.
- Did not use InstantSearch.js.
- Implemented as-you-type restaurant search.
- Implemented cuisine filtering using `food_type`.
- Implemented persistent experience filtering using `experience_tags`.
- Used browser geolocation to prioritize nearby restaurants.
- Added fallback location behavior when geolocation is denied or unavailable.
- Merged `restaurants_list.json` and `restaurants_info.csv`.
- Included a data preparation script.
- Included an Algolia import script.
- Normalized payment options to American Express, Visa, Discover, and MasterCard (but not used in the UI).
- Treated Diners Club and Carte Blanche as Discover cards (but not used in the UI).
- Built a static frontend suitable for GitHub Pages deployment.
- Added a GitHub Actions workflow to seed the Algolia index from GitHub.

---

# Demo Script

Use the live GitHub Pages demo to validate the search experience.

1. Open the deployed demo.
2. Search for `sushi` to show as-you-type restaurant search.
3. Search for `italian` to show cuisine-driven discovery.
4. Use the cuisine filter to demonstrate faceting.
5. Select `Date night` to demonstrate persistent experience filtering.
6. Select `Wine bar` to demonstrate discovery beyond exact restaurant names.
7. Combine a cuisine filter with an experience filter to show multi-dimensional refinement.
8. Switch to `Top Rated` to demonstrate business-oriented sorting signals.
9. Switch to `Hidden Gems` to demonstrate discovery of high-rated restaurants with lower review volume.
10. Deny browser geolocation and reload the page to verify fallback behavior.
11. Open a restaurant card’s `Why this result?` section to show the visible signals used by the UI.

---

# Demo Goals

The objective of this project was not only to reproduce a restaurant search interface, but to demonstrate how Algolia can improve restaurant discovery through:

- as-you-type search
- contextual relevance
- geo-search
- cuisine facets
- persistent experience filters
- application-level relevance explanations
- discovery-oriented UX
- lightweight intent enrichment

The implementation intentionally avoids over-engineering.

---

# Why Algolia

Restaurant discovery is a high-intent experience where users expect:

- immediate feedback
- typo tolerance
- mobile-friendly interactions
- contextual recommendations
- low-friction filtering
- fast refinement across multiple dimensions

Traditional database querying or delayed search interactions create unnecessary friction.

Algolia enables:

- instant search refinement
- configurable ranking strategies
- geo-aware discovery
- faceting
- fast response times
- relevance tuning without rebuilding the whole frontend

---

# Search Experience Design

The experience was designed around progressive discovery rather than exact-match search only.

Users can:

- search directly
- browse nearby restaurants
- refine by cuisine
- refine by experience intent
- explore discovery modes
- understand why results appear

The application intentionally avoids empty landing states. Restaurants are displayed immediately using geo-context to reduce friction and accelerate discovery.

---

# Discovery Modes

The interface includes lightweight discovery modes that demonstrate how different restaurant discovery strategies could be presented to users.

For the scope of this prototype, these modes are implemented at the application layer using Algolia results and restaurant attributes. In a production implementation, the same concept could be moved into Algolia replicas or index-specific ranking strategies so that each mode ranks across the full result set rather than only the returned hits.

## Nearby

Prioritizes geo relevance and proximity.

This demonstrates how Algolia can optimize for immediate local intent, especially on mobile.

## Top Rated

Prioritizes highly-rated restaurants with strong review confidence.

This demonstrates business-oriented ranking strategies.

## Hidden Gems

Prioritizes highly-rated restaurants with lower review volume.

This demonstrates how ranking can surface discovery opportunities beyond pure popularity.

---

# Application-Level Relevance Explanation

Each restaurant card includes a `Why this result?` section.

This was intentionally added because explainability is frequently discussed during enterprise search evaluations.

The explanations surface visible relevance signals such as:

- geo relevance
- cuisine match
- ratings/review signals
- discovery mode influence
- experiential intent signals

This makes the visible relevance signals easier to understand for both end users and business stakeholders. It is intentionally application-level explanation, not a full internal explanation of Algolia’s ranking algorithm.

---

# Intent-Based Discovery

One challenge identified during implementation was that intent queries such as:

- `date night`
- `wine bar`
- `romantic dinner`

were not well represented in the original dataset.

To improve discovery without introducing unnecessary complexity, the dataset was enriched with lightweight derived metadata:

- `experience_tags`

These tags are inferred from existing restaurant attributes such as:

- dining style
- pricing
- review volume
- cuisine type

`experience_tags` is configured as a searchable facet. This allows the UI to support persistent experience filters rather than treating experience chips as one-off text queries.

Examples:

- `date night`
- `romantic`
- `wine bar`
- `cheap eats`
- `popular`
- `hidden gem`

This was intentionally implemented as lightweight enrichment rather than introducing unnecessary complexity for the scope of this assignment.

---

# Image Strategy

The original restaurant image URLs were unreliable in the deployed static experience.

To avoid turning the assignment into a scraping exercise, I tried unsuccessfully to use fallback images based on cuisine and dining style.

---

# Technical Decisions

# Data Pipeline

The provided dataset required merging multiple sources:

- restaurant records
- additional metadata CSV

A dedicated preparation script was created to:

- normalize records
- enrich restaurants with intent tags
- derive discovery signals
- prepare geo-search attributes
- generate a clean Algolia-ready dataset

This mirrors realistic ingestion workflows often encountered during customer implementations.

---

# Geo Relevance

The application uses browser geolocation when available.

If permission is denied, the experience falls back gracefully to a default San Francisco location.

Geo ranking was intentionally emphasized because local context is critical in restaurant discovery use cases.

---

# UX Decisions

The UI intentionally remains simple and operationally realistic.

Focus areas:

- fast readability
- clear hierarchy
- minimal cognitive load
- mobile-friendly interactions
- persistent filter state
- application-level relevance explanation

The goal was not to create a visually experimental interface, but rather a believable production-oriented search experience suitable for a restaurant reservation platform demo.

---

# Local Development

Install dependencies:

```bash
npm install
