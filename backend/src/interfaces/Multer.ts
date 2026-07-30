import { Request } from 'express';

import multer from 'multer';

export interface MulterRequest extends Request {
  file?: multer.File; // for single file
  files?: { [fieldname: string]: multer.File[] }; // for multiple files
}
