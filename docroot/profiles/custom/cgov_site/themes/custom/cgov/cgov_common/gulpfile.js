const path = require("path");
const gulp = require("gulp");
const svgSprite = require("gulp-svg-sprite");
const merge = require("merge-stream");
const imagemin = require("gulp-imagemin");
const mozjpeg = require("imagemin-mozjpeg");
const pngquant = require("imagemin-pngquant");
const giflossy = require("imagemin-giflossy");
// const spriteConfig = requireUncached('./sprites.config.js');
const { variants: themeVariants } = require("./themes.config.js");

function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}

const distDirectory = path.resolve(__dirname);

// for sprites that exist within a theme or subtheme
gulp.task("sprites", async () => {
  // get a fresh config object on each iteration since svg-sprite causes it to mutate
  const spriteConfig = requireUncached("./sprites.config.js");
  return gulp
    .src("**/*.svg", { cwd: path.resolve(__dirname, `./assets/sprites`) })
    .pipe(svgSprite(spriteConfig))
    .pipe(gulp.dest(distDirectory));
});

// for sprites that exist within a color variant of a theme or subtheme
gulp.task("variant_sprites", async () => {
  return merge(
    themeVariants.map(variant => {
      // get a fresh config object on each iteration since svg-sprite causes it to mutate
      let spriteConfig = requireUncached("./sprites.config.js");
      variantOverrides = {
        sprite: path.resolve(distDirectory, `./dist/images/sprites/svg-sprite-${variant}.svg`),
        render: {
          scss: {
            dest: path.resolve(
              __dirname,
              `./src/variants/${variant}/styles/sprites/_svg-sprite-map.scss`
            ),
            template: path.resolve(
              __dirname,
              "../src/styles/sprites/sprite-template.scss"
            )
          }
        }
      };

      spriteConfig.mode.css = Object.assign(
        {},
        spriteConfig.mode.css,
        variantOverrides
      );

      return gulp
        .src("**/*.svg", {
          cwd: path.resolve(
            __dirname,
            `./src/variants/${variant}/assets/sprites`
          )
        })
        .pipe(svgSprite(spriteConfig))
        .pipe(gulp.dest(distDirectory));
    })
  );
});

// optimize and move raster images. Excluding .svg files for now. This would require a new glob pattern to include all
// .svg files that are not within the 'sprites' folder.
gulp.task("images", async () => {
  return merge(
    themeVariants.map(variant => {
      return gulp
        .src(["**/*.{png,jpg,gif}"], {
          cwd: path.resolve(`./src/variants/${variant}/assets/`)
        })
        .pipe(
          imagemin([
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
          ])
        )
        .pipe(gulp.dest(path.resolve(distDirectory, `./dist/images`)));
    })
  );
});

gulp.task("default", gulp.series("sprites", "variant_sprites", "images"));
