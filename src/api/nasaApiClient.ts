import { APIRequestContext } from '@playwright/test';

/**
 * NASA Images API Helper
 * Provides methods to interact with NASA Images REST API
 */
export class NASAApiClient {
  private baseUrl: string;
  private request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.baseUrl = process.env.PLAYWRIGHT_NASA_API_BASE_URL || 'https://images-api.nasa.gov';
    this.request = request;
  }

  /**
   * Search for images in NASA library
   */
  async search(searchWord: string, mediaType: string = 'image', page: number = 1) {
    const response = await this.request.get(`${this.baseUrl}/search`, {
      params: {
        q: searchWord,
        media_type: mediaType,
        page: page.toString(),
      },
    });
    return {
      status: response.status(),
      body: await response.json(),
      response,
    };
  }

  /**
   * Fetch asset details by NASA ID
   * @param nasaId The NASA ID of the asset
   * @returns Response object containing asset details
   */
  async getAssetDetails(nasaId: string) {
    const response = await this.request.get(`${this.baseUrl}/asset/${nasaId}`);
    return {
      status: response.status(),
      body: await response.json(),
      response,
    };
  }

  /**
   * Extract the first result from search response
   * @param searchBody The search response body
   * @returns Object containing title and nasaId
   */
  extractFirstResult(searchBody: any) {
    if (
      !searchBody.collection ||
      !searchBody.collection.items ||
      searchBody.collection.items.length === 0
    ) {
      return null;
    }

    const firstItem = searchBody.collection.items[0];
    const data = firstItem.data?.[0];

    if (!data) {
      return null;
    }

    return {
      title: data.title || '',
      nasaId: data.nasa_id || '',
      description: data.description || '',
      dateCreated: data.date_created || '',
    };
  }

  /**
   * Extract downloadable URLs from asset details
   * @param assetBody The asset details response body
   * @returns Array of downloadable URLs
   */
  extractDownloadUrls(assetBody: any): string[] {
    const urls: string[] = [];

    if (!assetBody.collection || !assetBody.collection.items) {
      return urls;
    }

    assetBody.collection.items.forEach((item: any) => {
      if (item.href) {
        urls.push(item.href);
      }
    });

    return urls;
  }
}
