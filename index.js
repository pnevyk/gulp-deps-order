'use strict';
var PluginError = require('gulp-util').PluginError;
var through = require('through2');
var toposort = require('toposort');
var async = require('async');
var path = require('path');

function getDeps(options, str) {
    var regexp = new RegExp('\\/\\*[\\s\\S]*@' + options.annotation + '(.*)');
    var match = str.match(regexp);
    
    if (match) {
        return match[1].split(options.separator).map(function (dep) {
            return dep.trim();
        });
    }
    
    return [];
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