// If multiple pages components need to use the client, define it in a separate file like this.

import { ConvexReactClient } from "convex/react";
import clientConfig from "../convex/_generated/clientConfig";

const convex = new ConvexReactClient(clientConfig);
