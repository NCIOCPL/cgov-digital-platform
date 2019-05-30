const path = require('path');
const gulp = require('gulp');
const svgSprite = require('gulp-svg-sprite');
const merge = require('merge-stream');
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');
const giflossy = require('imagemin-giflossy');
// const spriteConfig = requireUncached('./sprites.config.js');
const themes = require('./themes.config.js');

function requireUncached(module){
  delete require.cache[require.resolve(module)];
  return require(module);
}

// for sprites that exist within a theme or subtheme
gulp.task('sprites', () => {
    return merge(Object.keys(themes).map(themePath => {
      // get a fresh config object on each iteration since svg-sprite causes it to mutate
      const spriteConfig = requireUncached('./sprites.config.js');
      return gulp.src('**/*.svg', { cwd: `${ themePath }/assets/sprites`})
        .pipe(svgSprite(spriteConfig))
        .pipe(gulp.dest(`${ themePath }/dist`))
    }))
});

// for sprites that exist within a color variant of a theme or subtheme
gulp.task('variant_sprites', () => {
  return Object.keys(themes).map(themePath => {
    return merge(themes[themePath].variants.map(variant => {
      // get a fresh config object on each iteration since svg-sprite causes it to mutate
      let spriteConfig = requireUncached('./sprites.config.js');
      variantOverrides = {
        sprite: `images/sprites/svg-sprite-${ variant }.svg`,
        render: {
            scss: {
                dest: `../src/variants/${ variant }/styles/sprites/_svg-sprite-map.scss`,
                template: 'src/styles/sprites/sprite-template.scss'
            }
        }
      }

      spriteConfig.mode.css = Object.assign({}, spriteConfig.mode.css, variantOverrides);

      return gulp.src('**/*.svg', { cwd: `${ themePath }/src/variants/${ variant }/assets/sprites`})
        .pipe(svgSprite(spriteConfig))
        .pipe(gulp.dest(`${ themePath }/dist`))
    }))
  })
});

// optimize and move raster images. Excluding .svg files for now. This would require a new glob pattern to include all
// .svg files that are not within the 'sprites' folder.
gulp.task('images', (done) => {
  return Object.keys(themes).map(themePath => {
    return merge(themes[themePath].variants.map(variant => {
      return gulp.src(['**/*.{png,jpg,gif}'], { cwd: `${ themePath }/src/variants/${ variant }/assets/`})
        .pipe(imagemin([
          mozjpeg({
              quality: 80
          }),
          pngquant({
            speed: 3,
            strip: true
          }),
          giflossy({
            optimizationLevel: 2,
            lossy: 80
          })
      ]))
      .on('error', function(error) {
        // we have an error
        done(error); 
      })
        .pipe(gulp.dest(`${ themePath }/dist/images`))
    }))
  })
});

gulp.task('default', ['sprites','variant_sprites','images']);