import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

const tmpAuth = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  directory: tmpAuth,

  storage: multer.diskStorage({
    destination: tmpAuth,
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('HEX');
      const filename = `${fileHash}-${file.originalname}`;

      return callback(null, filename);
    },
  }),
};
