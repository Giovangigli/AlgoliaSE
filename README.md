# Algolia Restaurant Discovery Demo

A restaurant discovery experience built with Algolia to demonstrate:
- instant search
- geo-aware ranking
- progressive filtering
- explainable relevance
- intent-oriented discovery

This project was intentionally designed as a realistic Solutions Engineering demo rather than a pure frontend exercise.

---

# Demo Goals

The objective of this project was not only to reproduce a restaurant search interface, but to demonstrate how Algolia can improve restaurant discovery through:
- as-you-type search
- contextual relevance
- geo-search
- explainable ranking
- discovery-oriented UX
- lightweight intent enrichment

The implementation intentionally avoids over-engineering and focuses on demonstrating product value clearly and quickly.

---

# Why Algolia

Restaurant discovery is a high-intent experience where users expect:
- immediate feedback
- typo tolerance
- mobile-friendly interactions
- contextual recommendations
- low-friction filtering

Traditional database querying or delayed search interactions create unnecessary friction.

Algolia enables:
- instant search refinement
- configurable ranking strategies
- geo-aware discovery
- faceting
- fast response times
- explainable relevance

---

# Search Experience Design

The experience was designed around progressive discovery rather than exact-match search.

Users can:
- search directly
- browse nearby restaurants
- refine by cuisine
- explore ranking modes
- understand why results appear

The application intentionally avoids empty landing states. Restaurants are displayed immediately using geo-context to reduce friction and accelerate discovery.

---

# Discovery Modes

The interface includes lightweight “discovery modes” that simulate different ranking strategies.

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

# Explainable Ranking

Each restaurant card includes a “Why this result?” section.

This was intentionally added because explainability is frequently discussed during enterprise search evaluations.

The explanations surface:
- geo relevance
- cuisine match
- ratings/review signals
- discovery mode influence
- experiential intent signals

This makes ranking decisions easier to understand for both end users and business stakeholders.

---

# Intent-Based Discovery

One challenge identified during implementation was that natural-language restaurant intent queries such as:
- “date night”
- “wine bar”
- “romantic dinner”

were not well represented in the original dataset.

To improve discovery without introducing unnecessary complexity, the dataset was enriched with lightweight derived metadata:
- `experience_tags`

These tags are inferred from existing restaurant attributes such as:
- dining style
- pricing
- review volume
- cuisine type

This enables more natural discovery-oriented queries while remaining fully transparent and explainable.

Examples:
- `date night`
- `romantic`
- `wine bar`
- `cheap eats`
- `popular`
- `hidden gem`

This was intentionally implemented as lightweight enrichment rather than introducing unnecessary ML or vector complexity for the scope of this assignment.

---

# Technical Decisions

## Why Algolia JS Helper instead of InstantSearch.js

The assignment explicitly requested implementation without InstantSearch.js.

Using the Algolia JS Helper provided:
- lower-level relevance control
- direct management of search state
- explicit control over refinements and ranking behavior

This also better demonstrates understanding of Algolia’s search workflow.

---

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

If permission is denied, the experience falls back gracefully to a default location.

Geo ranking was intentionally emphasized because local context is critical in restaurant discovery use cases.

---

# UX Decisions

The UI intentionally remains simple and operationally realistic.

Focus areas:
- fast readability
- clear hierarchy
- minimal cognitive load
- mobile-friendly interactions
- explainable discovery

The goal was not to create a visually experimental interface, but rather a believable production-oriented search experience suitable for a restaurant reservation platform demo.

---

# Tech Stack

- Algolia Search
- Algolia JS Helper
- Vanilla JavaScript
- HTML/CSS
- Node.js ingestion scripts

---

# Local Development

Install dependencies:

```bash
npm install
```

Prepare the dataset:

```bash
npm run prepare-data
```

Seed the Algolia index:

```bash
npm run seed
```

Run locally:

```bash
npm start
```

---

# Environment Variables

Create a `.env` file:

```env
ALGOLIA_APP_ID=YOUR_APP_ID
ALGOLIA_ADMIN_API_KEY=YOUR_ADMIN_KEY
ALGOLIA_SEARCH_API_KEY=YOUR_SEARCH_KEY
ALGOLIA_INDEX_NAME=restaurants
```

---

# Search Configuration

## Searchable Attributes

```js
[
  'name',
  'food_type',
  'experience_tags',
  'dining_style',
  'neighborhood',
  'city'
]
```

## Facets

```js
[
  'food_type'
]
```

## Geo Search

Restaurants are indexed with:

```js
_geoloc: {
  lat,
  lng
}
```

---

# Example Discovery Queries

The experience was intentionally optimized for both exact search and intent-oriented discovery.

Example queries:
- sushi
- italian
- steak
- wine bar
- date night
- romantic
- hidden gem
- brunch

---

# What I Would Extend Next

Given additional time, the next improvements would likely include:
- query suggestions
- semantic search / NeuralSearch
- personalization strategies
- analytics-driven ranking optimization
- A/B testing different discovery strategies
- richer mobile filter interactions

---

# Assignment Philosophy

The implementation intentionally prioritizes:
- clarity over complexity
- relevance over visual effects
- explainability over abstraction
- realistic search/product thinking over framework sophistication

The objective was to demonstrate how Algolia can be positioned strategically within a modern discovery experience from a Solutions Engineering perspective.