---
name: University reputation sources
description: Source attribution rules for public university rankings and student review scores.
---

Each published university rank or student review score must have a named, clickable source for that specific metric. Rankings and review scores may come from different sources; do not infer a missing rank from an overall ranking, a similar institution, or a search result for a different school. Keep unsupported metrics blank.

**Why:** The university catalog contains alternate and historical names, while public profiles can expose reviews without the requested ranking or vice versa.

**How to apply:** Match a source to the exact institution before adding it, keep citation metadata with each metric, and only render metrics that have both a value and a source.

The user chose 180 days as the review-rating freshness period. Warn only after more than 180 days since verification, not on day 180; retain the score and citation.

**Why:** The user explicitly approved this period for helping visitors identify potentially outdated review scores.

**How to apply:** Preserve this product threshold when changing review freshness behavior, with warnings available in Russian and English.

Mastersportal may reject automated availability requests with HTTP 403. Do not treat this as evidence that a citation or its rating is invalid.

**Why:** A live check from the workspace returned HTTP 403 across the reputation sources, so automated reachability alone cannot distinguish missing pages from bot protection.

**How to apply:** Keep such results diagnostic, request manual browser verification before changing source data, and never remove ratings solely because an automated request was blocked.
