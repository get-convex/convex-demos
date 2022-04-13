import { Id } from "convex-dev/values";

export type Message = {
  _id: Id;
  body: string;
  author: string;
  time: number;
};
