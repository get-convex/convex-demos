// If multiple pages components need to use the client, define it in a separate file like this.

import { ConvexReactClient } from "convex-dev/react";
import convexConfig from "../convex.json";
export const convex = new ConvexReactClient(convexConfig.origin);
