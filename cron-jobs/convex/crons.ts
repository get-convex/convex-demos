import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.interval("clear messages table", { minutes: 1 }, api.messages.clearAll);

export default crons;
