// Unit tests for fetch-glossary-suggestions.js
import fetchGlossarySuggestions from '../fetch-glossary-suggestions';
import sample1Dom from './sample-dom/sample-1.dom';
import sample2Dom from './sample-dom/sample-2.dom';

// Mock the global fetch function
// @todo: Move to use msw for handling fetch requests. (Needs Node 18+)
global.fetch = jest.fn();

// Mock Drupal.url function
global.Drupal = {
  url: jest.fn()
};

// Import exception classes for testing
class CsrfException extends Error {}
class GlossifierApiException extends Error {}

// Make exception classes available globally for the module
global.CsrfException = CsrfException;
global.GlossifierApiException = GlossifierApiException;

describe('fetchGlossarySuggestions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.Drupal.url.mockImplementation((path) => `http://example.com/${path}`);
  });

  describe('Successful API responses', () => {
    it('should successfully fetch glossary suggestions for unglossified content', async () => {
      const content = sample1Dom.apiPayload.fragment;
      const language = 'en';
      const expectedSuggestions = sample1Dom.apiResponse;

      // Mock CSRF token fetch
      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('test-csrf-token')
        })
        // Mock glossifier API response
        .mockResolvedValueOnce({
          status: 200,
          json: jest.fn().mockResolvedValue(expectedSuggestions)
        });

      const result = await fetchGlossarySuggestions(content, language);

      expect(global.Drupal.url).toHaveBeenCalledWith('session/token');
      expect(global.Drupal.url).toHaveBeenCalledWith('pdq/api/glossifier');
      expect(global.fetch).toHaveBeenCalledTimes(2);

      // Check the glossifier API call
      expect(global.fetch).toHaveBeenCalledWith('http://example.com/pdq/api/glossifier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-Token': 'test-csrf-token',
        },
        body: JSON.stringify(sample1Dom.apiPayload)
      });

      expect(result).toEqual(expectedSuggestions);
    });

    it('should successfully fetch glossary suggestions for pre-glossified content', async () => {
      const content = sample2Dom.apiPayload.fragment;
      const language = 'en';
      const expectedSuggestions = sample2Dom.apiResponse;

      // Mock CSRF token fetch
      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('csrf-token-123')
        })
        // Mock glossifier API response
        .mockResolvedValueOnce({
          status: 200,
          json: jest.fn().mockResolvedValue(expectedSuggestions)
        });

      const result = await fetchGlossarySuggestions(content, language);

      expect(global.Drupal.url).toHaveBeenCalledWith('session/token');
      expect(global.Drupal.url).toHaveBeenCalledWith('pdq/api/glossifier');
      expect(global.fetch).toHaveBeenCalledTimes(2);

      // Check the glossifier API call
      expect(global.fetch).toHaveBeenCalledWith('http://example.com/pdq/api/glossifier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-Token': 'csrf-token-123',
        },
        body: JSON.stringify(sample2Dom.apiPayload)
      });

      expect(result).toEqual(expectedSuggestions);
    });

    it('should handle empty content', async () => {
      const content = '';
      const language = 'en';
      const expectedSuggestions = [];

      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('test-token')
        })
        .mockResolvedValueOnce({
          status: 200,
          json: jest.fn().mockResolvedValue(expectedSuggestions)
        });

      const result = await fetchGlossarySuggestions(content, language);

      expect(result).toEqual(expectedSuggestions);
      expect(global.fetch).toHaveBeenCalledWith('http://example.com/pdq/api/glossifier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-Token': 'test-token',
        },
        body: JSON.stringify({
          'fragment': content,
          'languages': [language],
          'dictionaries': ['Cancer.gov']
        })
      });
    });

    it('should handle different language codes', async () => {
      const content = '<p>Some content in Spanish</p>';
      const language = 'es';

      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('test-token')
        })
        .mockResolvedValueOnce({
          status: 200,
          json: jest.fn().mockResolvedValue([])
        });

      await fetchGlossarySuggestions(content, language);

      expect(global.fetch).toHaveBeenCalledWith('http://example.com/pdq/api/glossifier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-Token': 'test-token',
        },
        body: JSON.stringify({
          'fragment': content,
          'languages': ['es'],
          'dictionaries': ['Cancer.gov']
        })
      });
    });
  });

  describe('CSRF token error handling', () => {
    it('should throw CsrfException when CSRF token request fails with non-200 status', async () => {
      global.fetch.mockResolvedValueOnce({
        status: 403,
        text: jest.fn().mockResolvedValue('Forbidden')
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(fetchGlossarySuggestions('test content', 'en'))
        .rejects
        .toThrow('CSRF request responded with status 403');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should throw CsrfException when CSRF token request throws network error', async () => {
      const networkError = new Error('Network error');
      global.fetch.mockRejectedValueOnce(networkError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(fetchGlossarySuggestions('test content', 'en'))
        .rejects
        .toThrow('Network error');

      expect(consoleSpy).toHaveBeenCalledWith(networkError);
      consoleSpy.mockRestore();
    });

    it('should throw CsrfException when CSRF token text parsing fails', async () => {
      const textError = new Error('Text parsing failed');
      global.fetch.mockResolvedValueOnce({
        status: 200,
        text: jest.fn().mockRejectedValue(textError)
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(fetchGlossarySuggestions('test content', 'en'))
        .rejects
        .toThrow('Text parsing failed');

      expect(consoleSpy).toHaveBeenCalledWith(textError);
      consoleSpy.mockRestore();
    });
  });

  describe('Glossifier API error handling', () => {
    it('should throw GlossifierApiException when API request fails with non-200 status', async () => {
      // Mock successful CSRF token fetch
      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('valid-csrf-token')
        })
        // Mock API request with error status
        .mockResolvedValueOnce({
          status: 500,
          json: jest.fn()
        });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(fetchGlossarySuggestions('test content', 'en'))
        .rejects
        .toThrow('Glossification request responded with status 500');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should throw GlossifierApiException when API request throws network error', async () => {
      // Mock successful CSRF token fetch
      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('valid-csrf-token')
        })
        // Mock API request with network error
        .mockRejectedValueOnce(new Error('API network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(fetchGlossarySuggestions('test content', 'en'))
        .rejects
        .toThrow('API network error');

      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should throw GlossifierApiException when JSON parsing fails', async () => {
      // Mock successful CSRF token fetch
      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('valid-csrf-token')
        })
        // Mock API request with JSON parsing error
        .mockResolvedValueOnce({
          status: 200,
          json: jest.fn().mockRejectedValue(new Error('Invalid JSON response'))
        });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(fetchGlossarySuggestions('test content', 'en'))
        .rejects
        .toThrow('Invalid JSON response');

      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should handle API returning 400 Bad Request', async () => {
      // Mock successful CSRF token fetch
      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('valid-csrf-token')
        })
        // Mock API request with 400 status
        .mockResolvedValueOnce({
          status: 400,
          json: jest.fn()
        });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(fetchGlossarySuggestions('test content', 'en'))
        .rejects
        .toThrow('Glossification request responded with status 400');

      consoleSpy.mockRestore();
    });

    it('should handle API returning 401 Unauthorized', async () => {
      // Mock successful CSRF token fetch
      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('valid-csrf-token')
        })
        // Mock API request with 401 status
        .mockResolvedValueOnce({
          status: 401,
          json: jest.fn()
        });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(fetchGlossarySuggestions('test content', 'en'))
        .rejects
        .toThrow('Glossification request responded with status 401');

      consoleSpy.mockRestore();
    });
  });

  describe('Edge cases and complex scenarios', () => {
    it('should handle very long content', async () => {
      const longContent = '<p>' + 'cancer '.repeat(1000) + '</p>';
      const language = 'en';

      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('test-token')
        })
        .mockResolvedValueOnce({
          status: 200,
          json: jest.fn().mockResolvedValue([])
        });

      const result = await fetchGlossarySuggestions(longContent, language);

      expect(result).toEqual([]);
      expect(global.fetch).toHaveBeenCalledWith('http://example.com/pdq/api/glossifier',
        expect.objectContaining({
          body: JSON.stringify({
            'fragment': longContent,
            'languages': [language],
            'dictionaries': ['Cancer.gov']
          })
        })
      );
    });

    it('should handle special characters in content', async () => {
      const specialContent = '<p>Cancer & tumors – "quotes" and símbolos</p>';
      const language = 'en';

      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('test-token')
        })
        .mockResolvedValueOnce({
          status: 200,
          json: jest.fn().mockResolvedValue([])
        });

      const result = await fetchGlossarySuggestions(specialContent, language);

      expect(result).toEqual([]);
      expect(global.fetch).toHaveBeenCalledWith('http://example.com/pdq/api/glossifier',
        expect.objectContaining({
          body: JSON.stringify({
            'fragment': specialContent,
            'languages': [language],
            'dictionaries': ['Cancer.gov']
          })
        })
      );
    });

    it('should handle malformed HTML content', async () => {
      const malformedContent = '<p>Unclosed tag <span>cancer</p>';
      const language = 'en';

      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('test-token')
        })
        .mockResolvedValueOnce({
          status: 200,
          json: jest.fn().mockResolvedValue([])
        });

      const result = await fetchGlossarySuggestions(malformedContent, language);

      expect(result).toEqual([]);
    });

    it('should use correct dictionary in request payload', async () => {
      const content = '<p>Test content</p>';
      const language = 'en';

      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('test-token')
        })
        .mockResolvedValueOnce({
          status: 200,
          json: jest.fn().mockResolvedValue([])
        });

      await fetchGlossarySuggestions(content, language);

      const lastCall = global.fetch.mock.calls[1];
      const requestBody = JSON.parse(lastCall[1].body);

      expect(requestBody.dictionaries).toEqual(['Cancer.gov']);
      expect(requestBody.languages).toEqual([language]);
      expect(requestBody.fragment).toEqual(content);
    });
  });

  describe('Request headers and authentication', () => {
    it('should include correct headers in API request', async () => {
      const content = '<p>Test</p>';
      const language = 'en';
      const mockToken = 'csrf-token-12345';

      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue(mockToken)
        })
        .mockResolvedValueOnce({
          status: 200,
          json: jest.fn().mockResolvedValue([])
        });

      await fetchGlossarySuggestions(content, language);

      expect(global.fetch).toHaveBeenCalledWith('http://example.com/pdq/api/glossifier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-Token': mockToken,
        },
        body: expect.any(String)
      });
    });

    it('should make CSRF token request without additional headers', async () => {
      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          text: jest.fn().mockResolvedValue('token')
        })
        .mockResolvedValueOnce({
          status: 200,
          json: jest.fn().mockResolvedValue([])
        });

      await fetchGlossarySuggestions('test', 'en');

      expect(global.fetch).toHaveBeenCalledWith('http://example.com/session/token');
    });
  });
});
