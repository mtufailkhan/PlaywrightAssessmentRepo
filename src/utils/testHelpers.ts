import { Page } from "@playwright/test";

export class TestHelpers {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific path
   */
  async goto(path: string = '') {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

    /**
     * Search for a term in the NASA library
     */
    async searchForTerm(searchTerm: string, locator: string) {
        // Find and fill the search input field
        const searchInput = this.page.locator(locator);
        
        // Wait for search input to be visible and enabled
        await searchInput.waitFor({ state: 'visible', timeout: 30000 });
        await searchInput.fill(searchTerm);
        await searchInput.press('Enter');

        // Wait for search results to load - use role-based selector
        await this.page.getByRole('list').first().waitFor({ state: 'visible', timeout: 30000 });
    }

    /**
       * Get the number of visible results on the current page
       */
      async getVisibleResultsCount(locator: string): Promise<number> {
        // Look for result items/cards
        const resultItems = this.page.locator(locator);
        await resultItems.first().waitFor({ state: 'visible', timeout: 30000 });
        return await resultItems.count();
      }
}