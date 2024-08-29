import multer from "multer"
import { Storage } from "@google-cloud/storage"


const gc = new Storage({
  credentials: JSON.parse(process.env.KEY_GOOGLE_CLOUD_STORAGE),
  projectId: "makevendas",
})

export const meuLeadBucket = gc.bucket('meulead_storage');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25mb
  }
})

const UploadMiddleware = (req, res, next) => {
  upload.array('files',2)(req, res, (err) => {
    if (err) return res.status(400).json({ error: 'Envie uma imagem com o tamanho máximo de até 25mb' });
    next();
  });
}

export default UploadMiddleware
