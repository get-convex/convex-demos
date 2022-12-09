# S3 Photo Upload Example App

This example demonstrates how to use [AWS S3](https://aws.amazon.com/s3/) to add
file upload to a Convex app.

This app uses [Vercel](https://vercel.com) to host API endpoints that upload and
download the files from S3.

To learn more, see https://docs.convex.dev/using/integrations/s3-photo-upload.

## Running the App

This app requires first creating an S3 bucket. The instructions to create it are
at https://docs.convex.dev/using/integrations/s3-photo-upload.

Once you have a bucket and AWS credentials, put them in a `.env` file at the
root of this project:

```
BUCKET_NAME='your-bucket-name'
ACCESS_KEY='your-aws-access-key'
SECRET_KEY='your-aws-secret-key'
```

For secrecy, do not check it into git.

Run:

```
npm install
npm run dev
```

The Vercel CLI will prompt you about how to configure the project. Use the
auto-detected [Vite](https://vitejs.dev/) settings.
