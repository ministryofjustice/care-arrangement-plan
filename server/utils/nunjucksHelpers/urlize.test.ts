import urlize from './urlize';

describe('urlize', () => {
  test.each([
    ['foo http://www.example.com/ bar', 'foo <a href="http://www.example.com/">http://www.example.com/</a> bar'],
    ['foo https://www.example.com/ bar', 'foo <a href="https://www.example.com/">https://www.example.com/</a> bar'],
    [
      '(http://jinja.pocoo.org/docs/templates/.',
      '(<a href="http://jinja.pocoo.org/docs/templates/">http://jinja.pocoo.org/docs/templates/</a>.',
    ],
    ['foo testuser@testuser.com bar', 'foo <a href="mailto:testuser@testuser.com">testuser@testuser.com</a> bar'],
    ['(testuser@testuser.com.', '(<a href="mailto:testuser@testuser.com">testuser@testuser.com</a>.'],
    ['foo.', 'foo.'],
    ['foo.foo', 'foo.foo'],
    ['foo.foo', 'foo.foo'],
    ['<b>what up</b>', '<b>what up</b>'],
    ['what\nup', 'what\nup'],
    ['foo', 'foo'],
  ])('%s should return correctly', (string, expected) => {
    expect(urlize(string)).toEqual(expected);
  });
});
