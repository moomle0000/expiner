import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { UPLOAD_ROOT } from '@config';

const baseUploadDir = UPLOAD_ROOT;

const createFolderIfNotExists = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let subDir = 'others'; // fallback folder

    if (file.mimetype.startsWith('image/')) {
      subDir = 'images';
    } else if (file.mimetype === 'application/pdf' || file.mimetype.includes('word')) {
      subDir = 'documents';
    }

    const fullPath = path.join(baseUploadDir, subDir);
    createFolderIfNotExists(fullPath);
    cb(null, fullPath);
  },

  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

// Filter file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, PNG, DOC, and DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export { upload };
