import { ConvexReactClient } from "convex/react";

const url = import.meta.env.VITE_CONVEX_URL;

if (!url) {
  throw new Error(
    "VITE_CONVEX_URL tanımlı değil. `npx convex dev` çalıştırarak .env.local'i oluşturun."
  );
}

export const convex = new ConvexReactClient(url);
