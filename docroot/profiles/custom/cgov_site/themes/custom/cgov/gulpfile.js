const path = require('path');
const gulp = require('gulp');
const svgSprite = require('gulp-svg-sprite');
const merge = require('merge-stream');
const spriteConfig = require('./spriteConfig.js');
const themes = require('./registeredThemes.js');

gulp.task('sprites', () => {
    return merge(themes.map(themePath => {
        console.log('*****', themePath)
        return gulp.src('**/*.svg', { cwd: `${ themePath }/assets/sprites`})
            .pipe(svgSprite(spriteConfig))
            .pipe(gulp.dest(`${ themePath }/dist`))
    }))
});

gulp.task('default', ['sprites'])