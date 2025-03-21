// This is slightly modified from the nunjucks repo, but it doesn't strip out punctuation
// https://github.com/mozilla/nunjucks/blob/master/nunjucks/src/filters.js#L576

const punctuationRegex = /^(\(|<|&lt;)?(.*?)(\.|,|\)|\n|&gt;)?$/;
const emailRegex = /^[\w.!#$%&'*+\-/=?^`{|}~]+@[a-z\d-]+(\.[a-z\d-]+)+$/i;
const httpHttpsRegex = /^https?:\/\/.*$/;

const urlize = (string: string) => {
  const words = string
    .split(/(\s+)/)
    .filter((word) => word?.length)
    .map((word) => {
      let leadingPunctuation = '';
      let trailingPunctuation = '';
      let possibleUrl = word;

      const matches = RegExp(punctuationRegex).exec(word);

      if (matches) {
        leadingPunctuation = matches[1] || '';
        possibleUrl = matches[2];
        trailingPunctuation = matches[3] || '';
      }

      if (httpHttpsRegex.test(possibleUrl)) {
        return `${leadingPunctuation}<a href="${possibleUrl}">${possibleUrl}</a>${trailingPunctuation}`;
      }

      if (emailRegex.test(possibleUrl)) {
        return `${leadingPunctuation}<a href="mailto:${possibleUrl}">${possibleUrl}</a>${trailingPunctuation}`;
      }

      return word;
    });

  return words.join('');
};

export default urlize;
