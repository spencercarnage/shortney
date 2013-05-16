/*jshint es5:true*/
function setup(options) {
  this.$input = $('input#input');
  this.$input.urlshortener(options);
}

function teardown() {
  this.$input.urlshortener('destroy');
}

/**
 * First and foremost, test for an initialization error. This is in a separate
 * module so that we can do this without using the setup and teardown methods,
 * which will error out before we can test for the error.
 */
module('Init error', {
  teardown: function () {
    $('#input').urlshortener('destroy');
  }
});

test('Throw error on initialization.', function () {
  try {
    $('input#input').urlshortener();
    ok(false, 'If you are seeing this, the error was not caught.');
  } catch (e) {
    ok(true, 'Throws when no API endpoint has been passed in as an option.');

    ok(
      !$('input#input').hasClass($.urlshortener.shortenerClass), 
      'Should not have the plugin class.'
    );

    ok(
      typeof $('input#input').data($.urlshortener.propertyName) === 'undefined',
      'Should not have the plugin\'s instance name as a data attribute.'
    );
  }
});

module('Initialization', {
  setup: function () {
    var options = {
      api: '/bitly/endpoint/'
    };

    setup.apply(this, [options]);
  },
  teardown: function () {
    teardown.apply(this, arguments);
  }
});

test('Options', function () {
  expect(3);

  deepEqual(this.$input.urlshortener('option'), {
    api: '/bitly/endpoint/',
    urlRE: /(https?:\/\/)?((\w+:{0,1}\w*@)?(\S+)\.[a-zA-Z]{2,})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,
    shortenerRE: /bit\.ly/, // Regex for URL shortening service.
    URLValidator: null,
    onInvalidURL: null,
    onValidURL: null,
    onSuccess: null,
    onError: null,
    onBeforeSend: null,
    onComplete: null
  }, 'Initial settings');

  this.$input.urlshortener('option', {'api': '/googly/endpoint/'});

  equal(
    this.$input.urlshortener('option', 'api'),
    '/googly/endpoint/',
    "Should update API option."
  );

  deepEqual(this.$input.urlshortener('option'), {
    api: '/googly/endpoint/',
    urlRE: /(https?:\/\/)?((\w+:{0,1}\w*@)?(\S+)\.[a-zA-Z]{2,})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,
    shortenerRE: /bit\.ly/, // Regex for URL shortening service.
    URLValidator: null,
    onInvalidURL: null,
    onValidURL: null,
    onSuccess: null,
    onError: null,
    onBeforeSend: null,
    onComplete: null
  }, 'Updated settings');
});

test('Initialize plugin', function () {
  expect(2);

  ok(this.$input.hasClass('url-shortener'), 'Input should have class "url-shortener".');

  ok(
    typeof $('input#input').data($.urlshortener.propertyName) !== 'undefined',
    'Should not have the plugin\'s instance name as a data attribute.'
  );
});


module('URL Validation', {
  setup: function () {
    var options = {
      api: '/bitly/endpoint/'
    };

    setup.apply(this, [options]);
  },
  teardown: function () {
    teardown.apply(this, arguments);
  }
});


test('Is the URL valid?', function () {
  expect(9);

  ok($.urlshortener._validURL(this.$input.val('www.google.com')), 'Should be a valid URL');
  ok($.urlshortener._validURL(this.$input.val('http://www.google.com')), 'Should be a valid URL');
  ok($.urlshortener._validURL(this.$input.val('someurl.cc')), 'Should be a valid URL');
  ok($.urlshortener._validURL(this.$input.val('http://someurl.cc')), 'Should be a valid URL');
  ok(!$.urlshortener._validURL(this.$input.val('http://bit.ly/1234')), 'Bit.ly URLs should not be considered valid');
  ok(!$.urlshortener._validURL(this.$input.val('bit.ly/1234')), 'Bit.ly URLs should not be considered valid');
  ok(!$.urlshortener._validURL(this.$input.val('this is not a url')), 'Should not be a valid URL.');
  ok(!$.urlshortener._validURL(this.$input.val('asdfjlkjalskdfjalsd')), 'Should not be a valid URL.');
  ok(!$.urlshortener._validURL(this.$input.val('131123123123')), 'Should not be a valid URL.');
});

test('Use a custom validator', function () {
  expect(1);

  function customURLValidator(target) {
    var $target = $(target);

    return $target.val() === 'custom url validator is go!';
  }

  this.$input.urlshortener('option', 'URLValidator', customURLValidator);
  this.$input.val('custom url validator is go!'); 

  ok(
    $.urlshortener._validURL(this.$input[0]),
    'Should validate with custom validator'
  );
});

test('Use a jQuery validation', function () {
  expect(1);

  var $form = $('form');
  var validator = $form.validate({
    rules: {
      url: true
    },
    submitHandler: function (form) {
      return;
    }
  });

  function jqValidation() {
    return validator.element.apply(validator, arguments);
  }

  this.$input.urlshortener('option', 'URLValidator', jqValidation);

  this.$input.val('http://www.mobileroadie.com');

  ok(
    $.urlshortener._validURL(this.$input[0]),
    "Should validate using jQuery's validation plugin"
  );
});

