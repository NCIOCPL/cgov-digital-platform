// Unit tests for prepare-and-fetch-suggestions.js
import prepareAndFetchSuggestions from '../prepare-and-fetch-suggestions';
import sample1Dom from './sample-dom/sample-1.dom';
import sample2Dom from './sample-dom/sample-2.dom';

// Mock the global fetch function for fetchGlossarySuggestions
global.fetch = jest.fn();

// Mock Drupal.url function
global.Drupal = {
  url: jest.fn()
};

// Mock window.drupalSettings for getContentLanguage
global.window = {
  drupalSettings: {
    path: {
      currentPath: 'node/123',
      currentLanguage: 'en',
    },
  },
};

// Mock exception classes
class CsrfException extends Error {}
class GlossifierApiException extends Error {}

global.CsrfException = CsrfException;
global.GlossifierApiException = GlossifierApiException;

describe('prepareAndFetchSuggestions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.Drupal.url.mockImplementation((path) => `http://example.com/${path}`);

    // Reset window.drupalSettings for each test
    global.window.drupalSettings = {
      path: {
        currentPath: 'node/123',
        currentLanguage: 'en',
      },
    };
  });

  describe('Successful operations', () => {
    it('should successfully process unglossified content (sample 1)', async () => {
      const editorData = sample1Dom.inputHtml;
      const expectedSuggestions = sample1Dom.apiResponse;

      // Mock the fetch calls for CSRF token and API
      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('test-csrf-token')
        })
        .mockResolvedValueOnce({
          status: 200,
          json: jest.fn().mockResolvedValue(expectedSuggestions)
        });

      const result = await prepareAndFetchSuggestions(editorData);

      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalledWith('http://example.com/session/token');
      expect(global.fetch).toHaveBeenCalledWith('http://example.com/pdq/api/glossifier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-Token': 'test-csrf-token',
        },
        body: JSON.stringify(sample1Dom.apiPayload)
      });

      // Verify result is an HTML element
      expect(result).toBeInstanceOf(HTMLElement);
      expect(result.outerHTML).toBe(sample1Dom.suggestedHTML);
    });

    it('should successfully process pre-glossified content (sample 2)', async () => {
      const editorData = sample2Dom.inputHtml;
      const expectedSuggestions = sample2Dom.apiResponse;

      // Mock the fetch calls for CSRF token and API
      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('test-csrf-token')
        })
        .mockResolvedValueOnce({
          status: 200,
          json: jest.fn().mockResolvedValue(expectedSuggestions)
        });

      const result = await prepareAndFetchSuggestions(editorData);

      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalledWith('http://example.com/session/token');
      expect(global.fetch).toHaveBeenCalledWith('http://example.com/pdq/api/glossifier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-Token': 'test-csrf-token',
        },
        body: JSON.stringify(sample2Dom.apiPayload)
      });

      // Verify result is an HTML element
      expect(result).toBeInstanceOf(HTMLElement);
      expect(result.outerHTML).toBe(sample2Dom.suggestedHTML);
    });

    it('should handle Spanish language content', async () => {
      // Set Spanish language in drupalSettings
      global.window.drupalSettings.path.currentLanguage = 'es';
      const editorData = '<p>Contenido en español sobre cáncer</p>';

      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('test-token')
        })
        .mockResolvedValueOnce({
          status: 200,
          json: jest.fn().mockResolvedValue([])
        });

      const result = await prepareAndFetchSuggestions(editorData);

      const apiCallBody = JSON.parse(global.fetch.mock.calls[1][1].body);
      expect(apiCallBody.languages).toEqual(['es']);
      expect(result).toBeInstanceOf(HTMLElement);
    });

    it('should handle new content creation page language detection', async () => {
      // Set path to indicate new content creation
      global.window.drupalSettings.path.currentPath = 'node/add/article';

      // Mock language dropdown element
      const mockLanguageSelect = { value: 'es' };
      global.document.getElementById = jest.fn().mockReturnValue(mockLanguageSelect);

      const editorData = '<p>Test content</p>';

      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('test-token')
        })
        .mockResolvedValueOnce({
          status: 200,
          json: jest.fn().mockResolvedValue([])
        });

      const result = await prepareAndFetchSuggestions(editorData);

      const apiCallBody = JSON.parse(global.fetch.mock.calls[1][1].body);
      expect(apiCallBody.languages).toEqual(['es']);
      expect(global.document.getElementById).toHaveBeenCalledWith('edit-langcode-0-value');
      expect(result).toBeInstanceOf(HTMLElement);
    });
  });

  describe('Error handling', () => {
    it('should propagate CsrfException from fetchGlossarySuggestions', async () => {
      const editorData = sample1Dom.inputHtml;

      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(prepareAndFetchSuggestions(editorData))
        .rejects
        .toThrow('Network error');

      consoleSpy.mockRestore();
    });

    it('should propagate GlossifierApiException from fetchGlossarySuggestions', async () => {
      const editorData = sample1Dom.inputHtml;

      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('valid-token')
        })
        .mockResolvedValueOnce({
          status: 500,
          json: jest.fn()
        });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(prepareAndFetchSuggestions(editorData))
        .rejects
        .toThrow('Glossification request responded with status 500');

      consoleSpy.mockRestore();
    });

    it('should handle content preparation errors', async () => {
      // Test with malformed HTML that might cause content preparation to fail
      const malformedHtml = '<p>Unclosed paragraph <span>unclosed span';

      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('test-token')
        })
        .mockResolvedValueOnce({
          status: 200,
          json: jest.fn().mockResolvedValue([])
        });

      // Should not throw - content preparation handles malformed HTML gracefully
      const result = await prepareAndFetchSuggestions(malformedHtml);
      expect(result).toBeInstanceOf(HTMLElement);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complex content with mixed existing and new glossifications', async () => {
      const complexContent = `
        <p>Some existing <a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR123&version=Patient&language=English">cancer</a> definition and new tumor text.</p>
        <p>More content about treatment and therapy.</p>
      `;

      const mockSuggestions = [
        { start: 50, length: 5, doc_id: 'CDR456', first_occurrence: true, dictionary: 'Cancer.gov' },
        { start: 80, length: 9, doc_id: 'CDR789', first_occurrence: true, dictionary: 'Cancer.gov' }
      ];

      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('test-token')
        })
        .mockResolvedValueOnce({
          status: 200,
          json: jest.fn().mockResolvedValue(mockSuggestions)
        });

      const result = await prepareAndFetchSuggestions(complexContent);

      // Verify the API was called with properly prepared content
      const apiCallBody = JSON.parse(global.fetch.mock.calls[1][1].body);
      expect(apiCallBody.fragment).toContain('span rel="glossified"');
      expect(apiCallBody.fragment).toContain('data-term="cancer"');
      expect(result).toBeInstanceOf(HTMLElement);
    });

    it('should pass through the complete workflow correctly', async () => {
      const editorData = '<p>Test content about cancer treatment</p>';
      const mockSuggestions = [
        { start: 19, length: 6, doc_id: 'CDR123', first_occurrence: true, dictionary: 'Cancer.gov' },
        { start: 26, length: 9, doc_id: 'CDR456', first_occurrence: true, dictionary: 'Cancer.gov' }
      ];

      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('csrf-token')
        })
        .mockResolvedValueOnce({
          status: 200,
          json: jest.fn().mockResolvedValue(mockSuggestions)
        });

      const result = await prepareAndFetchSuggestions(editorData);

      // Verify the complete flow
      expect(global.fetch).toHaveBeenCalledTimes(2);

      // Check that content was prepared (should be mostly the same for simple content)
      const apiCallBody = JSON.parse(global.fetch.mock.calls[1][1].body);
      expect(apiCallBody.fragment).toContain('Test content about cancer treatment');
      expect(apiCallBody.languages).toEqual(['en']);
      expect(apiCallBody.dictionaries).toEqual(['Cancer.gov']);

      // Check that result is a proper HTML element
      expect(result).toBeInstanceOf(HTMLElement);
      expect(result.innerHTML).toContain('data-term-id');
    });

    it('should handle very long content efficiently', async () => {
      const longContent = '<p>' + 'cancer '.repeat(1000) + '</p>';

      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('test-token')
        })
        .mockResolvedValueOnce({
          status: 200,
          json: jest.fn().mockResolvedValue([])
        });

      const result = await prepareAndFetchSuggestions(longContent);

      // Verify that long content is handled
      const apiCallBody = JSON.parse(global.fetch.mock.calls[1][1].body);
      expect(apiCallBody.fragment.length).toBeGreaterThan(5000);
      expect(result).toBeInstanceOf(HTMLElement);
    });
  });

  // @todo: Add more tests for preserving HTML and handling special chars.
  // @todo: Maybe add a Spanish test for Spanish chars.

});
