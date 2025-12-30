
import { SnykClient } from './client/SnykClient.js';
import { getImpactStats } from './services/impactService.js';

async function main() {
  const token = process.env.SNYK_TOKEN;
  const orgId = process.env.ORG_ID;
  const startDateStr = process.env.START_DATE;
  const endDateStr = process.env.END_DATE;
  const apiVersion = process.env.SNYK_API_VERSION; // Optional, defaults in client

  if (!token) {
    console.error('Error: SNYK_TOKEN environment variable is required.');
    process.exit(1);
  }

  if (!orgId) {
    console.error('Error: ORG_ID environment variable is required.');
    process.exit(1);
  }

  if (!startDateStr || !endDateStr) {
     console.error('Error: START_DATE and END_DATE environment variables are required (ISO format, e.g., 2024-01-01).');
     process.exit(1);
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.error('Error: Invalid Date format for START_DATE or END_DATE.');
    process.exit(1);
  }

  const client = new SnykClient(token, apiVersion);

  try {
    const stats = await getImpactStats(client, orgId, startDate, endDate);
    
    // Output strictly JSON as requested
    console.log(JSON.stringify({ impact: stats }, null, 2));

  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

main();
