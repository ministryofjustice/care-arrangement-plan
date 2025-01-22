// eslint-disable-next-line import/prefer-default-export
export declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    nowInMinutes: number
  }
}
