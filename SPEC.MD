# Specification: Snyk Wrapped 2025 (Backend Engine)

## 1. Goal and Purpose

The goal of this project is to build a data aggregation engine that generates a "Year in Review" summary for a Snyk Organization. Much like "Spotify Wrapped," this engine will transform dry security metrics (vulnerabilities, scans, patches) into engaging, human-centric insights.

The final deliverable is a set of backend services/functions that query the Snyk API and produce a structured JSON payload representing the user's/org's security journey throughout 2024-2025.

## 2. Background and Context

**Snyk** is a developer-first security platform that scans code, dependencies, containers, and cloud infrastructure for vulnerabilities.

* **Orgs and Projects:** Users belong to an Organization (`org_id`). Organizations contain Projects, which represent specific code repositories or cloud environments.
* **Issues:** Vulnerabilities found during scans. These can be `resolved` (fixed) or `open`.
* **Remediation:** The act of fixing an issue, usually via a version upgrade or code change.

## 3. Technical Stack

* **Language:** TypeScript
* **Runtime:** Node.js
* **API Protocol:** REST (JSON API 1.0 compliant)
* **Authentication:** Snyk API Key (Bearer Token)

---

## 4. Deliverable Sections

### Section A: The "Impact" Module (Volume Stats)

**Scope:** Aggregate the total work performed in the organization over the last 12 months.

* **Insight:** Total vulnerabilities fixed, total scans performed.
* **Required Endpoint:** `GET /orgs/{org_id}/issues`.
* **Logic:**
1. Fetch issues with `status=resolved`.
2. Filter locally or via query params for `resolved_at` within the year 2024-2025.
3. Count by `effective_severity_level` (Critical, High, Medium, Low).


* **Example API Call:**
```typescript
// GET /orgs/{org_id}/issues?version=2024-10-15&status=resolved&limit=100

```



### Section B: The "Remediation Personality" Module (Types)

**Scope:** Determine what *kind* of developer the user is based on the issues they fix.

* **Insight:** Breakdown of work by Snyk Product (Code, Open Source, Container, IaC).
* **Logic:**
1. Using the results from Section A, aggregate by the `type` attribute.
2. Mapping:
* `package_vulnerability` -> "Open Source Defender"
* `code` -> "Clean Code Craftsperson"
* `cloud` / `config` -> "Infrastructure Architect"




* **Data Point:** Percentage breakdown of fixed issues per type.

### Section C: The "Ecosystem Hall of Fame" Module

**Scope:** Identify the programming languages and package managers most used/secured.

* **Insight:** "Your most secured ecosystem was **npm**."
* **Required Endpoint:** `GET /orgs/{org_id}/projects`.
* **Logic:**
1. Fetch all projects in the Org.
2. Aggregate by the `type` attribute (e.g., `npm`, `maven`, `pypi`, `gomod`).
3. Find the mode (most frequent) ecosystem.


* **Example Payload Inspection:**
```json
{
  "attributes": {
    "type": "npm", 
    "origin": "github"
  }
}

```



### Section D: The "Temporal Hero" Module (Activity Trends)

**Scope:** Identify when the organization was most active in security remediation.

* **Insight:** "September was your busiest month. You fixed 40% of your issues on Tuesdays!"
* **Required Endpoint:** `GET /orgs/{org_id}/audit_logs/search`.
* **Logic:**
1. Query events like `org.project.fix_pr.auto_open` or `org.project.test`.
2. Group event timestamps by Month and Day of the Week.
3. Identify the peak periods.



---

## 5. Implementation Instructions for AI Agent

1. **Client Setup:** Create a `SnykClient` class using `axios` or `fetch`. Implement a rate-limit handler (exponential backoff) as Snyk has rate limits.
2. **Versioning:** Every request **must** include the `version` query parameter (use `2024-10-15` or latest from spec).
3. **Pagination:** Implement a recursive or loop-based fetcher that follows the `links.next` cursor provided in the response metadata to ensure all data for the year is captured.
4. **Data Modeling:** Create a `SnykWrapped` interface that holds the calculated results of Sections A through D.
5. **Output:** Create an endpoint `GET /wrapped/:org_id` that triggers the aggregation and returns the final JSON.

### Sample Data Structure for Coding Agent

```typescript
interface SnykWrapped2025 {
  impact: {
    totalFixed: number;
    severityBreakdown: { critical: number; high: number; med: number; low: number };
  };
  personality: {
    primaryRole: string; // e.g., "Infrastructure Architect"
    distribution: Record<string, number>;
  };
  ecosystem: {
    topLanguage: string; // e.g., "JavaScript"
    topManager: string; // e.g., "npm"
  };
  timeline: {
    busiestMonth: string;
    busiestDay: string;
  };
}

```

---

## 6. Final Deliverable

The implementation should be a clean, modular Node/TS project. Each section above should be a separate service file (e.g., `impactService.ts`, `ecosystemService.ts`) to allow for independent testing and scaling.
