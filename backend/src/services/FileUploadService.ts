import { Service } from 'typedi';
import multer from 'multer';
import path from 'path';
import { UPLOAD_ROOT } from '@config';

@Service()
export class FileUploadService {
  private storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOAD_ROOT);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });

  private upload = multer({
    storage: this.storage,
    fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png|gif/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Error: Images Only!'));
      }
    },
  });

  getUploadMiddleware(fieldName: string) {
    return this.upload.single(fieldName);
  }

  getMultiUploadMiddleware(fieldName: string, maxCount: number = 5) {
    return this.upload.array(fieldName, maxCount);
  }
}