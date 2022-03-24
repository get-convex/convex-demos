import { Id } from "@convex-dev/server";

export type Message = {
  _id: Id;
  channel: Id;
  body: string;
  author: string;
  time: number;
};

export type Channel = {
  _id: Id;
  name: string;
};
