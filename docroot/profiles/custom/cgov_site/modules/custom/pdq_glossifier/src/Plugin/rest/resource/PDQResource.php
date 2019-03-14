<?php

namespace Drupal\pdq_glossifier\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\Core\Session\AccountProxyInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\PreconditionFailedHttpException;

/**
 * Implements PDQ RESTful API POST verb.
 *
 * Examines the client's HTML fragment and proposes matches with the
 * PDQ glossary terms for glossification markup.
 *
 * @RestResource(
 *   id = "pdq_glossifier_api",
 *   label = @Translation("PDQ Glossifier API"),
 *   uri_paths = {
 *     "create" = "/pdq/api/glossifier"
 *   }
 * )
 */
class PDQResource extends ResourceBase {


  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * Values retrieved from the `pdq_glossary` table.
   *
   * @var array
   */
  protected $terms;

  /**
   * Constructs a new PDQResource object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param array $serializer_formats
   *   The available serialization formats.
   * @param \Psr\Log\LoggerInterface $logger
   *   A logger instance.
   * @param \Drupal\Core\Session\AccountProxyInterface $current_user
   *   A current user instance.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    AccountProxyInterface $current_user) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

    $this->currentUser = $current_user;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('pdq'),
      $container->get('current_user')
    );
  }

  /**
   * Response to POST requests.
   *
   * Examine the client's HTML fragment and identify candidates
   * for links to dictionaries.
   *
   * See https://github.com/NCIOCPL/cgov-digital-platform/wiki/Glossifier-service-API
   * for detailed information about the API.
   *
   * @param array $request
   *   Contains HTML fragment, dictionary list, and language list.
   *
   * @return \Drupal\rest\ResourceResponse
   *   Possibly empty sequence of node ID/language/error arrays
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function post(array $request) {
    $this->terms = $this->loadTerms();
    $fragment = $request['fragment'];
    $languages = $request['languages'];
    $dictionaries = $request['dictionaries'];
    $matches = $this->glossify($fragment, $languages, $dictionaries);
    $args = ['%count' => count($matches)];
    $this->logger->notice('Found %count glossary matches', $args);
    return new ResourceResponse($matches, 200);
  }

  /**
   * Load and decode the PDQ glossary terms from the `config` table.
   *
   * Normalize the term names used as keys for the information.
   *
   * @return array
   *   PDQ glossary term information.
   */
  private function loadTerms() {
    try {
      $config = \Drupal::config('pdq_glossifier.config');
      $terms = json_decode($config->get('terms'), TRUE);
      $normalized = [];
      foreach ($terms as $term => $docs) {
        $normalized_term = $this->normalize($term);
        foreach ($docs as $doc_id => $langs) {
          $normalized[$normalized_term][intval($doc_id)] = $langs;
        }
      }
      $args = ['%count' => count($normalized)];
      $this->logger->debug('Loaded %count glossary terms', $args);
      return $normalized;
    }
    catch (Exception $e) {
      throw new PreconditionFailedHttpException('Glossary not found');
    }
  }

