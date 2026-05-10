export class HttpError extends Error {
  constructor(status, message, code = 'ERROR') {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}
