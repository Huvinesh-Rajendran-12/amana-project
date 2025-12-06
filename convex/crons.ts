import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

/**
 * Scheduled jobs for the Finance AI backend.
 * 
 * These cron jobs run automatically to:
 * - Detect new subscriptions from transaction history
 * - Generate weekly AI insights
 * - Update benchmark aggregates
 * - Expire spending modes
 * - Clean up old data
 */

const crons = cronJobs();

// ============================================
// DAILY JOBS (run every day at specific times)
// ============================================

// Detect new subscriptions from transaction patterns
// Runs daily at 2:00 AM UTC
crons.daily(
  "detect-subscriptions",
  { hourUTC: 2, minuteUTC: 0 },
  internal.cronHelpers.detectSubscriptionsForAllUsers
);

// Expire spending modes that have passed their end date
// Runs daily at 12:01 AM UTC
crons.daily(
  "expire-modes",
  { hourUTC: 0, minuteUTC: 1 },
  internal.modes.expireModes
);

// Detect spending spikes and generate alerts
// Runs daily at 8:00 AM UTC (morning check)
crons.daily(
  "detect-spending-spikes",
  { hourUTC: 8, minuteUTC: 0 },
  internal.cronHelpers.detectSpikesForAllUsers
);

// Detect behavioral patterns weekly
// Runs every Monday at 6:00 AM UTC
crons.weekly(
  "detect-behavioral-triggers",
  { dayOfWeek: "monday", hourUTC: 6, minuteUTC: 0 },
  internal.cronHelpers.detectBehavioralTriggersForAllUsers
);

// ============================================
// WEEKLY JOBS
// ============================================

// Generate weekly summary insights for all users
// Runs every Sunday at 6:00 PM UTC
crons.weekly(
  "weekly-insights",
  { dayOfWeek: "sunday", hourUTC: 18, minuteUTC: 0 },
  internal.cronHelpers.generateWeeklyInsightsForAllUsers
);

// ============================================
// MONTHLY JOBS
// ============================================

// Update benchmark aggregates from anonymized user data
// Runs on the 1st of each month at 3:00 AM UTC
crons.monthly(
  "update-benchmarks",
  { day: 1, hourUTC: 3, minuteUTC: 0 },
  internal.benchmarks.updateAggregates
);

// Clean up old dismissed insights (older than 90 days)
// Runs on the 1st of each month at 4:00 AM UTC
crons.monthly(
  "cleanup-old-insights",
  { day: 1, hourUTC: 4, minuteUTC: 0 },
  internal.cronHelpers.cleanupOldInsights
);

export default crons;