  /**
   * Find glossary terms in an HTML fragment.
   *
   * @param string $fragment
   *   An HTML fragment, not necessarily well-formed.
   * @param array $languages
   *   Possibly empty list of languages to match (e.g., ['en']).
   * @param array $dictionaries
   *   Possiibly empty list of dictionaries (e.g., ['Cancer.gov']).
   *
   * @return array
   *   Sequence of keyed arrays, one for each glossary term matched.
   */
  private function glossify($fragment, array $languages, array $dictionaries) {

    // Block out portions of the HTML which should not be glossified.
    $masked = $this->prepDoc($fragment);
    $this->logger->debug('masked: %masked', ['%masked' => $masked]);

    // Create the regular expressions used to find matching terms.
    $regexes = $this->buildRegexes($languages, $dictionaries);

    // Collect the sequence of matching terms here.
    $matches = [];

    // Remember which terms we've already matched.
    $seen = [];

    // Do the matching in chunks, because of limitations in PHP's regex engine.
    foreach ($regexes as $regex) {

      // Find all the matches for this regular expression.
      preg_match_all($regex, $masked, $results, PREG_OFFSET_CAPTURE);
      foreach ($results[0] as $result) {

        // Find the offsets in characters, not bytes.
        list($word, $offset) = $result;
        $prefix = substr($masked, 0, $offset);
        $suffix = substr($masked, $offset + strlen($word));
        $start = mb_strlen($prefix, 'utf-8');
        $length = mb_strlen($word, 'utf-8');
        $args = ['%word' => $word, '%offset' => $offset, '%start' => $start];
        $this->logger->debug('%word at %offset (%start)', $args);

        // Make sure we don't match substrings of this term with the next regex.
        $mask = $this->makeMask($word);
        $masked = $prefix . $mask . $suffix;

        // Figure out if this is the first occurrence of this term in the HTML.
        $key = $this->normalize($word);
        $first = !in_array($key, $seen);
        if ($first) {
          $seen[] = $key;
        }

        // Capture the information we'll need for this matching term.
        $matches[] = [
          'start' => $start,
          'length' => $length,
          'key' => $key,
          'first' => $first,
        ];
      }
    }

    // Put the matches in the order we'd have with a single regular expression.
    usort($matches, [$this, 'compareByOffset']);

    // Assemble the array to be returned to the caller.
    $result = [];
    foreach ($matches as $match) {
      $key = $match['key'];
      if (array_key_exists($key, $this->terms)) {
        $docs = $this->terms[$key];
        foreach ($docs as $doc_id => $term) {
          foreach ($term as $lang => $dicts) {

            // If the client asked for this language, or didn't limit the
            // request by language, include entries for the appropriate
            // dictionaries.
            if (empty($languages) || in_array($lang, $languages)) {

              // If the caller specified no dictionaries, and the document
              // is not dictionary-specific, include this match (without
              // identifying a dictionary).
              if (empty($dicts) && empty($dictionaries)) {
                $result[] = $this->wrap($match, $doc_id, $lang);
              }

              // Otherwise, include an entry for each dictionary requested
              // by the client if this term belongs in that dictionary.
              elseif (!empty($dictionaries)) {
                foreach ($dicts as $dict) {
                  if (in_array($dict, $dictionaries)) {
                    $result[] = $this->wrap($match, $doc_id, $lang, $dict);
                  }
                }
              }
            }
          }
        }
      }
    }
    return $result;
  }

  /**
   * Assemble an array of regular expressions for finding the terms.
   *
   * Stock PHP is incapable of handling large regular expressions.
   * therefore we must break up our regular expression into several
   * passes. This introduces some unfortunate complications into the
   * code, as well as a performance hit, but the alternatives were
   * even less attractive.
   *
   * We have to construct the regular expressions based on which
   * languages and dictionaries are requested by the client, leaving out
   * terms names which aren't used by those languages and dictionaries.
   * This is why we don't just store the regular expressions in the
   * database instead of the raw glossary term information.
   *
   * @param array $langs
   *   List of languages ('en', 'es') requested by the client
   *   (possibly empty).
   * @param array $dicts
   *   List of dictionaries (e.g., 'Cancer.gov') requested by the client
   *   (also possibly empty).
   *
   * @return array
   *   Sequence of regular expression strings.
   */
  private function buildRegexes(array $langs, array $dicts) {

    // Build a sequence of term names, filtered by language/dictionary.
    $names = [];
    foreach ($this->terms as $name => $docs) {
      foreach ($docs as $languages) {
        foreach ($languages as $lang => $dictionaries) {

          // If the client specified certain languages, and this term
          // is not used in those languages, skip over it.
          if (empty($langs) || in_array($lang, $langs)) {

            // If the client doesn't restrict by dictionary, include the term.
            if (empty($dicts)) {
              $names[] = $name;
            }

            // Otherwise, only include it if the term appears in at least
            // one of the dictionaries specified by the client.
            elseif (!empty(array_intersect($dictionaries, $dicts))) {
              $names[] = $name;
            }
          }
        }
      }
    }

    // Sort the terms by length, longest first, to comply with the business
    // rule of not matching substrings of longer term names which also match.
    // For example, if 'colon cancer' appears in the HTML fragment, report
    // a match on that term but not for 'colon' or 'cancer' by themselves.
    // This works because the regular expression engine is greedy (and because
    // we're masking out each match between passes for the separate regular
    // expression strings).
    usort($names, [$this, 'compareByLength']);

    // Build separate regular expression strings, starting a new string when
    // we reach our length threshold. It's effectively impossible to know
    // with certainty exactly when the real threshold will be crossed, so
    // we pick an arbitrary number arrived at by trial and error, padded with
    // plenty of wiggle room.
    $regexes = [];
    $cumulative_length = 0;
    $regex_names = [];
    foreach ($names as $name) {

      // Modify the name to accomodate regular expression syntax delimiters.
      $regex = $this->toRegex($name);

      // If adding this name to the expression would cross the threshold
      // we've set, add the expression we're building to the list and start
      // a new expression. The funny-looking prefix and suffix tacked on to
      // the expression are a `negative lookbehind assertion` and a `negative
      // lookahead assertion` respectively. Basically, they ensure that the
      // term only matches if not preceded or followed by more Unicode word
      // characters. So "breast" will not match "abreast" in the fragment.
      $length = strlen($regex) + 1;
      if ($length + $cumulative_length > 25000) {
        $regex_name_string = implode('|', $regex_names);
        $new_regex = '/(?<!\w)(' . $regex_name_string . ')(?!\w)/ui';
        $this->logger->debug('Created regex %regex', ['%regex' => $new_regex]);
        $regexes[] = $new_regex;
        $regex_names = [];
        $cumulative_length = 0;
      }
      $regex_names[] = $regex;
      $cumulative_length += $length;
    }

    // Wrap up the last expression and add it to the list, which we return.
    if (!empty($regex_names)) {
      $regex_name_string = implode('|', $regex_names);
      $new_regex = '/(?<!\w)(' . $regex_name_string . ')(?!\w)/ui';
      $this->logger->debug('Created regex %regex', ['%regex' => $new_regex]);
      $regexes[] = $new_regex;
    }
    return $regexes;
  }

