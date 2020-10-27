module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    require('cssnano')({ preset: 'default' }),
    ...(process.env.JEKYLL_ENV == "production" ? [require("cssnano")({ preset: "default" })] : [])
  ]
}
