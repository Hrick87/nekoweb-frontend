// Needed for RSS feed generation
const pluginRss = require("@11ty/eleventy-plugin-rss");

module.exports = function (eleventyConfig) {

  // This will stop the default behaviour of foo.html being turned into foo/index.html
  eleventyConfig.addGlobalData("permalink", "{{ page.filePathStem }}.html");

  eleventyConfig.addPassthroughCopy("src/graphics");
  eleventyConfig.addPassthroughCopy("src/CSS");
  eleventyConfig.addPassthroughCopy("src/.well-known");

  eleventyConfig.setTemplateFormats(["html", "njk", "txt", "js", "css", "xml", "json", "md"]);

  eleventyConfig.addShortcode('excerpt', post => extractExcerpt(post));

  // Needed for RSS feed generation
  eleventyConfig.addPlugin(pluginRss);

  // Readable date filter
  eleventyConfig.addFilter("readableDateTime", (dateObj) => {
    if (!dateObj) return "";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj);
  });

  /* BLOG POST SECTION START */
	function extractExcerpt(post) {
		if(post.templateContent.indexOf('</p>') > 0) {
			return post.templateContent;
		}
	}

  eleventyConfig.addCollection("categories", function(collectionApi) {
	let categories = new Set();
	let posts = collectionApi.getFilteredByTag('post');
	posts.forEach(p => {
		let cats = p.data.categories;
		cats.forEach(c => categories.add(c));
	});
	  return Array.from(categories);
  });

  eleventyConfig.addFilter("filterByCategory", function(posts, cat) {
	cat = cat.toLowerCase();
	let result = posts.filter(p => {
		let cats = p.data.categories.map(s => s.toLowerCase());
		return cats.includes(cat);
	});
	  return result;
  });
  /* BLOG POST SECTION END */

  return {
    // Use Nunjucks for HTML, Markdown, and data files
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",

    dir: {
      input: "src",
      output: "generated",
    },
  };
};