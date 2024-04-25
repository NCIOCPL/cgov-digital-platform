import getQueryString from "./get-query-string";

/**
 * Get the Blog page location (post, series, or topic)
 */
export default function () {
  if (getQueryString('topic')) {
      return 'Category';
  } else if (document.querySelector('[content="cgvBlogSeries"], #cgvBody.cgvblogseries')) {
      return 'Series';
  } else if (document.querySelector('[content="cgvBlogPost"], #cgvBody.cgvblogpost')) {
      return 'Post';
  } else {
      return '';
  }
};
