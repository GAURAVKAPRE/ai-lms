const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,

    // ✅ Ensure browser can play video / open PDF
    contentType: multerS3.AUTO_CONTENT_TYPE,
    contentDisposition: "inline",

    key: (req, file, cb) => {
      const folder =
        file.mimetype === "application/pdf" ? "pdfs" : "videos";

      const safeName = file.originalname.replace(/\s+/g, "_");
      cb(null, `${folder}/${Date.now()}-${safeName}`);
    },
  }),
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

module.exports = upload;
