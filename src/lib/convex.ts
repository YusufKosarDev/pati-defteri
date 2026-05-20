import { ConvexReactClient } from "convex/react";

const url = import.meta.env.VITE_CONVEX_URL as string | undefined;

export const isConvexConfigured = !!url;
export const convex = url ? new ConvexReactClient(url) : null;
