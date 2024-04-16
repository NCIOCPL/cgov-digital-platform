/***
 * @file
 * Declaration of application entrypoints.
 */

const path = require("path");

module.exports = {
  Common: path.resolve(__dirname, "src/entrypoints/global/Common.js"),
  Ckeditor: path.resolve(__dirname, "src/entrypoints/ckeditor/Ckeditor.js"),
  Article: path.resolve(__dirname, "src/entrypoints/article/Article.js"),
  Homelanding: path.resolve(
    __dirname,
    "src/entrypoints/homelanding/Homelanding.js"
  ),
  SpecialReport: path.resolve(
    __dirname,
    "src/entrypoints/specialReport/SpecialReport.js"
  ),
  dcegConnect: path.resolve(
      __dirname,
      "src/entrypoints/dcegConnect/dcegConnect.js"
  ),
  PDQ: path.resolve(__dirname, "src/entrypoints/pdq/PDQ.js"),
  Minilanding: path.resolve(
    __dirname,
    "src/entrypoints/minilanding/Minilanding.js"
  ),
  CancerCenters: path.resolve(
    __dirname,
    "src/entrypoints/cancerCenters/CancerCenters.js"
  ),
  BlogPost: path.resolve(__dirname, "src/entrypoints/blogPost/BlogPost.js"),
  BlogSeries: path.resolve(
    __dirname,
    "src/entrypoints/blogSeries/BlogSeries.js"
  ),
  Biography: path.resolve(__dirname, "src/entrypoints/biography/Biography.js"),
  Connect: path.resolve(__dirname, "src/variants/connect/entrypoints/Connect.js"),
  CTHP: path.resolve(__dirname, "src/entrypoints/cthp/CTHP.js"),
  Event: path.resolve(__dirname, "src/entrypoints/event/Event.js"),
};
