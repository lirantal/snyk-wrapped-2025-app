
import { SnykClient, SnykIssue } from '../client/SnykClient.js';

interface SeverityBreakdown {
  critical: number;
  high: number;
  med: number;
  low: number;
}

export interface ImpactStats {
  totalFixed: number;
  severityBreakdown: SeverityBreakdown;
}

export async function getImpactStats(
  client: SnykClient,
  orgId: string,
  startDate: Date,
  endDate: Date
): Promise<ImpactStats> {
  // 1. Fetch Issues
  const issues = await client.getResolvedIssues(orgId, startDate, endDate);

  // 2. Filter by actual resolved_at date
  const filteredIssues = issues.filter((issue) => {
    const resolvedAtStr = issue.attributes.resolution?.resolved_at;
    if (!resolvedAtStr) return false;

    const resolvedAt = new Date(resolvedAtStr);
    return resolvedAt >= startDate && resolvedAt <= endDate;
  });

  // 3. Aggregate
  const stats: ImpactStats = {
    totalFixed: filteredIssues.length,
    severityBreakdown: {
      critical: 0,
      high: 0,
      med: 0,
      low: 0,
    },
  };

  for (const issue of filteredIssues) {
    const severity = issue.attributes.effective_severity_level;
    // Severity can be 'info', 'low', 'medium', 'high', 'critical'
    switch (severity) {
      case 'critical':
        stats.severityBreakdown.critical++;
        break;
      case 'high':
        stats.severityBreakdown.high++;
        break;
      case 'medium':
        stats.severityBreakdown.med++;
        break;
      case 'low':
        stats.severityBreakdown.low++;
        break;
      // We ignore 'info' based on the spec requirement which only lists critical, high, med, low
    }
  }

  return stats;
}
