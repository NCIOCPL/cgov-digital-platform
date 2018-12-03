const path = require('path');
const gulp = require('gulp');
const svgSprite = require('gulp-svg-sprite');
const merge = require('merge-stream');
const themes = require('./registeredThemes.js');

const svgSpriteConfig = {
    mode: {
        css: {
            render: {
                css: true
            }
        }
    }
}
gulp.task('sprites', () => {
    return merge(themes.map(themePath => {
        return gulp.src(`${ themePath }/assets/sprites/**/*.svg`)
            .pipe(svgSprite(svgSpriteConfig))
            .pipe(gulp.dest(`${ themePath }/dist`))
    }))
});

gulp.task('default', ['sprites'])