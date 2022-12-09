import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const bucket = process.env.BUCKET_NAME;
const s3 = new S3Client({
  region: "us-west-2",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
  },
});

export default async function handler(request, response) {
  const resp = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: request.query.key,
    })
  );
  const body = resp.Body;

  response
    .status(200)
    .setHeader("Content-Length", resp.ContentLength)
    .setHeader("Content-Type", resp.ContentType);
  body.on("data", chunk => response.write(chunk));
  body.on("end", () => response.end());
}
