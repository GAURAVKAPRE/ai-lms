import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "./s3.js";

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

export default  uploadToS3;
