import { APIRequestContext, expect } from '@playwright/test';

/**
 * OpenLibrary API Helper
 * Provides methods to interact with OpenLibrary REST API
 */
export class OpenLibraryApiClient {
  private baseUrl: string;
  private request: APIRequestContext;

  constructor(request: APIRequestContext) {
    const openLibraryUrl = process.env.PLAYWRIGHT_OPEN_LIBRARY_API_BASE_URL;
    this.baseUrl = openLibraryUrl || 'https://openlibrary.org';
    this.request = request;
  }

  // 🔍 Search API
  async search(term: string) {
    const response = await this.request.get(`${this.baseUrl}/search.json`, {
      params: { q: term },
    });

    const body = await response.json();
    console.log(`${this.baseUrl}/search.json?q=${term}`);

    return {
      status: response.status(),
      body,
    };
  }

  // Validate positive response
  async validateSearchResults(term: string) {
    const { status, body } = await this.search(term);

    // Status
    expect(status).toBe(200);

    // Structure
    /** Verify the numFound type should be a number and should have atleast 1 result */
    expect(typeof body.numFound).toBe('number');
    expect(body.numFound).toBeGreaterThan(0);

    /** Verify the docs array should be an array and should have atleast 1 result */
    expect(Array.isArray(body.docs)).toBe(true);
    expect(body.docs.length).toBeGreaterThan(0);

    /** Limit the number of documents to validate upto 5 */
    const limit = Math.min(body.docs.length, 5);

    
    for (let i = 0; i < limit; i++) {
      const doc = body.docs[i];

      // 🔹 Title
      expect.soft(doc.title, `Missing title at index ${i}`).toBeTruthy();
      expect.soft(doc.title.trim(), `Empty title at index ${i}`).not.toBe('');

      console.log(`Doc ${i + 1} - Title: ${doc.title}`);

      // 🔹 Author (optional)
      if (doc.author_name && doc.author_name.length > 0) {
        const author = doc.author_name[0];

        expect.soft(author.trim(), `Empty author at index ${i}`).not.toBe('');

        console.log(`Doc ${i + 1} - Author: ${author}`);
      } else {
        console.log(`Doc ${i + 1} - Author: NOT PRESENT`);
      }
    }
  }

  // Negative test validation
  async validateNonsenseSearch(term: string) {
    const { status, body } = await this.search(term);

    expect(status).toBe(200);

    expect(typeof body.numFound).toBe('number');
    expect(Array.isArray(body.docs)).toBe(true);

    expect(body.numFound).toBe(0);
    expect(body.docs.length).toBe(0);

    console.log(`Nonsense search → numFound: ${body.numFound}`);
  }

}