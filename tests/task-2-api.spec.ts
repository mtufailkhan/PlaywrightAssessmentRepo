import { test } from '@playwright/test';
import { OpenLibraryApiClient } from '../src/api/openLibraryApi';

test.describe('OpenLibrary API Tests', () => {

  test('@task2api validate search results', async ({ request }) => {
    const api = new OpenLibraryApiClient(request);
    await api.validateSearchResults('The Hobbit');
  });

  test('@task2api validate nonsense search', async ({ request }) => {
    const api = new OpenLibraryApiClient(request);
    await api.validateNonsenseSearch('xyzabc123notarealterm999!!!');
  });

});
