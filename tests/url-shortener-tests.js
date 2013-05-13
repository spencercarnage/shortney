module('Bitly Tests');

test('Is a valid URL?', function () {
  ok(validURL('www.google.com'), 'Should be a valid URL');
  ok(validURL('http://www.google.com'), 'Should be a valid URL');
  ok(validURL('someurl.cc'), 'Should be a valid URL');
  ok(validURL('http://someurl.cc'), 'Should be a valid URL');
  ok(!validURL('http://bit.ly/1234'), 'Bit.ly URLs should not be considered valid');
  ok(!validURL('bit.ly/1234'), 'Bit.ly URLs should not be considered valid');
  ok(!validURL('this is not a url'), 'Should not be a valid URL.');
  ok(!validURL('asdfjlkjalskdfjalsd'), 'Should not be a valid URL.');
  ok(!validURL('131123123123'), 'Should not be a valid URL.');
});

