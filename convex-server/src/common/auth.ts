export type AuthenticatedUser = {
  _id: string;
  subject: string;
  name?: string;
  picture_url?: string;
  email?: string;
  email_verified?: boolean;
  locale?: string;
};
