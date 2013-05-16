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

module('URL Shortener Tests');

test('Is the URL valid?', function () {
  expect(9);

  ok($.urlshortener._validURL('www.google.com'), 'Should be a valid URL');
  ok($.urlshortener._validURL('http://www.google.com'), 'Should be a valid URL');
  ok($.urlshortener._validURL('someurl.cc'), 'Should be a valid URL');
  ok($.urlshortener._validURL('http://someurl.cc'), 'Should be a valid URL');
  ok(!$.urlshortener._validURL('http://bit.ly/1234'), 'Bit.ly URLs should not be considered valid');
  ok(!$.urlshortener._validURL('bit.ly/1234'), 'Bit.ly URLs should not be considered valid');
  ok(!$.urlshortener._validURL('this is not a url'), 'Should not be a valid URL.');
  ok(!$.urlshortener._validURL('asdfjlkjalskdfjalsd'), 'Should not be a valid URL.');
  ok(!$.urlshortener._validURL('131123123123'), 'Should not be a valid URL.');
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

test("should call onBeforeSend on ajax call", function () {
  expect(1);

  this.ajaxStub.yieldsTo('beforeSend');

  $.urlshortener.shortenURL(this.$input[0], 'www.mobileroadie.com');

  ok(this.onBeforeSendStub.calledOnce);
});

test("should call onSuccess on ajax call", function () {
  expect(1);

  this.ajaxStub.yieldsTo('success');

  $.urlshortener.shortenURL(this.$input[0], 'www.mobileroadie.com');

  ok(this.onSuccessStub.calledOnce);
});

test("should call onError on ajax call", function () {
  expect(1);

  this.ajaxStub.yieldsTo('error');

  $.urlshortener.shortenURL(this.$input[0], 'www.mobileroadie.com');

  ok(this.onErrorStub.calledOnce);
});

test("should call onComplete on ajax call", function () {
  expect(1);

  this.ajaxStub.yieldsTo('complete');

  $.urlshortener.shortenURL(this.$input[0], 'www.mobileroadie.com');

  ok(this.onCompleteStub.calledOnce);
});
