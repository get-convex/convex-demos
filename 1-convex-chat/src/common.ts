import { Id } from "@convex-dev/server";

export type Message = {
  _id: Id;
  body: string;
  author: string;
  time: number;
};
