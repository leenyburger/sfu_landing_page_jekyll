module.exports = {
  enabled: (process.env.JEKYLL_ENV == "production"),
  content: ["./_site/**/*.html"],
  css: ["./_site/assets/main.css"],

  // Tailwind CSS config
  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
};
