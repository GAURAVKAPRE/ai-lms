const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("./s3");

const uploadToS3 = async ({ file, folder }) => {
  const fileKey = `${folder}/${Date.now()}-${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3.send(command);

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
};

module.exports = uploadToS3;
