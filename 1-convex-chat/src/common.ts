import { Id } from "convex/values";

export type Message = {
  _id: Id;
  body: string;
  author: string;
  time: number;
};
