import { ConvexHttpClient } from "convex/browser";
import clientConfig from "../convex/_generated/clientConfig";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const allowedContentTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/png",
  "image/bmp",
  "image/tif",
  "image/tiff",
]);

const convex = new ConvexHttpClient(clientConfig);

const bucket = process.env.BUCKET_NAME;
const s3 = new S3Client({
  region: "us-west-2",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
  },
});

export default async function handler(request, response) {
  const params = request.query;

  if (!allowedContentTypes.has(request.headers["content-type"])) {
    response.status(400);
    return;
  }

  // Upload image to S3.
  const key = `${uuidv4()}-${params.imgName}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: request,
      ContentLength: parseInt(request.headers["content-length"]),
      ContentType: request.headers["content-type"],
    })
  );

  // There should only be a single 'author' query parameter present
  const author = params.author;

  // Write S3 key into the Convex chat messages table.
  await convex.mutation("sendMessage")(key, author, "s3");

  response.status(200);
}
