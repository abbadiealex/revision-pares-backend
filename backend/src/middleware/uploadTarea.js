import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { HttpError } from '../utils/httpError.js';

const uploadDir = path.resolve('uploads', 'tareas');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const tempName = `tmp-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
    cb(null, tempName);
  }
});

function fileFilter(req, file, cb) {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = path.extname(file.originalname).toLowerCase() === '.pdf';

  if (!isPdfMime || !isPdfExt) {
    return cb(new HttpError(400, 'Solo se aceptan archivos PDF', 'VALIDATION_ERROR'));
  }

  return cb(null, true);
}

export const uploadTareaPdf = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

export function movePdfToTaskId(taskId, file) {
  if (!file) {
    throw new HttpError(400, 'El archivo PDF es obligatorio', 'VALIDATION_ERROR');
  }

  const finalName = `${taskId}.pdf`;
  const finalPath = path.join(uploadDir, finalName);
  fs.renameSync(file.path, finalPath);
  return `/uploads/tareas/${finalName}`;
}
