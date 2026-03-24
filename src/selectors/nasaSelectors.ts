export const NASASelectors = {
  
  /**
   * Search Input Field
   */
  
  SEARCH_INPUT: '#search-input',
  
  /**
   * Search Results Container 
   */
  SEARCH_RESULTS_CONTAINER: 'div[class="click-area"]',

  /**
   * Opens the filter options dropdown
   */
  FILTER_COMMON_BUTTON: 'button[role="option"]',
  VIDEOS_FILTER: 'Videos',
  AUDIO_FILTER: 'Audio',
  
  /**
   * Filter Option - Videos
   */
  VIDEO_OPTION: 'button[role="option"]:contains("Videos"), [data-testid="filter-video"]',
  
  /**
   * Filter Option - Audio
   */
  AUDIO_OPTION: 'button[role="option"]:contains("Audio"), [data-testid="filter-audio"]',
  
  /**
   * Update/Apply Filter Button
   */
  UPDATE_BUTTON: 'Update',

  /**
   * Result Item/Article
   */
  RESULT_ITEM: '//div[@class="click-area"]',
  
  /**
   * Details Page Title/Heading
   */
  DETAILS_TITLE: '.details-title',
  
  /**
   * Preview/Main Image
   */
  PREVIEW_IMAGE: '#details_img',
  
  /**
   * NASA ID Element 
   */
  NASA_ID_ELEMENT: '//div[@id="details-nasa-id"]/span',
  
};
