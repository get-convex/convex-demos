import { StrongRef, Id } from "@convex-dev/server";

export type Message = {
  _id: Id;
  channel: StrongRef;
  format: string; // "text" or "giphy"
  body: string;
  author: string;
  time: number;
};

export type Channel = {
  _id: Id;
  name: string;
};
