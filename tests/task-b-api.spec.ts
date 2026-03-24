import { test, expect, APIResponse } from '@playwright/test';
import { NASAApiClient } from '../src/api/nasaApiClient';

/**
 * Task B: API Tests
 * Search and fetch asset details using NASA Images REST API
 */

test.describe('Task B: NASA API - Search and Fetch Asset Details', () => {
  const SEARCH_TERM = 'moon';
  var response: { status: any; body?: any; response?: APIResponse; } ;

  test.beforeEach(async ({request }) => {
  console.log('\n--- Test Setup: Preparing test environment ---');
  const apiClient = new NASAApiClient(request);
  response = await apiClient.search(SEARCH_TERM);
  });

  test.afterEach(async () => {
    console.log('\n--- Test Teardown: Cleaning up ---');
  });

  test('@api should perform API search and return HTTP 200', async ({ request }) => {

    // Verify HTTP 200
    expect(response.status).toBe(200);
    console.log('API search returned status 200');
  });

  test('@api should return at least one result in search response', async ({ request }) => {
    const body = response.body;

    // Verify structure
    expect(body.collection.items[0].data[0]).toMatchObject({
      title: expect.any(String),
      nasa_id: expect.any(String),
    });
    expect(body.collection.items).toBeDefined();
    expect(body.collection.items.length).toBeGreaterThan(0);

    console.log(`API search returned ${body.collection.items.length} items`);
  });

  test('@api should extract title and nasa_id from first result', async ({ request }) => {
    const apiClient = new NASAApiClient(request);

    const firstResult = apiClient.extractFirstResult(response.body);

    // Verify result structure
    expect(firstResult).not.toBeNull();
    expect(firstResult?.title).toBeTruthy();
    expect(firstResult?.nasaId).toBeTruthy();

    console.log(`First result - Title: ${firstResult?.title}, NASA ID: ${firstResult?.nasaId}`);
  });

  test('@api should fetch asset details by NASA ID', async ({ request }) => {
    const apiClient = new NASAApiClient(request);
    const firstResult = apiClient.extractFirstResult(response.body);

    expect(firstResult?.nasaId).toBeTruthy();

    // Fetch asset details
    const assetResponse = await apiClient.getAssetDetails(firstResult!.nasaId);

    // Verify HTTP 200
    expect(assetResponse.status).toBe(200);
    console.log(`Asset details fetch returned status 200 for NASA ID: ${firstResult?.nasaId}`);
  });

  test('@api should return downloadable URLs in asset details', async ({ request }) => {
    const apiClient = new NASAApiClient(request);

    const firstResult = apiClient.extractFirstResult(response.body);

    expect(firstResult?.nasaId).toBeTruthy();

    // Fetch asset details
    const assetResponse = await apiClient.getAssetDetails(firstResult!.nasaId);
    const downloadUrls = apiClient.extractDownloadUrls(assetResponse.body);

    // Verify at least one download URL exists
    expect(downloadUrls.length).toBeGreaterThan(0);
    console.log(`Found ${downloadUrls.length} download URLs`);

    // Log first URL
    if (downloadUrls.length > 0) {
      console.log(`First download URL: ${downloadUrls[0]}`);
    }
  });

  test('@api should handle empty search query gracefully', async ({ request }) => {
    const apiClient = new NASAApiClient(request);

    // Search with empty term
    response = await apiClient.search('');

    // Verify response is valid (HTTP 200 even with empty query)
    expect(response.status).toBe(200);
    const body = response.body;

    // Verify response structure exists
    expect(body.collection).toBeDefined();
    
    console.log(`Empty search returned ${body.collection?.items?.length || 0} items`);
  });

  test('@api should handle nonsense search query', async ({ request }) => {
    const apiClient = new NASAApiClient(request);

    // Search with nonsense term
    const nonsenseTerm = 'xyzabc123notarealterm999!!!';
    response = await apiClient.search(nonsenseTerm);

    // Verify response is valid
    expect(response.status).toBe(200);
    const body = response.body;

    // Might return 0 results or empty collection
    const itemCount = body.collection?.items?.length || 0;
    expect(itemCount).toBeLessThan(2);

    console.log(`Nonsense search returned ${itemCount} items (expected 0)`);
  });
});
