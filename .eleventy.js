module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "css": "css" });
  eleventyConfig.addPassthroughCopy({ "js": "js" });
  eleventyConfig.addPassthroughCopy({ "img": "img" });
  eleventyConfig.addPassthroughCopy("src/CNAME");

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateObj).toLocaleDateString("en-US", options);
  });

  eleventyConfig.addFilter("isoDate", (dateObj) => {
    return new Date(dateObj).toISOString().split("T")[0];
  });

  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if (n < 0) {
      return array.slice(n);
    }
    return array.slice(0, n);
  });

  eleventyConfig.addFilter("filterByTag", (posts, tag) => {
    if (!posts || !tag) return posts;
    return posts.filter(post => {
      const postTags = post.data.postTags || [];
      return postTags.includes(tag);
    });
  });

  eleventyConfig.addCollection("journal", (collectionApi) => {
    return collectionApi.getFilteredByGlob("src/journal/*.md").reverse();
  });

  eleventyConfig.addCollection("postTags", (collectionApi) => {
    const tagsSet = new Set();
    collectionApi.getFilteredByGlob("src/journal/*.md").forEach(item => {
      if (item.data.postTags) {
        item.data.postTags.forEach(tag => tagsSet.add(tag));
      }
    });
    return [...tagsSet].sort();
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
