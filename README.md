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

Type: `String`  
Default: `requires`

Plugin will search this `@<annotation>` in you source files and it extract all dependencies on the same line the annotation is.

##### separator

Type: `String`  
Default: `,`

The separator of dependencies. Each dependency is trimmed so you don't have to specify dependencies like `dep1.js,dep2.js,dep3.js` but you can add a space for better readability.


## License

Gulp-deps-order is MIT licensed. Feel free to use it, contribute or spread the word. Created with love by Petr Nevyhoštěný ([Twitter](https://twitter.com/pnevyk)).
