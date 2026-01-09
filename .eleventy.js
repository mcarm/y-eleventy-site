const Image = require("@11ty/eleventy-img");

async function imageShortcode(src, alt, sizes = "100vw", widths = [400, 800, 1200], loading = "lazy") {
  const metadata = await Image(src, {
    widths: widths,
    formats: ["webp", "jpeg"],
    outputDir: "./_site/img/optimized/",
    urlPath: "/img/optimized/",
    filenameFormat: function (id, src, width, format) {
      const name = src.split("/").pop().split(".")[0];
      return `${name}-${width}w.${format}`;
    }
  });

  const imageAttributes = {
    alt,
    sizes,
    loading,
    decoding: "async",
  };

  return Image.generateHTML(metadata, imageAttributes);
}

async function heroImageShortcode(src, alt) {
  const metadata = await Image(src, {
    widths: [800, 1200, 1920],
    formats: ["webp", "jpeg"],
    outputDir: "./_site/img/optimized/",
    urlPath: "/img/optimized/",
    filenameFormat: function (id, src, width, format) {
      const name = src.split("/").pop().split(".")[0];
      return `${name}-${width}w.${format}`;
    }
  });

  const webp = metadata.webp;
  const jpeg = metadata.jpeg;
  
  return {
    srcset: webp.map(img => `${img.url} ${img.width}w`).join(", "),
    fallback: jpeg[jpeg.length - 1].url,
    sizes: "100vw"
  };
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "css": "css" });
  eleventyConfig.addPassthroughCopy({ "js": "js" });
  eleventyConfig.addPassthroughCopy({ "img": "img" });
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/uploads");

  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addNunjucksAsyncShortcode("heroImage", heroImageShortcode);

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

  eleventyConfig.addCollection("gallery", (collectionApi) => {
    return collectionApi.getFilteredByGlob("src/galleries/*.md").sort((a, b) => {
      return (a.data.order || 0) - (b.data.order || 0);
    });
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
