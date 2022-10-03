import type { VercelRequest, VercelResponse } from "@vercel/node";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

const bucket = process.env.BUCKET_NAME!;
const s3 = new S3Client({
  region: "us-west-2",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_KEY!,
  },
});

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const resp = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: request.query.key as string,
    })
  );
  const body = resp.Body as Readable;

  response
    .status(200)
    .setHeader("Content-Length", resp.ContentLength!)
    .setHeader("Content-Type", resp.ContentType as string);
  body.on("data", chunk => response.write(chunk));
  body.on("end", () => response.end());
}
