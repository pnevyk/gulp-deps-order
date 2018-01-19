# [gulp](http://gulpjs.com)-deps-order

> Sorts files in stream by dependencies using @requires annotation in source. Used in conjuction with [gulp-concat](https://github.com/wearefractal/gulp-concat) to concat files in correct order.


## Install

```bash
$ npm install --save-dev gulp-deps-order
```


## Usage

### Gulpfile

```js
var gulp = require('gulp');
var depsOrder = require('gulp-deps-order');
var concat = require('gulp-concat');

gulp.task('default', function () {
    return gulp.src('src/**/*.js')
        .pipe(depsOrder())
        .pipe(concat('build.js'))
        .pipe(gulp.dest('dist'));
});
```

### Source file

```js
/*
 * @requires dep1.js, ../dep2.js, sub1/dep3.js, ../sub2/dep4.js
 */

//your awesome code [...]
```


## API

### depsOrder(options)

#### options

##### annotation

Type: `string` | `RegExp`
Default: `"requires"`

If string, plugin will search for `@<annotation> <dependencies>` in comments. If regular expression, plugin will search for all matches of the expression and takes first capture group as the list of dependencies. Extracted dependencies are then split by the separator.

##### separator

Type: `string`  
Default: `","`

The separator of dependencies. Each dependency is trimmed so you don't have to specify dependencies like `dep1.js,dep2.js,dep3.js` but you can add a space for better readability.


## License

Gulp-deps-order is MIT licensed. Feel free to use it, contribute or spread the word. Created with love by Petr Nevyhoštěný ([Twitter](https://twitter.com/pnevyk)).
