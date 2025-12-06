# Finance AI Backend

A Convex backend for a personal finance AI assistant with spending insights, peer benchmarks, subscription detection, and spending modes.

## Features

- **Real-time Transaction Tracking** - Full CRUD with auto-categorization
- **AI Coaching** - Claude-powered insights with personality styles (Gentle/Brutal/Nerdy/Meme)
- **Subscription Detection** - Automatically detects recurring payments
- **Peer Benchmarks** - Compare spending to anonymized peers
- **Spending Modes** - YOLO, Broke, and Vacation modes

## Quick Start

```bash
# Set up Convex
npx convex dev

# Seed data (run in Convex dashboard or via frontend)
# 1. seedCategories() - Create default categories
# 2. seedMerchants() - Add common merchants
# 3. seedBenchmarks() - Create benchmark data
# 4. seedAll({ email: "user@example.com" }) - Create demo user
# 5. seedTransactions({ userId: "<userId>", months: 6 }) - Generate mock transactions
```

## Environment Variables

Add to your Convex deployment:

```
ANTHROPIC_API_KEY=your_claude_api_key  # Optional: enables AI-powered insights
```

## Module Reference

### `schema.ts`
Database tables: `users`, `transactions`, `categories`, `merchants`, `subscriptions`, `insights`, `benchmarks`, `spendingModes`

### `auth.ts`
- `getMe(email)` - Get current user
- `upsertUser(email, name?)` - Create or update user
- `completeOnboarding(...)` - Complete user onboarding

### `transactions.ts`
- `list(userId, filters?)` - List transactions with filters
- `create(userId, amount, type, description, merchantName, date)` - Add transaction
- `getSpendingByCategory(userId, startDate, endDate)` - Aggregate by category
- `getSpendingSummary(userId, startDate, endDate)` - Income/expenses/savings
- `getTopMerchants(userId, startDate, endDate)` - Top spending merchants
- `getDailySpending(userId, startDate, endDate)` - Daily chart data

### `subscriptions.ts`
- `list(userId, status?)` - List subscriptions
- `runDetection(userId)` - Detect new subscriptions
- `getOptimizationOpportunities(userId)` - Find wasteful subscriptions
- `getUpcoming(userId, days?)` - Upcoming charges

### `insights.ts`
- `list(userId, unreadOnly?, type?)` - Get insights
- `generate(userId, type)` - Generate AI insight via Claude
- `getCoachingMessage(userId)` - Get contextual coaching message
- `markAsRead(insightId)` - Mark as read

### `benchmarks.ts`
- `getForCategory(userId, categoryId)` - Compare to peers
- `getAllCategories(userId)` - All category comparisons
- `getUserRanking(userId)` - Overall ranking

### `modes.ts`
- `getCurrentMode(userId)` - Get active mode
- `setMode(userId, mode, settings?, expiresAt?)` - Set mode
- `toggleYoloMode(userId, enable, duration?)` - Quick YOLO toggle
- `activateBrokeMode(userId, dailyLimit, blockedCategories?, duration?)` - Strict mode
- `startVacationMode(userId, tripName, tripBudget, endDate)` - Trip mode
- `checkPurchaseAllowed(userId, amount, categoryId?)` - Broke mode check

### `users.ts`
- `getProfile(userId)` - Get full profile
- `updatePreferences(userId, ...)` - Update settings
- `setCoachingStyle(userId, style)` - Change AI personality
- `getDashboardSummary(userId)` - Dashboard data

### `seed.ts`
- `seedCategories()` - Create default categories
- `seedMerchants()` - Add merchants
- `seedBenchmarks()` - Generate benchmark data
- `seedTransactions(userId, months?, transactionsPerMonth?)` - Mock transactions
- `seedAll(email, name?)` - Create demo user

## Scheduled Jobs (`crons.ts`)

- **Daily 2AM UTC** - Detect new subscriptions
- **Daily 12:01AM UTC** - Expire spending modes
- **Daily 8AM UTC** - Detect spending spikes
- **Sunday 6PM UTC** - Generate weekly insights
- **1st of month 3AM UTC** - Update benchmarks
- **1st of month 4AM UTC** - Clean up old insights

## Coaching Styles

| Style | Personality |
|-------|-------------|
| `gentle` | Supportive, encouraging, celebrates small wins |
| `brutal` | Direct, no sugarcoating (Gordon Ramsay vibes) |
| `nerdy` | Data-focused, percentages, benchmarks |
| `meme` | Gen-Z humor, internet culture, casual |

## Spending Modes

| Mode | Behavior |
|------|----------|
| `normal` | Balanced insights |
| `yolo` | No judgment, celebrate purchases |
| `broke` | Daily limits, blocked categories, aggressive alerts |
| `vacation` | Trip budget tracking, relaxed insights |
