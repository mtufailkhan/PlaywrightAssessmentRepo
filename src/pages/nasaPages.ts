import { Page, expect } from '@playwright/test';
import { NASASelectors } from '../selectors/nasaSelectors';
import { TestHelpers } from '../utils/testHelpers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * NASA Pages - Page Object Model for NASA Images Library
 */
class NASAPages {
  readonly page: Page;
  readonly helper: TestHelpers;
  readonly baseUrl: string;
  constructor(page: Page) {
    this.page = page;
    this.helper = new TestHelpers(page);
    // Get NASA URL from environment, with fallback
    const nasaUrl = process.env.PLAYWRIGHT_NASA_BASE_URL;
    this.baseUrl = nasaUrl || 'https://images.nasa.gov';
    console.log(`NASA Page initialized with URL: ${this.baseUrl}`);
  }

  /**
   * Navigate to NASA Images Library home page
   */
  async navigateToHome() {
    await this.page.goto(this.baseUrl);
    // Wait for the main content to be visible - try multiple selectors
    try {
      await Promise.race([
        this.page.locator(NASASelectors.SEARCH_INPUT).waitFor({ state: 'visible', timeout: 20000 }),
        this.page.locator('main').first().waitFor({ state: 'visible', timeout: 30000 }),
        this.page.locator('h2').first().waitFor({ state: 'visible', timeout: 30000 }),
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
    await this.helper.searchForTerm(searchedWord, NASASelectors.SEARCH_INPUT);
  }

  /**
   * Filter results to show only images (exclude videos and audio)
   * Because Image, Video and Audio filters are selected by default.
   */
  async selectOnlyImages() {
    await this.page.locator(NASASelectors.FILTER_COMMON_BUTTON, { hasText: NASASelectors.VIDEOS_FILTER }).click();
    await this.page.locator(NASASelectors.FILTER_COMMON_BUTTON, { hasText: NASASelectors.AUDIO_FILTER }).click();
    await this.page.getByRole('button', { name: NASASelectors.UPDATE_BUTTON }).click();
  }

  /**
   * Get the number of visible results on the current page
   */
  async getResultsCount() {
    return await this.helper.getVisibleResultsCount(NASASelectors.SEARCH_RESULTS_CONTAINER);
  }

  /**
   * Click the first result to open its details page (alias)
   */
  async openFirstResultDetails() {
    const firstResult = this.page.locator(NASASelectors.RESULT_ITEM).first();
    await firstResult.click();
    await this.page.waitForLoadState('domcontentloaded');  
    const titleElement = this.page.locator(NASASelectors.DETAILS_TITLE);
    await expect(titleElement.first()).toBeVisible();  
  }

  /**
   * Get the title of the media item
   */
  async getTitle(): Promise<string> {
    // Title is usually in an h1 or h2 tag
    const titleElement = this.page.locator(NASASelectors.DETAILS_TITLE);
    await titleElement.first().waitFor({ state: 'visible' , timeout: 20000 });
    return await titleElement.first().textContent() || '';
  }

  /**
   * Assert title is visible on details page
   */
  async assertTitleIsVisible() {
    const titleElement = this.page.locator(NASASelectors.DETAILS_TITLE);
    await expect(titleElement.first()).toBeVisible();
  }

  /**
   * Get the preview/main image element
   */
  async getPreviewImage() {
    // Main image is typically an <img> tag with specific attributes
    const image = this.page.locator(NASASelectors.PREVIEW_IMAGE);
    return image.first();
  }

  /**
   * Assert preview image loads (check src attribute is set)
   */
  async assertPreviewImageLoads() {
    const image = await this.getPreviewImage();
    await expect(image).toBeVisible();    
    // Check that image has a src attribute and it's loaded
    const src = await image.getAttribute('src');
    await expect(image).toHaveJSProperty('complete', true);
    expect(src).not.toBe('');
    console.log(`✓ Preview image has loaded (src: ${src?.substring(0, 50)}...)`);
  }

  /**
   * Get NASA ID from the page if exposed
   */
  async getNASAId(): Promise<string | null> {
    // Try to find in meta tags or data attributes
    const nasaIdElement = this.page.locator(NASASelectors.NASA_ID_ELEMENT);
    await nasaIdElement.waitFor({ state: 'visible' });
    
    if (await nasaIdElement.first().isVisible()) {
      return await nasaIdElement.first().innerText() || '';
    }
    return null;
  }

  /**
   * Get all downloadable links on the page
   */
  async getDownloadLinks(): Promise<string[]> {
    const links = this.page.locator('a[href*="download"], a[href*=".jpg"], a[href*=".png"], a[href*=".tif"]');
    const hrefs: string[] = [];
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      if (href) {
        hrefs.push(href);
      }
    }
    return hrefs;
  }

}

export { NASAPages };
