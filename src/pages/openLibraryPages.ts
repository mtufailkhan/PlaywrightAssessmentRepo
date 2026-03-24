import { Page, expect } from '@playwright/test';
import { TestHelpers } from '../utils/testHelpers';
import { OpenLibrarySelectors } from '../selectors/openLibrarySelectors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * OpenLibrary Page
 */
export class OpenLibraryPages {
  readonly page: Page;
  readonly helper: TestHelpers;
  readonly baseUrl: string;
  constructor(page: Page) {
    this.page = page;
    this.helper = new TestHelpers(page);
    // Get OpenLibrary URL from environment, with fallback
    const openLibraryUrl = process.env.PLAYWRIGHT_OPENLIBRARY_BASE_URL;
    this.baseUrl = openLibraryUrl || 'https://openlibrary.org';
    console.log(`OpenLibrary Page initialized with URL: ${this.baseUrl}`);
  }

  /**
     * Navigate to OpenLibrary home page
     */
    async navigateToHome() {
      await this.page.goto(this.baseUrl);
      // Wait for the main content to be visible - try multiple selectors
      try {
        await Promise.race([
          this.page.getByPlaceholder(OpenLibrarySelectors.SearchInputBoxPlaceHolder).waitFor({ state: 'visible', timeout: 20000 }),
          this.page.locator('main').first().waitFor({ state: 'visible', timeout: 20000 }),
          this.page.locator('h2').first().waitFor({ state: 'visible', timeout: 20000 }),
        ]);
      } catch (e) {
        // Page may have loaded but specific elements not visible yet, continue anyway
        console.log('Navigation complete - proceeding with page interaction');
      }
    }

    /**
     * Search for a term in the NASA library
     */
    async searchForTerm(searchedWord: string) {
      await this.helper.searchForTerm(searchedWord, OpenLibrarySelectors.SearchInputBoxLocator);
    }

    /**
     * Get the number of visible results on the current page
     */
    async getResultsCount() {
        return await this.helper.getVisibleResultsCount(OpenLibrarySelectors.SearchResultsContainer);
    }


    async validateResults(count: number) {
      const results = this.page.locator('li.searchResultItem'); 
      
      const total = await results.count();
      const limit = Math.min(total, count);

      for (let i = 0; i < limit; i++) {
        const item = results.nth(i);

        // Picking Title 
        const titleLocator = item.locator('.booktitle');
        const title = await titleLocator.first().innerText();
        console.log(`Result ${i + 1} - Title: ${title.trim()}`);
        expect.soft(title.trim(), `Title is empty at index ${i}`).not.toBe('');

        // Picking Author (if available)
        const authorLocator = item.locator('.bookauthor a');

        if (await authorLocator.count() > 0) {
          const author = await authorLocator.first().innerText();
          console.log(`Result ${i + 1} - Author: ${author.trim()}`);
          expect.soft(author.trim(), `Author is empty at index ${i}`).not.toBe('');
        }
      }
    }
    

}