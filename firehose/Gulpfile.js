var gulp = require('gulp');
var watch = require('gulp-watch');

// where are we running?
var path = require("path");
var cwd = path.dirname(__filename);
var lessSRC = cwd + '/less/*.less';

/**
 * LESS compilation is independent of any other task
 */
gulp.task('less', function() {
  var less = require('gulp-less');
  var plumber = require('gulp-plumber');
  var sourcemaps = require('gulp-sourcemaps');

  return gulp.src(lessSRC)
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(less())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(cwd + '/public/stylesheets'))
});

/**
 * Browserify bundling of firehose app.
 */
gulp.task('bundle-firehose', function() {
  var browserify = require('browserify');
  var buffer = require('vinyl-buffer');
  var reactify = require('reactify');
  var babel = require("gulp-babel");
  var source = require('vinyl-source-stream');

  // Don't process react. We'll link to its CDN minified version.
  // The reasoning here is that we're not offering one app, we're
  // offering lots of apps, and bundling react with each app is
  // both bloat, and an uncachable resource. Both are bad.
  var donottouch = require('browserify-global-shim').configure({
    'react': 'React'
  });

  var b = browserify({
      transform: [babel, reactify, donottouch],
      debug: true
    });

  return b.bundle()
    .pipe(source(cwd + '/components/firehose-app.jsx'))
    .pipe(buffer())
    .pipe(gulp.dest(cwd + '/build/'));
});

/**
 * Minify firehose app
 */
gulp.task('minify-firehose', ['bundle-firehose'], function() {
  var uglify = require('gulp-uglify');
  var sourcemaps = require('gulp-sourcemaps');

  return gulp.src(cwd + '/build/firehose-app.js')
    .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(cwd + '/public/javascript'));
});


// used in both the lint and watch tasks
var jsxSrc = cwd + '/components/**/*.js*';
var mixinSrc = cwd + '/mixins/**/*.js*';

/**
 * Javascript and JSX linting
 */
gulp.task('lint-firehose', function() {
  // set up jshint to make use of jshint-jsx, as we're mixing
  // plain javascript with React's JSX.
  var jshint = require('gulp-jshint');
  var jsxhinter = require('jshint-jsx');
  jsxhinter.JSHINT = jsxhinter.JSXHINT;

  return gulp.src([jsxSrc, mixinSrc])
    .pipe(jshint({ linter: 'jshint-jsx' }))
    .pipe(jshint.reporter('default'));
});


/**
 * our "default" task runs everything, but -crucially- it
 * runs the subtasks in order. That means we'll wait for
 * files to be written before we move on to the next task,
 * because in this case we can't run parallel tasks.
 */
gulp.task('firehose-build', ['lint-firehose', 'less', 'minify-firehose']);

gulp.task('watch-firehose', function() {
  watch(jsxSrc, function() { gulp.start('lint-firehose'); });
  watch(jsxSrc, function() { gulp.start('minify-firehose'); });
  watch(mixinSrc, function() { gulp.start('lint-firehose'); });
  watch(mixinSrc, function() { gulp.start('minify-firehose'); });
  watch(lessSRC, function() { gulp.start('less'); });
});
