module.exports = {
  plugins: [
    require('postcss-import'),  // Add this first!
    require('autoprefixer'),
    require('postcss-preset-env')({ 
      stage: 3,
      features: {'nesting-rules': true} 
    }),
    require('cssnano')
  ]
};