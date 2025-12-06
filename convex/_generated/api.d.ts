/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agents_cashflowAgent from "../agents/cashflowAgent.js";
import type * as agents_hajjSavingsAgent from "../agents/hajjSavingsAgent.js";
import type * as agents_industryRiskAgent from "../agents/industryRiskAgent.js";
import type * as agents_shariahComplianceAgent from "../agents/shariahComplianceAgent.js";
import type * as agents_zakatAgent from "../agents/zakatAgent.js";
import type * as auth from "../auth.js";
import type * as behavioralTriggers from "../behavioralTriggers.js";
import type * as benchmarks from "../benchmarks.js";
import type * as cronHelpers from "../cronHelpers.js";
import type * as crons from "../crons.js";
import type * as insights from "../insights.js";
import type * as lib_agentPrompts from "../lib/agentPrompts.js";
import type * as lib_ai from "../lib/ai.js";
import type * as lib_islamicFinance from "../lib/islamicFinance.js";
import type * as lib_messageBus from "../lib/messageBus.js";
import type * as lib_ragPipeline from "../lib/ragPipeline.js";
import type * as modes from "../modes.js";
import type * as seed from "../seed.js";
import type * as subscriptions from "../subscriptions.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "agents/cashflowAgent": typeof agents_cashflowAgent;
  "agents/hajjSavingsAgent": typeof agents_hajjSavingsAgent;
  "agents/industryRiskAgent": typeof agents_industryRiskAgent;
  "agents/shariahComplianceAgent": typeof agents_shariahComplianceAgent;
  "agents/zakatAgent": typeof agents_zakatAgent;
  auth: typeof auth;
  behavioralTriggers: typeof behavioralTriggers;
  benchmarks: typeof benchmarks;
  cronHelpers: typeof cronHelpers;
  crons: typeof crons;
  insights: typeof insights;
  "lib/agentPrompts": typeof lib_agentPrompts;
  "lib/ai": typeof lib_ai;
  "lib/islamicFinance": typeof lib_islamicFinance;
  "lib/messageBus": typeof lib_messageBus;
  "lib/ragPipeline": typeof lib_ragPipeline;
  modes: typeof modes;
  seed: typeof seed;
  subscriptions: typeof subscriptions;
  transactions: typeof transactions;
  users: typeof users;
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
