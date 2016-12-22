var gulp = require('gulp');
var stylus = require('gulp-stylus');
var autoprefixer = require('gulp-autoprefixer');
var watch = require('gulp-watch');
var htmlmin = require('gulp-htmlmin');
var browserSync = require('browser-sync').create();
var Pageres = require('pageres');
var uncss = require('gulp-uncss');
var psi = require('psi');
var ngrok = require('ngrok');
const imagemin = require('gulp-imagemin');
var gulpif = require('gulp-if');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
const del = require('del');
var pug = require('gulp-pug');
var csso = require('gulp-csso');
var plumber = require('gulp-plumber');

var dev_watch = ['assets:watch', 'browser:watch', 'css:watch', 'html:watch', 'img:watch', 'js:watch', 'pug:watch', 'vendor:watch'];
var dev_ngrok = ['assets:watch', 'browser:watch', 'css:watch', 'html:watch', 'img:watch', 'js:watch', 'pug:watch', 'vendor:watch', 'ngrok'];
var dev_build = ['assets:build', 'browser:build', 'css:build', 'html:build', 'img:build', 'js:build', 'pug:build', 'vendor:build'];

var dev = false;
var prod = false;

gulp.task('default', function() {
    return
});

gulp.task('dev:watch', dev_watch, function() {
    return
});

gulp.task('dev:ngrok', dev_ngrok, function() {
    return
});

gulp.task('dev:build', dev_build, function() {
    return
});

var runAssets = function() {
    return gulp.src(['./app/assets/**/*.*', '!./app/assets/{.png,jpg}'], {dot: false})
        .pipe(gulpif(prod, gulp.dest('./build/assets'), gulp.dest('./public/assets')));
}

gulp.task('assets:build', function () {
	prod = true;
    runAssets();
});

gulp.task('assets:watch', function () {
    runAssets();
    watch(['./app/assets/**/*.*', '!./app/assets/*.{png,jpg,svg}'], {dot: false}, function() {
        runAssets();
    })
});


var runBrowser = function() {
    browserSync.init({
        server: {
            baseDir: './public',
        },
        open: false,
        plugins: ['bs-latency']
    });
    if(dev === true) {
        browserSync.watch(['./public/**/*.html', './public/**/*.css', './public/**/*.js', './public/**/*.{jpg,png,svg}'], function (event, file) {
            if(event === 'change') {
                browserSync.reload(file);
            }
        });
    }
}

gulp.task('browser:build', function () {
    runBrowser();
});

gulp.task('browser:watch', function () {
    dev = true;
    runBrowser();
});

var runCSS = function() {
    return gulp.src(['./app/**/*.{css,styl}', '!app/templates/**/*.*'])
        .pipe(gulpif(dev, plumber()))
        .pipe(gulpif(dev, sourcemaps.init()))
        .pipe(stylus({
            'include css': true,
        }))
        .pipe(autoprefixer({
            browsers: ['last 3 versions'],
            cascade: false
        }))
        .pipe(gulpif(prod, uncss({
            html: ['./app/**/*.html', '!app/templates/**/*.*']
        })))
        .pipe(gulpif(prod, csso()))
        .pipe(gulpif(dev, sourcemaps.write()))
        .pipe(gulpif(prod, gulp.dest('./build'), gulp.dest('./public')));
}

gulp.task('css:build', function () {
    prod = true;
    runCSS();
});

gulp.task('css:watch', function () {
    dev = true
    runCSS();
    watch('./app/**/*.{css,styl}', function() {
        runCSS();
    })
});

var runDelete = function() {
    //return gulpif(prod, del(['./production']), del(['./public']));
    if(prod == true) {
    	return del(['./build']);
    } else {
    	return del(['./public']);
    }
}

gulp.task('delete:build', function() {
    prod = true;
    runDelete();
});

var runHTML = function() {
    return gulp.src(['./app/**/*.html', '!app/templates/**/*.*'])
        .pipe(gulpif(prod, htmlmin({
            collapseWhitespace: true
        })))
        .pipe(gulpif(prod, gulp.dest('./build'), gulp.dest('./public')));
}

gulp.task('html:build', function() {
    prod = true;
    runHTML();
});

gulp.task('html:watch', function() {
    runHTML();
    watch('./app/**/*.html', function() {
        runHTML();
    })
});

var runPug = function() {
    return gulp.src(['./app/**/*.pug', '!app/templates/**/*.*'])
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulpif(prod, htmlmin({
            collapseWhitespace: true
        })))
        .pipe(gulpif(prod, gulp.dest('./build'), gulp.dest('./public')));
}

gulp.task('pug:build', function() {
    prod = true;
    runPug();
});

gulp.task('pug:watch', function() {
    runPug();
    watch(['./app/**/*.pug'], function() {
        runPug();
    })
});

var runImage = function() {
    return gulp.src(['./app/**/*.{png,jpg,svg}', '!./app/templates/**/*.*'])
        .pipe(imagemin())
        .pipe(gulpif(prod, gulp.dest('./build'), gulp.dest('./public')));
}

gulp.task('img:build', function () {
    runImage();
});

gulp.task('img:watch', function () {
    runImage();
    watch('./app/**/*.{png,jpg,svg}', function() {
        runImage();
    })
});

var runJS = function() {
    return gulp.src(['./app/**/*.js', '!./app/templates/**/*.*'])
        .pipe(gulpif(prod, uglify()))
        .pipe(gulpif(prod, gulp.dest('./build'), gulp.dest('./public')));
}

gulp.task('js:build', function () {
    prod = true;
    runJS();
});

gulp.task('js:watch', function () {
    runJS();
    watch('./app/**/*.js', function() {
        runJS();
    })
});

var runVendor = function() {
    return gulp.src('./vendor/**/*.js')
        .pipe(gulpif(prod, gulp.dest('./build/assets/src'), gulp.dest('./public/assets/src')));
}

gulp.task('vendor:build', function () {
    runVendor();
});

gulp.task('vendor:watch', function () {
    runVendor();
    watch('./vendor/**/*.js', function() {
        runVendor();
    });
});

gulp.task('ngrok', function() {
    ngrok.connect({
        proto: 'http',
        addr: 3000,
        authtoken: '7Amrso7d87yLHsBduZFEY_35sCJHbuG3DNc7cT7zju3',
        region: 'eu',
        //auth: 'louis:test'
    }, function (err, url) {
        console.log(url);
    });
});

gulp.task('pagespeed', function() {
    psi('theverge.com', {nokey: 'true', strategy: 'mobile'}).then(data => {
        console.log('Speed score: ' + data.ruleGroups.SPEED.score);
        console.log('Usability score: ' + data.ruleGroups.USABILITY.score);
        console.log(data.pageStats);
    });
});

gulp.task('screenshot', function() {
    runBrowser();
    var pageres = new Pageres()
        .src('http://localhost:3000', ['1366x768'], {
            delay: 5,
            crop: false,
            format: 'jpg',
            username: 'test',
            password: 'wsf'
        })
        .dest('screenshots')
        .run()
        .then(function() {
            console.log('done');
            browserSync.exit();
        });
});


//A essayer gulp-webstandards



