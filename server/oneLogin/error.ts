class OneLoginError extends Error {
  status: number;

  constructor(message: string, status = 400, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'OneLoginError';
    this.status = status;
  }
}

export default OneLoginError;
