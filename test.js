'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var depsOrder = require('./index');

it('should sort files by dependencies defined using @requires', function (cb) {
    var stream = depsOrder();

    /*
     *   === DEPS ===
     *
     *         e.js        f.js
     *        /    \
     * sub/b.js    d.js
     *    |    \   |
     *    |   sub/c.js
     *    \    /
     *     a.js
     *
     */

    var depsGraph = {
        'a.js' : ['sub/b.js', 'sub/c.js'],
        'sub/b.js' : ['e.js'],
        'sub/c.js' : ['sub/b.js', 'd.js'],
        'd.js' : ['e.js'],
        'e.js' : [],
        'f.js' : []
    };

    var files = [];

    stream.on('data', function (file) {
        assert(depsGraph[file.relative]);

        depsGraph[file.relative].forEach(function (dep) {
            assert(files.indexOf(dep) !== -1);
        })

        files.push(file.relative);
    });

    stream.on('end', function () {
        assert.equal(files.length, 6);
        cb();
    });

    stream.write(new gutil.File({
        base: __dirname,
        path: __dirname + '/a.js',
        contents: new Buffer('/* @requires sub/b.js, c.js\n */')
    }));

    stream.write(new gutil.File({
        base: __dirname,
        path: __dirname + '/d.js',
        contents: new Buffer('/* @requires e.js\n */')
    }));

    stream.write(new gutil.File({
        base: __dirname,
        path: __dirname + '/e.js',
        contents: new Buffer('')
    }));

    stream.write(new gutil.File({
        base: __dirname,
        path: __dirname + '/f.js',
        contents: new Buffer('')
    }));

    stream.write(new gutil.File({
        base: __dirname,
        path: __dirname + '/sub/b.js',
        contents: new Buffer('/* @requires ../e.js\n */')
    }));

    stream.write(new gutil.File({
        base: __dirname,
        path: __dirname + '/sub/c.js',
        contents: new Buffer('/* @requires b.js, ../d.js\n */')
    }));

    stream.end();
});

it('should sort files by dependencies defined using custom annotation regular expression', function (cb) {
    var stream = depsOrder({
        annotation: /\/\/\/\s*<reference\s+path="([^"]+)"\s+\/>/g
    });

    /*
     *   === DEPS ===
     *
     *  b.js
     *  /   \
     *  |   c.js
     *  \    /
     *   a.js
     *
     */

    var depsGraph = {
        'a.js' : ['b.js', 'c.js'],
        'b.js' : [],
        'c.js' : ['b.js']
    };

    var files = [];

    stream.on('data', function (file) {
        assert(depsGraph[file.relative]);

        depsGraph[file.relative].forEach(function (dep) {
            assert(files.indexOf(dep) !== -1);
        })

        files.push(file.relative);
    });

    stream.on('end', function () {
        assert.equal(files.length, 3);
        cb();
    });

    stream.write(new gutil.File({
        base: __dirname,
        path: __dirname + '/a.js',
        contents: new Buffer('/// <reference path="b.js" />\n/// <reference path="c.js" />')
    }));

    stream.write(new gutil.File({
        base: __dirname,
        path: __dirname + '/b.js',
        contents: new Buffer('')
    }));

    stream.write(new gutil.File({
        base: __dirname,
        path: __dirname + '/c.js',
        contents: new Buffer('/// <reference path="b.js" />')
    }));

    stream.end();
});

it('should emit an error if there is a cyclic dependency', function (cb) {
    var stream = depsOrder();

    /*
     *   === DEPS ===
     *
     *    a.js <-- b.js
     *     |        ^
     *     v        |
     *    d.js --> c.js
     *
     */

    var orderedFiles = ['e.js', 'd.js', 'sub/b.js', 'sub/c.js', 'a.js'];

    stream.on('error', function (err) {
        assert.notEqual(err, undefined);
        cb();
    });

    stream.on('data', function () {
        throw 'Cyclic dependency must emit an error';
        cb();
    });

    stream.write(new gutil.File({
        base: __dirname,
        path: __dirname + '/a.js',
        contents: new Buffer('/* @requires d.js\n */')
    }));

    stream.write(new gutil.File({
        base: __dirname,
        path: __dirname + '/b.js',
        contents: new Buffer('/* @requires a.js\n */')
    }));

    stream.write(new gutil.File({
        base: __dirname,
        path: __dirname + '/c.js',
        contents: new Buffer('/* @requires b.js\n */')
    }));

    stream.write(new gutil.File({
        base: __dirname,
        path: __dirname + '/d.js',
        contents: new Buffer('/* @requires c.js\n */')
    }));

    stream.end();
});
