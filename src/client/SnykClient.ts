
import { setTimeout } from 'node:timers/promises';

interface SnykIssueAttributes {
  status: string;
  effective_severity_level: string;
  resolution?: {
    resolved_at: string;
  };
  // We can add more if needed
}

export interface SnykIssue {
  id: string;
  type: string;
  attributes: SnykIssueAttributes;
}

interface PaginatedResponse {
  data: SnykIssue[];
  links?: {
    next?: string;
  };
}

export class SnykClient {
  private token: string;
  private baseUrl: string = 'https://api.snyk.io/rest';
  private version: string;

  constructor(token: string, version: string = '2025-11-05') {
    this.token = token;
    this.version = version;
  }

  private async fetchWithRetry(url: string): Promise<Response> {
    const maxRetries = 5;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.api+json',
          },
        });

        if (response.status === 429) {
          // Rate limited
          attempt++;
          const retryAfter = response.headers.get('retry-after');
          const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : 1000 * Math.pow(2, attempt);
          console.warn(`Rate limited. Retrying in ${delay}ms...`);
          await setTimeout(delay);
          continue;
        }

        if (!response.ok) {
           const body = await response.text();
           console.error(`Request failed. URL: ${url}`);
           console.error(`Status: ${response.status} ${response.statusText}`);
           console.error(`Response Body: ${body}`);
           throw new Error(`API Request failed: ${response.status} ${response.statusText}`);
        }

        return response;
      } catch (error) {
        // If it's a network error, maybe retry? For now, we only retry 429 specifically in the logic above
        // but let's re-throw real errors.
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  }

  async getResolvedIssues(orgId: string, startDate: Date, endDate: Date): Promise<SnykIssue[]> {
    const issues: SnykIssue[] = [];
    // Optimization: Issues resolved in the range MUST have been updated in that range (or later).
    // So we filter by updated_after = startDate.
    const updatedAfter = startDate.toISOString();
    
    let url = `${this.baseUrl}/orgs/${orgId}/issues?version=${this.version}&status=resolved&limit=100&updated_after=${encodeURIComponent(updatedAfter)}`;

    console.log(`Fetching resolved issues for Org ${orgId} starting from ${updatedAfter}...`);

    while (url) {
      const response = await this.fetchWithRetry(url);
      const body = await response.json() as PaginatedResponse;

      if (body.data) {
        issues.push(...body.data);
      }

      if (body.links && body.links.next) {
        const nextLink = body.links.next;
        if (nextLink.startsWith('http')) {
           url = nextLink;
        } else if (nextLink.startsWith('/')) {
           // Snyk API returns relative paths starting with /rest usually
           url = `https://api.snyk.io${nextLink}`;
        } else {
           url = `${this.baseUrl}/${nextLink}`;
        }
      } else {
        break;
      }
    }

    return issues;
  }
}
