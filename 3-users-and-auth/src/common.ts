import { StrongRef, Id } from "@convex-dev/server";

export type Message = {
  _id: Id;
  channel: StrongRef;
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
