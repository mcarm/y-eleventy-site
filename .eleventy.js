const Image = require("@11ty/eleventy-img");
const path = require("path");

async function optimizeImage(src, widths = [400, 800, 1200]) {
  const inputPath = src.startsWith("/") ? `src${src}` : src;
  
  const metadata = await Image(inputPath, {
    widths: widths,
    formats: ["webp", "jpeg"],
    outputDir: "./_site/img/optimized/",
    urlPath: "/img/optimized/",
    filenameFormat: function (id, src, width, format) {
      const name = path.basename(src, path.extname(src));
      return `${name}-${width}w.${format}`;
    },
    sharpJpegOptions: { quality: 80, progressive: true },
    sharpWebpOptions: { quality: 80 },
  });
  
  return metadata;
}

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

  eleventyConfig.addNunjucksAsyncShortcode("postImage", async function(src, alt = "") {
    if (!src) return "";
    const inputPath = src.startsWith("/") ? `src${src}` : src;
    
    try {
      const metadata = await Image(inputPath, {
        widths: [400, 800, 1200],
        formats: ["webp", "jpeg"],
        outputDir: "./_site/img/optimized/",
        urlPath: "/img/optimized/",
        filenameFormat: function (id, src, width, format) {
          const name = path.basename(src, path.extname(src));
          return `${name}-${width}w.${format}`;
        },
        sharpJpegOptions: { quality: 80, progressive: true },
        sharpWebpOptions: { quality: 80 },
      });
      
      return Image.generateHTML(metadata, {
        alt,
        sizes: "(max-width: 800px) 100vw, 800px",
        loading: "lazy",
        decoding: "async",
      });
    } catch (e) {
      console.warn(`Could not optimize image: ${src}`, e.message);
      return `<img src="${src}" alt="${alt}" loading="lazy">`;
    }
  });

  eleventyConfig.addFilter("optimizedUpload", (src) => {
    if (!src) return "";
    const name = src.split("/").pop().split(".")[0];
    return `/uploads/optimized/${name}-800w.jpeg`;
  });

  eleventyConfig.addFilter("optimizedUploadSrcset", (src) => {
    if (!src) return "";
    const name = src.split("/").pop().split(".")[0];
    return `/uploads/optimized/${name}-400w.webp 400w, /uploads/optimized/${name}-800w.webp 800w, /uploads/optimized/${name}-1200w.webp 1200w`;
  });

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

  eleventyConfig.addFilter("nl2br", (str) => {
    if (!str) return "";
    return str.replace(/\n/g, "<br>");
  });

  eleventyConfig.addFilter("readingTime", (content) => {
    if (!content) return "1 min read";
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  });

  eleventyConfig.addFilter("wordCount", (content) => {
    if (!content) return 0;
    return content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  });

  eleventyConfig.addFilter("excerpt", (content, length = 160) => {
    if (!content) return "";
    const text = content.replace(/<[^>]*>/g, "").trim();
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + "...";
  });

  eleventyConfig.addFilter("slugify", (str) => {
    if (!str) return "";
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  });

  eleventyConfig.addFilter("relatedPosts", (collection, currentPost, limit = 3) => {
    if (!collection || !currentPost) return [];
    const currentTags = currentPost.data.postTags || [];
    if (currentTags.length === 0) return [];
    
    return collection
      .filter(post => post.url !== currentPost.url)
      .map(post => {
        const postTags = post.data.postTags || [];
        const sharedTags = currentTags.filter(tag => postTags.includes(tag));
        return { post, score: sharedTags.length };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.post);
  });

  eleventyConfig.addCollection("journal", (collectionApi) => {
    const isProduction = process.env.NODE_ENV === "production";
    return collectionApi.getFilteredByGlob("src/journal/*.md")
      .filter(post => !isProduction || !post.data.draft)
      .reverse();
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
