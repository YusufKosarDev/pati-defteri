/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as backup from "../backup.js";
import type * as crons from "../crons.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as pets from "../pets.js";
import type * as push from "../push.js";
import type * as pushInternal from "../pushInternal.js";
import type * as records from "../records.js";
import type * as reminders from "../reminders.js";
import type * as remindersInternal from "../remindersInternal.js";
import type * as users from "../users.js";
import type * as weights from "../weights.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  backup: typeof backup;
  crons: typeof crons;
  files: typeof files;
  http: typeof http;
  pets: typeof pets;
  push: typeof push;
  pushInternal: typeof pushInternal;
  records: typeof records;
  reminders: typeof reminders;
  remindersInternal: typeof remindersInternal;
  users: typeof users;
  weights: typeof weights;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
