# File Storage with HTTP Actions

This example demonstrates how to use Convex file storage to augment Convex Chat
with images via [HTTP actions](https://docs.convex.dev/functions/http-actions).

This app is an extension of the Convex chat tutorial including a new button for
uploading images. Images will be stored in Convex file storage, with their
storage IDs saved in the messages table for access.

To learn more about storage see the
[File Storage](https://docs.convex.dev/file-storage) documentation.

## Running the App

Make sure your `.env` file contains both `VITE_CONVEX_URL` and
`VITE_CONVEX_SITE_URL`, which should look something like this:

```
VITE_CONVEX_URL="https://happy-animal-123.convex.cloud"
VITE_CONVEX_SITE_URL="https://happy-animal-123.convex.site"
```

Additionally, add a
[Convex environment variable](https://docs.convex.dev/production/hosting/environment-variables)
named `CLIENT_ORIGIN` with the origin of your website (e.g.
`http://localhost:3000` if developing locally).

Run:

```
npm install
npm run dev
```
