const path = require('path');

module.exports = {
    "Common": path.resolve(__dirname, "src/entrypoints/global/Common.js"),
    "Article": path.resolve(__dirname, "src/entrypoints/article/Article.js"),
    "Homelanding": path.resolve(__dirname, "src/entrypoints/homelanding/Homelanding.js"),
    "Minilanding": path.resolve(__dirname, "src/entrypoints/minilanding/Minilanding.js"),
    "CancerCenters": path.resolve(__dirname, "src/entrypoints/cancerCenters/CancerCenters.js"),
    "BlogPost": path.resolve(__dirname, "src/entrypoints/blogPost/BlogPost.js"),
    "BlogSeries": path.resolve(__dirname, "src/entrypoints/blogSeries/BlogSeries.js"),
    "Biography": path.resolve(__dirname, "src/entrypoints/biography/Biography.js"),
    "Event": path.resolve(__dirname, "src/entrypoints/event/Event.js")
}
