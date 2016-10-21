/**
 * Created by bbarnett on 10/21/2016.
 */

/**
 * User: tadiraman
 * Date: 7/16/2014
 * Time: 2:42 PM
 */
/*
 extracting details and making result set
 @class Shared
 */


/**
 * @class Shared
 **/
Shared = function () {

    var _isLocal = window.location.href.indexOf("localhost") > -1 || window.location.href.indexOf("127.0.0.1") > -1 || window.location.href == (undefined || null);

    var _serverUrl = 'https://s3.amazonaws.com/test-bed/accessibility';
    var _localUrl = 'localhost:9000';

    var _getUrl = function () {
        if (!_isLocal) {
            return _serverUrl;
        }
        return _localUrl;
    };


    this.isLocal = _isLocal;
    this.serverUrl = _serverUrl;
    this.localUrl = _localUrl;

    this.getUrl = function () {
        return _getUrl();
    };


};