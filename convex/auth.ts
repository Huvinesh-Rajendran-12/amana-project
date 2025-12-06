import { ConvexError, v } from "convex/values";
import {
  query,
  mutation,
  QueryCtx,
  MutationCtx,
} from "./_generated/server";

/**
 * Authentication helpers for the Finance AI backend.
 * 
 * This module provides utilities for user authentication and session management.
 * For this prototype, we use a simplified auth flow with email-based identification.
 * In production, you would integrate with Convex Auth or a provider like Clerk.
 */

// Helper to get the current user from the database
export async function getCurrentUser(ctx: QueryCtx | MutationCtx, userId: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", userId))
    .first();
  
  return user;
}

// Helper to require authentication - throws if no user found
export async function requireUser(ctx: QueryCtx | MutationCtx, userId: string) {
  const user = await getCurrentUser(ctx, userId);
  
  if (!user) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "User not found. Please sign in.",
    });
  }
  
  return user;
}

// Get user by ID directly
export async function getUserById(ctx: QueryCtx | MutationCtx, userId: string) {
  const user = await ctx.db.get(userId as any);
  return user;
}

// Query: Get current user profile
export const getMe = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.email);
    return user;
  },
});

// Mutation: Create or update user (for auth flow)
export const upsertUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name: args.name ?? existingUser.name,
        tokenIdentifier: args.tokenIdentifier ?? existingUser.tokenIdentifier,
        updatedAt: now,
      });
      return existingUser._id;
    }
    
    // Create new user with defaults
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      tokenIdentifier: args.tokenIdentifier,
      currency: "USD",
      coachingStyle: "gentle",
      activeMode: "normal",
      excludedCategoryIds: [],
      isOnboarded: false,
      createdAt: now,
      updatedAt: now,
    });
    
    return userId;
  },
});

// Mutation: Complete onboarding
export const completeOnboarding = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    age: v.optional(v.number()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    currency: v.string(),
    monthlyIncome: v.optional(v.number()),
    coachingStyle: v.union(
      v.literal("gentle"),
      v.literal("brutal"),
      v.literal("nerdy"),
      v.literal("meme")
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    
    await ctx.db.patch(user._id, {
      name: args.name,
      age: args.age,
      city: args.city,
      country: args.country,
      currency: args.currency,
      monthlyIncome: args.monthlyIncome,
      coachingStyle: args.coachingStyle,
      isOnboarded: true,
      updatedAt: Date.now(),
    });
    
    return user._id;
  },
});

// Mutation: Delete user account
export const deleteAccount = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.email);
    
    // Delete all user data (transactions, insights, subscriptions, etc.)
    // In production, you might want to soft-delete or archive instead
    
    // Delete transactions
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const tx of transactions) {
      await ctx.db.delete(tx._id);
    }
    
    // Delete insights
    const insights = await ctx.db
      .query("insights")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const insight of insights) {
      await ctx.db.delete(insight._id);
    }
    
    // Delete subscriptions
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const sub of subscriptions) {
      await ctx.db.delete(sub._id);
    }
    
    // Delete spending modes
    const modes = await ctx.db
      .query("spendingModes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const mode of modes) {
      await ctx.db.delete(mode._id);
    }
    
    // Finally delete the user
    await ctx.db.delete(user._id);
    
    return { success: true };
  },
});