module('Accessing Methods', {
  setup: function () {
    var options = {
      api: '/bitly/endpoint/'
    };

    setup.apply(this, [options]);
  },
  teardown: function () {
    teardown.apply(this, arguments);
  }
});

test('Invoke a plugin method', function () {
  try {
    ok(
      this.$input.urlshortner('invalidMethod'), 
      "This test should not run because of an invalid method"
    );
  } catch (e) {
    ok(true, "Should catch an error thrown from invoking an invalid method.");
  }

  ok(this.$input.urlshortener("option"), "Should not throw an error.");
});

test('Disable and enable plugin', function () {
  expect(4);

  this.$input.urlshortener("disable");

  equal(this.$input.prop("disabled"), true, "Should be disabled.");
  ok(this.$input.hasClass('url-shortener-disabled'), "Should have class 'url-shortener-disabled'");

  this.$input.urlshortener("enable");

  equal(this.$input.prop("disabled"), false, "Should be enabled.");
  ok(!this.$input.hasClass('url-shortener-disabled'), "Should not have class 'url-shortener-disabled'");
});

test("Destroy plugin", function () {
  expect(2);

  this.$input.urlshortener("destroy");

  ok(!this.$input.hasClass('url-shortener-disabled'), "Should not have class 'url-shortener-disabled'");

  ok(
    typeof $('input#input').data($.urlshortener.propertyName) === 'undefined',
    "Should not have the plugin's instance name as a data attribute."
  );
});

module("AJAX", {
  setup: function () {
    this.ajaxStub = sinon.stub(jQuery, 'ajax');
    this.onSuccessStub = sinon.stub();
    this.onErrorStub = sinon.stub();
    this.onBeforeSendStub = sinon.stub();
    this.onCompleteStub = sinon.stub();

    var options = {
      api: '/bitly/endpoint/',
      onSuccess: this.onSuccessStub,
      onError: this.onErrorStub,
      onBeforeSend: this.onBeforeSendStub,
      onComplete: this.onCompleteStub,
    };

    setup.apply(this, [options]);
  },

  teardown: function () {
    teardown.apply(this, arguments);
    $.ajax.restore();
  }
});

test("should make an ajax call", function () {
  expect(1);

  $.urlshortener.shortenURL(this.$input[0], 'www.mobileroadie.com');

  ok($.ajax.calledOnce);
});

test("should make an ajax call on blur event", function () {
  expect(1);

  this.$input.val('www.mobileroadie.com');
  this.$input.trigger($.Event('blur'));

  ok($.ajax.calledOnce);
});

test("should call onBeforeSend on ajax call", function () {
  expect(2);

  this.ajaxStub.yieldsTo('beforeSend');

  $.urlshortener.shortenURL(this.$input[0], 'www.mobileroadie.com');

  ok(this.onBeforeSendStub.calledOnce);
  ok($.urlshortener._ajaxInProcess);
});

test("should call onSuccess on ajax call", function () {
  expect(2);

  this.ajaxStub.yieldsTo('success');

  $.urlshortener.shortenURL(this.$input[0], 'www.mobileroadie.com');

  ok(this.onSuccessStub.calledOnce);
  ok($.urlshortener._isShortened);
});

test("should call onError on ajax call", function () {
  expect(2);

  this.ajaxStub.yieldsTo('error');

  $.urlshortener.shortenURL(this.$input[0], 'www.mobileroadie.com');

  ok(this.onErrorStub.calledOnce);
  ok(!$.urlshortener._isShortened);
});

test("should call onComplete on ajax call", function () {
  expect(2);

  this.ajaxStub.yieldsTo('complete');

  $.urlshortener.shortenURL(this.$input[0], 'www.mobileroadie.com');

  ok(this.onCompleteStub.calledOnce);
  ok(!$.urlshortener._ajaxInProcess);
});

module('Valid / Invalid URL Callback', {
  setup: function () {
    this.ajaxStub = sinon.stub(jQuery, 'ajax');
    this.onInvalidURLStub = sinon.stub();
    this.onValidURLStub = sinon.stub();

    var options = {
      api: '/bitly/endpoint/',
      onInvalidURL: this.onInvalidURLStub,
      onValidURL: this.onValidURLStub
    };

    setup.apply(this, [options]);
  },
  teardown: function () {
    teardown.apply(this, arguments);
    $.ajax.restore();
  }
});


test('Should fire onValidURL callback for valid URL', function () {
  expect(1);

  this.$input.val('www.mobileroadie.com');
  this.$input.trigger($.Event('blur'));
  ok(this.onValidURLStub.calledOnce);
});

test('Should fire onInvalidURL callback for invalid URL', function () {
  expect(1);

  this.$input.val('Invalid url');
  this.$input.trigger($.Event('blur'));
  ok(this.onInvalidURLStub.calledOnce);
});

