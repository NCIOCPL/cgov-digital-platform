const path = require('path');
const async = require('async');
const gulp = require('gulp');
const svgSprite = require('gulp-svg-sprite');
const merge = require('merge-stream');
// const spriteConfig = requireUncached('./sprites.config.js');
const themes = require('./themes.config.js');

function requireUncached(module){
  delete require.cache[require.resolve(module)];
  return require(module);
}

gulp.task('sprites', () => {
    return merge(themes.map(themePath => {
      // get a fresh config object on each iteration since svg-sprite causes it to mutate
      const spriteConfig = requireUncached('./sprites.config.js');
      return gulp.src('**/*.svg', { cwd: `${ themePath }/assets/sprites`})
        .pipe(svgSprite(spriteConfig))
        .pipe(gulp.dest(`${ themePath }/dist`))
    }))
});

gulp.task('default', ['sprites']);