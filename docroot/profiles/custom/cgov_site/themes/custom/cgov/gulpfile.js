const path = require('path');
const gulp = require('gulp');
const svgSprite = require('gulp-svg-sprite');

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
    return gulp.src('cgov_common/assets/sprites/**/*.svg')
        .pipe(svgSprite(svgSpriteConfig))
        .pipe(gulp.dest('cgov_common/dist'))
});

gulp.task('default', ['sprites'])