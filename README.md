# Snyk Wrapped 2025 - Backend Engine

A data aggregation engine that generates a "Year in Review" summary for a Snyk Organization, focusing on security metrics and human-centric insights.

## Prerequisites

- **Node.js**: Version 20.6.0 or higher (required for native `--env-file` support).
- **Snyk API Token**: A valid Service Account or Personal API token.
- **Snyk Org ID**: The UUID of the organization you wish to analyze.

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Create a `.env` file in the root directory:
   ```env
   SNYK_TOKEN=your-snyk-api-token
   ORG_ID=your-org-id-uuid
   START_DATE=2024-01-01
   END_DATE=2024-12-31
   SNYK_API_VERSION=2025-11-05 # Optional, defaults to 2025-11-05
   ```

## Usage

### 1. Build the Project
Compile the TypeScript source code to JavaScript:
```bash
npm run build
```

### 2. Run the Engine
Execute the Impact Module to generate the stats:
```bash
npm start
```

## Output Format
The engine produces a JSON payload representing the organization's security impact:

```json
{
  "impact": {
    "totalFixed": 150,
    "severityBreakdown": {
      "critical": 10,
      "high": 40,
      "med": 70,
      "low": 30
    }
  }
}
```

## Implementation Details

- **Snyk API**: Uses the REST API v3 (`/orgs/{org_id}/issues`).
- **Optimization**: Fetches only `status=resolved` issues and uses `updated_after` query parameters to minimize data transfer.
- **Rate Limiting**: Implements exponential backoff and respects `retry-after` headers.
- **Pagination**: Automatically follows `links.next` cursors to aggregate all data for the specified period.

## Contributing

Please consult [CONTRIBUTING](./CONTRIBUTING.md) for guidelines on contributing to this project.
