import { cronJobs } from "./_generated/server";

const crons = cronJobs();

crons.interval("clear messages table", { minutes: 1 }, "clearAllMessages");

export default crons;
