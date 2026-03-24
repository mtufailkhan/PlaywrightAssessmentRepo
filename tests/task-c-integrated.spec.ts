import { test, expect } from '@playwright/test';
import { NASAPages } from '../src/pages/nasaPages';
import { NASAApiClient } from '../src/api/nasaApiClient';

/**
 * Task C: Integrated Test
 * Cross-check API and UI results for consistency
 */

test.describe('Task C: NASA API to UI Consistency', () => {
  const SEARCH_TERM = 'moon';

  test('@integrated should match API result with UI and validate consistency', async ({
    page,
    request,
  }) => {
    // Step 1: Get result from API
    const apiClient = new NASAApiClient(request);
    const apiSearchResponse = await apiClient.search(SEARCH_TERM);
    const apiFirstResult = apiClient.extractFirstResult(apiSearchResponse.body);

    expect(apiFirstResult).not.toBeNull();
    const apiTitle = apiFirstResult!.title;
    const apiNasaId = apiFirstResult!.nasaId;

    console.log(`API Result - Title: "${apiTitle}", NASA ID: "${apiNasaId}"`);

    // Step 2: Get asset details from API
    const apiAssetResponse = await apiClient.getAssetDetails(apiNasaId);
    const apiDownloadUrls = apiClient.extractDownloadUrls(apiAssetResponse.body);

    expect(apiDownloadUrls.length).toBeGreaterThan(0);
    console.log(`API Asset URLs: ${apiDownloadUrls.length} found`);

    // Step 3: Initialize page object and search in UI
    const nasaPages = new NASAPages(page);

    await nasaPages.navigateToHome();
    await nasaPages.searchForTerm(SEARCH_TERM);
    await nasaPages.selectOnlyImages();

    // Verify results exist
    const uiResultsCount = await nasaPages.getResultsCount();
    expect(uiResultsCount).toBeGreaterThanOrEqual(5);
    console.log(`UI Results: ${uiResultsCount} found`);

    // Step 4: Open first result in UI
    await nasaPages.openFirstResultDetails();

    // Step 5: Get details from UI
    const uiTitle = await nasaPages.getTitle();
    const uiNasaId = await nasaPages.getNASAId();

    console.log(`UI Result - Title: "${uiTitle}", NASA ID: "${uiNasaId}"`);

    // Step 6: Assert consistency
    // Normalize titles for comparison (trim whitespace, handle case differences)
    const apiTitleNormalized = apiTitle.trim().toLowerCase();
    const uiTitleNormalized = uiTitle.trim().toLowerCase();

    // Allow for minor differences in whitespace and punctuation
    expect(uiTitleNormalized).toContain(apiTitleNormalized);
    console.log('Titles match (normalized)');

    // NASA ID consistency
    if (uiNasaId) {
      expect(uiNasaId).toBe(apiNasaId);
      console.log('NASA IDs match exactly');
    } else {
      // If NASA ID not exposed in UI, check if it's in the URL
      const pageUrl = page.url();
      expect(pageUrl).toContain(apiNasaId);
      console.log('NASA ID found in page URL');
    }

    // Step 7: Verify download links are available in UI
    const uiDownloadLinks = await nasaPages.getDownloadLinks();
    
    // Normalize URLs for comparison (handle http vs https, trailing slashes)
    const normalizeUrl = (url: string) => {
      if (!url) return url;
      return url.startsWith('//') ? `https:${url}` : url.replace(/^http:/, 'https:');
    };

    const normalizedUiLinks = uiDownloadLinks.map(normalizeUrl);
    const normalizedApiLinks = apiDownloadUrls.map(normalizeUrl);

    // Assertion
    expect(
      normalizedUiLinks.some(link => normalizedApiLinks.includes(link))
    ).toBeTruthy();
    expect(uiDownloadLinks.length).toBeGreaterThan(0);
    console.log(`UI Download Links: ${uiDownloadLinks.length} found`);
  });

  test('@integrated should verify API and UI return same search term results', async ({
    page,
    request,
  }) => {
    // API search
    const apiClient = new NASAApiClient(request);
    const apiResponse = await apiClient.search(SEARCH_TERM);
    const apiResultsCount = apiResponse.body.collection.items.length;

    console.log(`API returned ${apiResultsCount} results for "${SEARCH_TERM}"`);

    // Initialize page object for UI search
    const nasaPages = new NASAPages(page);

    await nasaPages.navigateToHome();
    await nasaPages.searchForTerm(SEARCH_TERM);
    await nasaPages.selectOnlyImages();

    const uiResultsCount = await nasaPages.getResultsCount();
    console.log(`UI returned ${uiResultsCount} results for "${SEARCH_TERM}"`);

    // Both should have results
    expect(apiResultsCount).toBeGreaterThan(0);
    expect(uiResultsCount).toBeGreaterThanOrEqual(5);

    // Results should be in similar range 
    const resultCountDifference = Math.abs(apiResultsCount - uiResultsCount);
    expect(resultCountDifference).toBeLessThan(20);
    console.log(`Result count difference: ${resultCountDifference}`);
  });

});
