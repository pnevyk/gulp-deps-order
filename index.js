'use strict';
var PluginError = require('plugin-error');
var through = require('through2');
var toposort = require('toposort');
var path = require('path');

function getDeps(options, str) {
    var pattern;
    if (options.annotation instanceof RegExp) {
        pattern = options.annotation;
    } else {
        pattern = new RegExp('\\/\\*[\\s\\S]*@' + options.annotation + '(.*)');
    }

    var result = null;
    var deps = [];

    if (pattern.global) {
        while ((result = pattern.exec(str)) !== null) {
            deps = getDepsFromResult(deps, options.separator, result);
        }
    } else {
        if ((result = pattern.exec(str)) !== null) {
            deps = getDepsFromResult(deps, options.separator, result);
        }
    }

    return deps;
}

function getDepsFromResult(deps, separator, result) {
    return result[1].split(separator).map(function (dep) {
        return dep.trim();
    }).reduce(function (deps, dep) {
        deps.push(dep);
        return deps;
    }, deps);
}

module.exports = function (options) {
    options = options || {};
    options.annotation = options.annotation || 'requires';
    options.separator = options.separator || ',';

    var graph = [],
        files = {},
        hasDep;

    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            this.emit('error', new PluginError('gulp-deps-order', 'Streaming not supported'));
            return cb();
        }

        hasDep = false;

        getDeps(options, file.contents.toString()).map(function (dep) {
            return path.join(path.dirname(file.path), dep);
        }).forEach(function (dep) {
            hasDep = true;
            graph.push([file.path, dep]);
        });

        if (!hasDep) graph.push([file.path]);

        files[file.path] = file;

        cb();
    }, function (cb) {
        var ordered;

        try {
            ordered = toposort(graph).reverse();
        }

        catch (e) {
            this.emit('error', new PluginError('gulp-deps-order', e.toString()));
            return cb();
        }

        for (var i = 0; i < ordered.length; i++) {
            if (!files[ordered[i]]) continue;
            this.push(files[ordered[i]]);
        }

        cb();
    });
};
