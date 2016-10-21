/**
 * Created by bbarnett on 10/21/2016.
 */
var fs = require('fs');
var mustache = require('mustache');
var _cssServerPath = 'https://s3.amazonaws.com/test-bed/accessibility';
var _jsServerPath = 'https://s3.amazonaws.com/test-bed/accessibility';
var _cssLocalPath = '..';
var _jsLocalPath = '..';


var isLocal = false;

var _renderTemplate = function (mustacheFile, data, outFileName, callback) {
    console.log('mustache file:' + mustacheFile);
    //Note mu2 module was generating different results depending on whether we ran this in NodeWebkit or straight Node! Switched to a different module.
    fs.readFile(mustacheFile, {encoding: 'utf8'}, function (err, mustacheStr) {

        var output = mustache.render(mustacheStr, data);
        fs.writeFile(outFileName, output, function (err) {
            if (err) console.write('error in writing rendered file..');
            else {
                console.log('file rendered & written to dir');
                if (callback) callback();
            }
        });
    });
};



if (!isLocal) {
    var data = {
        cssPath: _cssServerPath,
        jsPath: _jsServerPath
    };

    _renderTemplate('../index.mustache', data, '../index.html', function () {
        // if (callback) callback();
    });
}
else {
    var data = {
        csspath: _cssLocalPath,
        jspath: _jsLocalPath
    };

    _renderTemplate('../index.mustache', data, '../index.html', function () {
        // if (callback) callback();
    });
}

