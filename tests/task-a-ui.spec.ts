import { test, expect } from '@playwright/test';
import { NASAPages } from '../src/pages/nasaPages';

test.beforeEach(async ({ page }) => {
  console.log('\n--- Test Setup: Preparing test environment ---');
  console.log(`Browser: ${page.context().browser()?.browserType().name()}`);
});

test.afterEach(async ({ page }) => {
  console.log('\n--- Test Teardown: Cleaning up ---');
  console.log(`Test completed for URL: ${page.url()}`);
});

test('@ui Task A: Search NASA Library and Validate Media Result', async ({ page }) => {
  const SEARCH_TERM = 'moon';
  const MINIMUM_RESULTS = 5;

  console.log('\n=== Task A: UI Test - NASA Library Search and Validation ===\n');

  // Step 1: Navigate to NASA Image and Video Library UI
  console.log('Step 1: Navigating to NASA Images Library...');
  const nasaPage = new NASAPages(page);
  await nasaPage.navigateToHome();

  // Verify page loaded
  const pageTitle = await page.title();
  console.log(`Successfully navigated to NASA Images Library (title: "${pageTitle}")`);

  // Step 2: Search for 'moon' term
  console.log(`\nStep 2: Searching for term: "${SEARCH_TERM}"...`);
  await nasaPage.searchForTerm(SEARCH_TERM);

  // Verify search results page loaded
  console.log('Search completed and results page loaded');

  // Step 3: Filter to media type 'image' if available
  console.log('\nStep 3: Filtering to media type "image"...');

  try {
    await nasaPage.selectOnlyImages();
    console.log('Media type filter applied to "image"');
  } catch (error) {
    console.log('Media type filter not available - this is acceptable, proceeding with results');
  }

  // Step 4: Assert results load and at least 5 results are visible
  console.log('\nStep 4: Verifying at least 5 results are visible...');
  const resultsCount = await nasaPage.getResultsCount();
  console.log(`Found ${resultsCount} results for "${SEARCH_TERM}"`);
  expect(resultsCount).toBeGreaterThanOrEqual(MINIMUM_RESULTS);
  console.log(`Verified ${resultsCount} results are visible (minimum: ${MINIMUM_RESULTS})`);

  // Step 5: Open the first result details page
  console.log('\nStep 5: Opening first result details page...');
  await nasaPage.openFirstResultDetails();
  await page.waitForLoadState('domcontentloaded');

  // Verify we're on details page
  const currentUrl = page.url();
  expect(currentUrl).not.toContain('search');
  console.log(`Details page loaded (URL: ${currentUrl})`);

  // Step 6: Assert the title is visible
  console.log('\nStep 6: Verifying title is visible on details page...');
  
  await nasaPage.assertTitleIsVisible();

  const title = await nasaPage.getTitle();
  expect(title).toBeTruthy();
  expect(title.length).toBeGreaterThan(0);
  console.log(`Title is visible: "${title}"`);

  // Step 7: Assert the preview image loads (not broken)
  console.log('\nStep 7: Verifying preview image loads...');
  await nasaPage.assertPreviewImageLoads();

  // Step 8: Capture NASA ID if the UI exposes it
  console.log('\nStep 8: Capturing NASA ID if exposed...');
  const nasaId = await nasaPage.getNASAId();

  if (nasaId) {
    console.log(`NASA ID found in UI: "${nasaId}"`);
    expect(nasaId).toBeTruthy();
  } else {
    console.log('NASA ID not directly exposed in UI element');
    // Check if it's in the URL
    const urlMatch = currentUrl.match(/\/([a-zA-Z0-9\-_]+)\/?$/);
    if (urlMatch && urlMatch[1]) {
      console.log(`NASA ID extracted from URL: "${urlMatch[1]}"`);
    } else {
      console.log('NASA ID could not be extracted from URL or UI');
    }
  }

  console.log('\n=== Task A: UI Test PASSED ===\n');
});
