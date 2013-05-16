/**
 *
 * Converts a URL form input into a shortened link.
 *
 */

;(function ($) {
  function URLShortener() {
    this._defaults = {
      urlRE: /(https?:\/\/)?((\w+:{0,1}\w*@)?(\S+)\.[a-zA-Z]{2,})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,
      shortenerREs: [
        'bit.ly', 
        'goo.gl', 
        'tinyurl.com', 
        'is.gd', 
        'cl.ly', 
        't.co',
        'ow.ly'
      ],
      api: undefined, // AJAX endpoint for URL shortening service.
      URLValidator: null, // Optionally plug in your own validation.
      onInvalidURL: null,
      onValidURL: null,
      onSuccess: null,
      onError: null,
      onBeforeSend: null,
      onComplete: null
    };
  }

  $.extend(URLShortener.prototype, {
    events: 'blur.url-shortener',

    shortenerClass: 'url-shortener',

    propertyName: 'urlshortener',

    /*
     * Flag for determining if the URL is in the process of being in the
     * process of being shortening via AJAX
     */
    _ajaxInProcess: false, 

    _isShortened: false, // Flag for determining whether or not URL was shortened.

    _checkShortenerREs: function (target) {
      var $target = $(target);
      var url = $target.val();
      var alreadyShortened = false;
      var instance = $target.data(this.propertyName);

      for (var i = 0, l = instance.options.shortenerREs.length; i < l; i++) {
        if (url.search(instance.options.shortenerREs[i]) !== -1) {
          alreadyShortened = true; 
          break;
        }
      }

      return alreadyShortened;
    },

    _validURL: function validURL(target) {
      var $target = $(target);

      var instance = $target.data(this.propertyName);
      var url = $target.val();

      if ($.isFunction(instance.options.URLValidator)) {
        return !this._isShortened && instance.options.URLValidator.call(this, target);
      } else {
        return !this._isShortened && this._defaults.urlRE.test(url);
      }
    },

    /*
     * Override the default settings for all URL shortener instances.
     * @param options (object) the new settings to use as defaults
     * @return (URLShortener) this object
     */
    setDefaults: function (options) {
      $.extend(this._defaults, options || {});
      return this;
    },

    /*
     * Attach the URL shortening functionality to a text input.
     * @param target (element) the input to affect
     * @param options (object) the custom options for this
     */
    _attachPlugin: function (target, options) {
      var $target = $(target);

      if ($target.hasClass(this.shortenerClass)) {
        return;
      }

      var instance = {
        options: $.extend({}, this._defaults)
      };
      var scope = this;

      $target.addClass(this.shortenerClass)
        .data(this.propertyName, instance)
        .bind(this.events, function (event) {
          var url = $target.val();

          scope._isShortened = false;

          if (scope._checkShortenerREs(target)) {
            return false;
          }

          if (scope._validURL(this)) {
            if ($.isFunction(instance.options.onValidURL)) {
              instance.options.onValidURL.apply(target, arguments); 
            }

            scope.shortenURL(target, $target.val()); 
          } else {
            if ($.isFunction(instance.options.onInvalidURL)) {
              instance.options.onInvalidURL.apply(target, arguments); 
            }
          }
        });
      
      this._optionPlugin(target, options);
    },

    /*
     * Retrieve or reconfigure the settings for a control.
     * @param target (element) the control to affect
     * @param options (object) the new options for this instance or
     *                (string) an individual property name
     *  @param value (any) the individual property value (omit if options is an
     *                ojbect or to retrieve the value of a setting)
     *  @return (any) if retrieving a value
     */
    _optionPlugin: function (target, options, value) {
      target = $(target);

      var instance = target.data(this.propertyName);
      var name;

      if (!options || 
          (typeof options === 'string' && typeof value === 'undefined')) {
        
        // Get option.

        name = options;
        options = (instance || {}).options;
        return (options && name ? options[name] : options);
      }

      if (!target.hasClass(this.shortenerClass)) {
        return;
      }

      options = options || {};

      if (typeof options === 'string') {
        name = options;
        options = {};
        options[name] = value;
      }

      $.extend(instance.options, options);

      if (typeof instance.options.api === 'undefined') {
        this._destroyPlugin(target[0]);
        console.error('No API endpoint was defined in the options.');
        throw 'No API endpoint was defined in the options.';
      }
    },

    shortenURL: function shortenURL (target) {
      target = $(target);

      var scope = this;
      var instance = target.data(this.propertyName);

      /*
       * If _ajaxInProcess set to true, then return because we already have an
       * AJAX request that has been sent out.
       */
      if (this._ajaxInProcess) {
        return;
      }

      $.ajax({
        type: 'POST',
        url: instance.options.api,
        data: { url: target.val() },
        success: function (data, textStatus, jqXHR) {
          scope._isShortened = true; 

          if (typeof instance.options.onSuccess === "function") {
            instance.options.onSuccess.apply(scope, arguments);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          scope._isShortened = false; 

          if (typeof instance.options.onError === "function") {
            instance.options.onError.apply(scope, arguments);
          }
        },
        beforeSend: function (jqXHR, settings) {
          scope._ajaxInProcess = true;

          if (typeof instance.options.onBeforeSend === "function") {
            instance.options.onBeforeSend.apply(scope, arguments);
          }
        },
        complete: function (jqXHR, textStatus) {
          scope._ajaxInProcess = false;

          if (typeof instance.options.onComplete === "function") {
            instance.options.onComplete.apply(scope, arguments);
          }
        }
      });
    },

    /*
     * Enable the URL shortener.
     * @param target (element) the control to affect
     */
    _enablePlugin: function (target) {
      target = $(target);

      if (!target.hasClass(this.shortenerClass)) {
        return;
      }

      target.prop('disabled', false).removeClass('url-shortener-disabled');
      var instance = target.data(this.propertyName);
    },

    /*
     * Disable the control.
     * @param target (element) the control to affect
     */
    _disablePlugin: function (target) {
      target = $(target);

      if (!target.hasClass(this.shortenerClass)) {
        return;
      }

      target.prop('disabled', true).addClass('url-shortener-disabled');
      var instance = target.data(this.propertyName);
    },

    _destroyPlugin: function (target) {
      target = $(target);
      if (!target.hasClass(this.shortenerClass)) {
        return;
      }

      var instance = target.data(this.propertyName);

      target.removeClass(this.shortenerClass)
            .removeData(this.propertyName)
            .unbind('.url-shortener');

      this._ajaxInProcess = false;
      this._isShortened = false;

      if ($.isFunction(instance.options.onValidURL)) {
        instance.options.onValidURL.apply(target, arguments);
      }
    }
  });

  var getters = ['curLength'];
  /* 
   * Determine whether a method is a getter and doesn't permit chaining.
   * @param method     (string, optional) the method to run
   * @param otherArgs  ([], optional) any other arguments for the method
   * @return true if the method is a getter, false if not 
   */
  function isNotChained(method, otherArgs) {
    if (method === 'option' && (otherArgs.length === 0 ||
        (otherArgs.length === 1 && typeof otherArgs[0] === 'string'))) {
      return true;
    }
    return $.inArray(method, getters) > -1;
  }

  /*
   * Attach the URL shortener functionality to a jQuery selection.
   * @param options (object) the new settings to use for these instances
   *                (optional) or (string) the method to run (optional)
   * @return (jQuery) for chaining further
   */
  $.fn.urlshortener = function (options) {
    var args = Array.prototype.slice.call(arguments, 1);

    if (isNotChained(options, args)) {
      return plugin['_' + options + 'Plugin'].apply(plugin, [this[0]].concat(args));
    }

    return this.each(function () {
      if (typeof options === 'string') {
        if (!plugin['_' + options + 'Plugin']) {
          throw 'Unknown method: ' + options;
        }
        plugin['_' + options + 'Plugin'].apply(plugin, [this].concat(args));
      } else {
        plugin._attachPlugin(this, options || {});
      }
    });
  };

  var plugin = $.urlshortener = new URLShortener(); // Singleton instance.

})(jQuery);
