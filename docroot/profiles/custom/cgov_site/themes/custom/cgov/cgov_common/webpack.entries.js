const path = require('path');

module.exports = {
    "Common": path.resolve(__dirname, "src/entrypoints/global/Common.js"),
    "Ckeditor": path.resolve(__dirname, "src/entrypoints/ckeditor/Ckeditor.js"),
    "Article": path.resolve(__dirname, "src/entrypoints/article/Article.js"),
    "Homelanding": path.resolve(__dirname, "src/entrypoints/homelanding/Homelanding.js"),
    "Minilanding": path.resolve(__dirname, "src/entrypoints/minilanding/Minilanding.js"),
    "CancerCenters": path.resolve(__dirname, "src/entrypoints/cancerCenters/CancerCenters.js"),
    "BlogPost": path.resolve(__dirname, "src/entrypoints/blogPost/BlogPost.js"),
    "Biography": path.resolve(__dirname, "src/entrypoints/biography/Biography.js"),
    "Event": path.resolve(__dirname, "src/entrypoints/event/Event.js"),
    "Purple": path.resolve(__dirname, "src/variants/purple/entrypoints/Purple.js"),
    "Blue": path.resolve(__dirname, "src/variants/blue/entrypoints/Blue.js")
}
