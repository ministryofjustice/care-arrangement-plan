const paperFormFileName = (locale: string): string =>
  locale === 'en' ? 'paperForm.pdf' : `paperForm-${locale}.pdf`;

export default paperFormFileName;
