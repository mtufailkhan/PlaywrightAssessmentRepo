import { test, expect } from '@playwright/test';
import { OpenLibraryPages } from '../src/pages/openLibraryPages';
import { OpenLibraryApiClient } from '../src/api/openLibraryApi';

/**
 * Task C: Integrated Test
 * Cross-check API and UI results for consistency
 */

test.describe('Task C: OpenLibrary API to UI Consistency', () => {

    test('@task2integrated should match API result with UI and validate consistency', async ({
    page,
    request,
  }) => {

    const searchTerm = 'The Hobbit';

    // Initialize API + UI
    const api = new OpenLibraryApiClient(request);
    const ui = new OpenLibraryPages(page);

    // Call API
    const { status, body } = await api.search(searchTerm);

    expect(status).toBe(200);
    expect(body.docs.length).toBeGreaterThan(0);

    const apiTitleRaw = body.docs[0].title;
    expect(apiTitleRaw).toBeTruthy();

    const apiTitle = apiTitleRaw.trim().toLowerCase();

    console.log(`\nAPI First Title: ${apiTitleRaw}`);

    
    // Open UI + Search
    await ui.navigateToHome();
    await ui.searchForTerm(searchTerm);

    // Wait for results to load
    const results = page.locator('li.searchResultItem');
    await expect(results.first()).toBeVisible();

    // Collect UI Titles
    const total = await results.count();
    const limit = Math.min(total, 15); // 🔥 check first 15 for stability

    let matchFound = false;

    console.log(`\nChecking first ${limit} UI results...\n`);

    for (let i = 0; i < limit; i++) {
      const item = results.nth(i);

      const title = await item.locator('.booktitle').first().innerText();
      const normalizedUITitle = title.trim().toLowerCase();

      console.log(`UI Result ${i + 1}: ${title.trim()}`);

      // Matching Logic
      if (
        normalizedUITitle.includes(apiTitle) ||
        apiTitle.includes(normalizedUITitle)
      ) {
        matchFound = true;

        console.log(`\nMATCH FOUND at index ${i}`);
        console.log(`API: ${apiTitleRaw}`);
        console.log(`UI : ${title.trim()}\n`);

        break;
      }
    }

    // Final Assertion
    expect(
      matchFound,
      'API title not found in UI results (first 15 items)'
    ).toBeTruthy();


  });

})