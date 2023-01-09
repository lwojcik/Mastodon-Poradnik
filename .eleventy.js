const markdownIt = require("markdown-it");
const htmlmin = require("html-minifier");
const { format } = require("date-fns");
const pl = require("date-fns/locale/pl");
const externalLinks = require("eleventy-plugin-external-links");
const orderedQuestionSlugs = require("./content/_data/orderedQuestionSlugs.json");

const MARKDOWN_OPTIONS = {
  html: true,
  xhtmlOut: true,
  // linkify: true,
  typographer: true,
  breaks: true
};

module.exports = function (eleventyConfig) {
  eleventyConfig.addLayoutAlias("base", "layouts/base.njk");
  eleventyConfig.addLayoutAlias("full", "layouts/full.njk");
  eleventyConfig.addLayoutAlias("question", "layouts/question.njk");

  eleventyConfig.setLibrary("md", markdownIt(MARKDOWN_OPTIONS));

  eleventyConfig.addFilter("toHTML", (str) => {
    return new markdownIt(MARKDOWN_OPTIONS).renderInline(str);
  });

  eleventyConfig.addFilter("makeLinksLocal", (content) => {
    return content;
  });

  eleventyConfig.addPlugin(externalLinks, {
    name: "external-links", // Plugin name
    regex: /^(([a-z]+:)|(\/\/))/i, // Regex that test if href is external
    target: "_blank", // 'target' attribute for external links
    rel: "external noopener noreferrer", // 'rel' attribute for external links
    extensions: [".html"], // Extensions to apply transform to
    includeDoctype: true // Default to include '<!DOCTYPE html>' at the beginning of the file
  });

  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addShortcode("currentYear", () => {
    return DateTime.local().toFormat("yyyy");
  });

  // Define passthrough for assets
  eleventyConfig.addPassthroughCopy({
    assets: "./"
  });

  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    if (outputPath && outputPath.endsWith(".html")) {
      return htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
    }
    return content;
  });

  eleventyConfig.addCollection("questionDataObject", function (collectionApi) {
    const data = {};
    const targetCollection = collectionApi.getFilteredByTag("question");

    targetCollection.forEach((el) => {
      const slug = el.data.slug;
      data[slug] = el;
    });

    return data;
  });

  eleventyConfig.addCollection("questionDataArray", (collectionApi) => {
    const data = [];
    const targetCollection = collectionApi.getFilteredByTag("question");

    orderedQuestionSlugs.forEach((questionSlug) => {
      const element = targetCollection.find(
        (item) => item.data.slug === questionSlug
      );
      data.push(element);
    });

    return data;
  });

  eleventyConfig.addFilter("findIndexBySlug", (collection = [], value) =>
    collection.findIndex((item) => item.data.slug === value)
  );

  eleventyConfig.addFilter("readableDate", (date) =>
    format(date, "dd MMMM yyyy, HH:mm", {
      locale: pl
    })
  );

  eleventyConfig.addFilter("getByIndex", (collection = [], value) => {
    if (value < 0) return null;
    return collection[value];
  });

  eleventyConfig.addShortcode("currentYear", () =>
    new Date().getFullYear().toString()
  );

  eleventyConfig.addPlugin(require("eleventy-plugin-emoji"));

  return {
    dir: {
      input: "content"
    }
  };
};
