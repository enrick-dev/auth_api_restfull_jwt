import multer from "multer";


export const UploadAttachments = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'src/uploadTeste' );
    },
    filename: (req, file, cb) => {
      cb(null, Date.now().toString() + "_name_" + file.originalname);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', // imagens
      'application/pdf', // .pdf
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'text/csv', // .csv
      'audio/mpeg', // .mp3
      'audio/ogg' // .ogg
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado'), false);
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 } // Limita o tamanho do arquivo a 20MB (opcional)
});
