import { Id } from "convex/values";

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

export type User = {
  _id: Id;
  name: string;
  tokenIdentifier: string;
};
