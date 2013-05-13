/**
 *
 * Converts a URL form input into a bit.ly link.
 *
 */

function URLShortener() {
  this._defaults = {
    urlRE: /(https?:\/\/)?((\w+:{0,1}\w*@)?(\S+)\.[a-zA-Z]{2,})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,
    shortenerRE: /bit\.ly/, // Regex for URL shortening service
    shortenAPI: '', // AJAX endpoint for URL shortening service
    onSuccess: function () {}
  };

  this._attachPlugin = function attachPlugin() {

  };

  this._validURL = function validURL(url) {
    if (!bitlyFlag && urlRE.test(url) && !bitlyRE.test(url)) {
      return true;
    } else {
      return false;
    }
  };

  this.shortenURL = function shortenURL (url) {
    $.post(this.shortenerAPI, {url: url}, function (data, textStatus, jqXHR) {
    });
  };
}

$.extend(URLShortener.prototype, {

});

var plugin = new URLShortener ();

$.fn.shortenURL = function (options) {
  return this.each(function () {
    plugin._attachPlugin(this, options || {});
  });
};
