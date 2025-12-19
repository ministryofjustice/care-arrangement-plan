import { Request, Response, NextFunction } from 'express';

const setupFlashMessages = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.locals.info = req.flash('info');
    next();
  };
};

export default setupFlashMessages;