  /**
   * Create the keyed array for a term to go into the result for the client.
   *
   * @param array $match
   *   Values which we captured using our regex loop.
   * @param int $doc_id
   *   Unique identifier of the PDQ glossary term document.
   * @param string $lang
   *   Language in which this term is used.
   * @param string $dict
   *   Optional dictionary in which the term appears (all if not specified)
   *
   * @return array
   *   Values formatted for the array of matches returned to the client.
   */
  private function wrap(array $match, int $doc_id, string $lang, string $dict = NULL) {
    $wrapped = [
      'start' => $match['start'],
      'length' => $match['length'],
      'doc_id' => sprintf("CDR%010d", $doc_id),
      'language' => $lang,
      'first_occurrence' => $match['first'],
    ];
    if ($dict !== NULL) {
      $wrapped['dictionary'] = $dict;
    }
    return $wrapped;
  }

  /**
   * Make a version of a term name without capitalization or spacing variants.
   *
   * Also, map "smart" single quote to apostrophe.
   *
   * @param string $name
   *   Term name as it appears in the client's HTML fragment.
   *
   * @return string
   *   String we can use to detect when we have seen this term before.
   */
  private function normalize($name) {
    $key = str_replace("\u{2019}", "'", preg_replace('/\s+/', ' ', $name));
    return mb_convert_case($key, MB_CASE_LOWER, 'utf-8');
  }

  /**
   * Callback for sorting the matches in the order they appear in the HTML.
   *
   * @param array $a
   *   One of the two matches to be sorted.
   * @param array $b
   *   The other match.
   *
   * @return int
   *   If the first match should come after the second, return 1; else -1.
   */
  private function compareByOffset(array $a, array $b) {
    return $a['start'] > $b['start'] ? 1 : -1;
  }

  /**
   * Callback for sorting longer terms before shorter ones.
   *
   * The term strings by this point have been modified to escape
   * regular expression special characters and to match whitespace
   * and single quote marks intelligently. The lengths used for
   * determining which terms should be represented first in the
   * larger regular expression string must however be based on
   * the number of character which will be matched in the HTML
   * fragment. So we create altered strings for calculating those
   * lengths. It doesn't really matter which of two strings of the
   * same length appears in the regex first, but we come up with an
   * arbitrary choice in that case so that the sorting is deterministic.
   *
   * @param string $a
   *   One of the two terms to be sorted.
   * @param string $b
   *   The other term.
   *
   * @return int
   *   If the first term should come after the second, return 1; else -1.
   */
  private function compareByLength(string $a, string $b) {
    $strcmp = $a > $b ? 1 : -1;
    foreach (["['\u{2019}]", '\\\\', '\s+'] as $reduce) {
      $a = str_replace($reduce, 'X', $a);
      $b = str_replace($reduce, 'X', $b);
    }
    $a_len = mb_strlen(str_replace('\\', '', $a), 'utf-8');
    $b_len = mb_strlen(str_replace('\\', '', $b), 'utf-8');
    if ($a_len == $b_len) {
      return $strcmp;
    }
    return $a_len > $b_len ? -1 : 1;
  }

