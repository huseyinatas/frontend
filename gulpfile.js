let project_folder = 'dist'
let source_folder  = 'src'

let path = {
    build:{
        html : project_folder + '/',
        css  : project_folder + '/css/',
        js   : project_folder + '/js/',
        img  : project_folder + '/img/'
    },
    src:{
        html : [
            source_folder + '/**/*.html',
            "!" + source_folder + '/**/_*.html',
            "!" + source_folder + '/components/*.html',
        ],
        css  : source_folder + '/scss/**/*.scss',
        js   : source_folder + '/js/**/*.js',
        img  : source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}'
    },
    watch:{
        html : source_folder + '/**/*.html',
        css  : source_folder + '/scss/**/*.scss',
        js   : source_folder + '/js/**/*.js',
        img  : source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}'
    },
    clean: './' + project_folder + '/'
}

let {src, dest}     = require('gulp'),
    gulp            = require('gulp'),
    browsersync     = require('browser-sync').create(),
    fileinclude     = require('gulp-file-include'),
    del             = require('del'),
    scss            = require('gulp-sass'),
    autoprefixer    = require('gulp-autoprefixer'),
    clean_css       = require('gulp-clean-css'),
    minifyJS        = require('gulp-uglify'),
    concat          = require('gulp-concat'),
    imagemin        = require('gulp-imagemin'),
    webp            = require('gulp-webp'),
    svgSprite       = require('gulp-svg-sprite');

function browserSync(){
    browsersync.init({
        server:{
            baseDir: './' + project_folder + '/'
        },
        port: 3000,
        notify: false
    })
}

function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
}
function css(){
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: 'compressed'
            })
        )
        .pipe(
            autoprefixer({
                overrideBrowserslist: ['Last 5 versions'],
                cascade: true
            })
        )
        .pipe(clean_css())
        .pipe(concat('app.min.css'))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream());
}

function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(concat('app.min.js'))
        .pipe(minifyJS())
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream());
}
function images() {
    return src(path.src.img)
        /*.pipe(
            webp({
                quality: 70
            })
        )
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        */
        .pipe(
            imagemin({
                progressive: true,
                interlaced: true,
                optimizationLevel: 3
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream());
}
gulp.task('svgSprite', () =>{
    return gulp.src([source_folder + '/iconsprite/*.svg'])
        .pipe(
            svgSprite({
                mode: {
                    stack: {
                        sprite: '../icon/icons.svg',
                        example: true
                    }
                }
            })
        )
        .pipe(dest(path.build.img))


});
function watchFiles(){
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}
function clean(){
    return del(path.clean);
}
let build = gulp.series(clean, gulp.parallel(css, js, html, images));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.images  = images;
exports.js  = js;
exports.css  = css;
exports.html  = html;
exports.build = build;
exports.watch = watch;

exports.default = watch;