import cookieParser from 'cookie-parser';
import { Router, json, urlencoded } from 'express';

const setUpWebRequestParsing = (): Router => {
  const router = Router();
  router.use(json());
  router.use(urlencoded({ extended: true }));
  router.use(cookieParser());
  return router;
};

export default setUpWebRequestParsing;