  /**
   * Mask out portions of the HTML fragment which should be ignored.
   *
   * The patterns used for masking remove comments, links, all
   * markup tags, and substrings enclosed in doubled curly braces
   * from consideration when looking for matching dictionary terms.
   *
   * @param string $doc
   *   HTML fragment string to be masked.
   *
   * @return string
   *   Modified string with portions redacted.
   */
  private function prepDoc($doc) {

    $patterns = [

      // Ignore comments.
      '#<!--.*?-->#s',

      // Ignore terms which have already been glossified.
      '#<a\s[^>]+>.*?</a>|{{.*?}}#isu',

      // Ignore markup tags and their attributes.
      '#<[^>]*>#',
    ];

    foreach ($patterns as $pattern) {
      $doc = preg_replace_callback($pattern, [$this, 'mask'], $doc);
    }
    return $doc;
  }

  /**
   * Callback for replacing portions we want to ignore with pipe characters.
   *
   * Note that we have to use the number of pipe characters which matches
   * the number of _characters_ in the string we're replacing, not the
   * number of _bytes_ used to serialize that string as UTF-8.
   *
   * @param array $matches
   *   The first element of this array represents the entire matched string.
   *
   * @return string
   *   The replacement string consisting of a sequence of pipe characters.
   */
  private function mask(array $matches) {
    return str_repeat('|', mb_strlen($matches[0], 'utf-8'));
  }

  /**
   * Create a mask with the right number of bytes *and* characters.
   *
   * OK, this is one of the uglier bits. As we know, PHP doesn't
   * handle Unicode very intelligently, as its regular expression
   * engine reports offsets in bytes, not characters. Our client
   * expects the offsets and lengths in characters, the way sane
   * programming systems work. So we have to preserve the original
   * positions of the remaining (unmasked) candidates for matching
   * glossary terms, both in terms of characters *and* in terms of
   * bytes.
   *
   * @param string $original
   *   String to be replaced.
   *
   * @return string
   *   Masking string with the same number of bytes *and* characters
   *   as the original string.
   */
  private function makeMask(string $original) {
    $bytes = strlen($original);
    $chars = mb_strlen($original, 'utf-8');
    $extra = $bytes - $chars;
    $mask = [];
    while ($extra > 0) {

      // Since RFC 3629 the maximum number of bytes which can be required
      // for a legal Unicode code point is four, so the "worst" case is
      // four bytes for each character, or three "extra" bytes for each
      // character (e.g., $original has three characters, each of which
      // is represented by four utf-8 bytes, so $extra would start out
      // at 3 * 4 - 3 = 9).
      switch ($extra) {
        case 1:
          $mask[] = "\u{0100}";
          $extra--;
          $chars--;
          break;

        case 2:
          $mask[] = "\u{0800}";
          $extra -= 2;
          $chars--;
          break;

        default:
          $mask[] = "\u{10000}";
          $extra -= 3;
          $chars--;
          break;
      }
    }

    // Fill out the rest of the mask with the pipe character.
    if ($chars > 0) {
      $mask[] = str_repeat('|', $chars);
    }

    // Assemble and return the mask.
    return implode('', $mask);
  }

  /**
   * Escape a term name so that it will work in a regular expression.
   *
   * It is important that a backslash character appearing in the original
   * term name (unlikely, but possible) be escaped before any other
   * characters in the string. Otherwise, the backslashes we use to
   * escape those other characters would themselves be escaped. Note that
   * we also have a business rule that the so-called "smart" single quote
   * is to be matched as if it were an ASCII apostrophe.
   *
   * @param string $name
   *   Term name to be escaped.
   *
   * @return string
   *   Caller's string, modified to be suitable for a regex.
   */
  private static function toRegex($name) {
    $name = str_replace('\\', '\\\\', $name);
    $name = str_replace('+', '\+', $name);
    $name = str_replace(' ', '\s+', $name);
    $name = str_replace('.', '\.', $name);
    $name = str_replace('^', '\^', $name);
    $name = str_replace('$', '\$', $name);
    $name = str_replace('*', '\*', $name);
    $name = str_replace('?', '\?', $name);
    $name = str_replace('{', '\{', $name);
    $name = str_replace('}', '\}', $name);
    $name = str_replace('[', '\[', $name);
    $name = str_replace(']', '\]', $name);
    $name = str_replace('(', '\(', $name);
    $name = str_replace(')', '\)', $name);
    $name = str_replace('/', '\/', $name);
    $name = str_replace("'", '{{APOS}}', $name);
    $name = str_replace("\u{2019}", '{{APOS}}', $name);
    $name = str_replace('{{APOS}}', "['\u{2019}]", $name);
    return $name;
  }

}
