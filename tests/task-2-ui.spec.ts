import { test, expect } from '@playwright/test';
import { OpenLibraryPages } from '../src/pages/openLibraryPages';

test.beforeEach(async ({ page }) => {
  console.log('\n--- Test Setup: Preparing test environment ---');
  console.log(`Browser: ${page.context().browser()?.browserType().name()}`);
});

test.afterEach(async ({ page }) => {
  console.log('\n--- Test Teardown: Cleaning up ---');
  console.log(`Test completed for URL: ${page.url()}`);
});

test('@task2ui Task A: Search Open Source Library and Validate Books Result', async ({ page }) => { 
    const SEARCH_TERM = 'The Hobbit';
    const MINIMUM_RESULTS = 5;

    console.log('\n=== Task A: UI Test - Open Library Search and Validation ===\n');

    // Step 1: Navigate to Open Library UI
    console.log('Step 1: Navigating to Open Library Search...');
    const openLibraryPage = new OpenLibraryPages(page);
    await openLibraryPage.navigateToHome();
    
    // Step 2: Search for 'moon' term
    console.log(`\nStep 2: Searching for term: "${SEARCH_TERM}"...`);
    await openLibraryPage.searchForTerm(SEARCH_TERM);

    // Verify search results page loaded
    console.log('Search completed and results page loaded');

    // Step 4: Assert results load and at least 5 results are visible
    console.log('\nStep 4: Verifying at least 5 results are visible...');
    const resultsCount = await openLibraryPage.getResultsCount();
    console.log(`Found ${resultsCount} results for "${SEARCH_TERM}"`);
    expect(resultsCount).toBeGreaterThanOrEqual(MINIMUM_RESULTS);
    console.log(`Verified ${resultsCount} results are visible (minimum: ${MINIMUM_RESULTS})`);

    //Step 5: Verify the author and title for the books
    await openLibraryPage.validateResults(5);
})