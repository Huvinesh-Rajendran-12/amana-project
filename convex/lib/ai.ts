/**
 * AI Client abstraction for Anthropic Claude integration.
 * Contains prompt templates for different coaching styles and insight types.
 */

// Coaching style prompt modifiers
export const COACHING_STYLES = {
  gentle: {
    name: "Gentle Coach",
    description: "Supportive and encouraging, focuses on positive reinforcement",
    systemPrompt: `You are a kind, supportive financial coach. Your tone is warm and encouraging. 
You celebrate wins, no matter how small, and frame challenges as opportunities for growth.
When pointing out overspending, be gentle and solution-focused rather than judgmental.
Use phrases like "I noticed...", "Have you considered...", "Great job on...".
Avoid making the user feel guilty about their spending choices.`,
  },
  
  brutal: {
    name: "Brutal Honesty",
    description: "Direct and no-nonsense, tells it like it is",
    systemPrompt: `You are a brutally honest financial coach. Your tone is direct and pulls no punches.
You tell users exactly what they need to hear, not what they want to hear.
When they overspend, call it out directly. Use phrases like "Let's be real...", 
"You need to face the facts...", "This is costing you...".
Be constructive but don't sugarcoat problems. Think Gordon Ramsay but for money.
Include specific numbers and comparisons to drive points home.`,
  },
  
  nerdy: {
    name: "Data Nerd",
    description: "Statistics-focused, loves charts and percentages",
    systemPrompt: `You are a data-obsessed financial analyst. Your tone is analytical and precise.
You love statistics, percentages, and trends. Include specific numbers in every message.
Use phrases like "The data shows...", "Statistically speaking...", "Your spending is X% above...".
Compare current spending to historical averages. Reference percentiles and benchmarks.
Present insights as data-driven discoveries rather than opinions.`,
  },
  
  meme: {
    name: "Meme Lord",
    description: "Casual and funny, uses internet humor",
    systemPrompt: `You are a Gen-Z financial coach who communicates through internet culture and humor.
Your tone is casual, funny, and relatable. Use memes, emojis, and slang appropriately.
Make financial advice entertaining and shareable. Reference popular culture.
Use phrases like "No cap...", "That's not very cash money of you...", "Sheesh...".
Keep it fun but still provide actionable advice. Balance humor with useful insights.
Don't be cringe - keep it authentic and actually funny.`,
  },
};

// Insight type prompts
export const INSIGHT_PROMPTS = {
  spending_spike: `Analyze the user's spending spike in a specific category. Include:
- What category had the spike
- How much higher than usual (percentage)
- Potential reasons based on transaction patterns
- Whether this is concerning or expected (e.g., holiday spending)
- One actionable suggestion`,

  subscription_waste: `Analyze a subscription that appears to be underutilized. Include:
- The subscription name and monthly cost
- Why it appears underused (low engagement, rarely charged, etc.)
- Potential yearly savings if cancelled
- Whether there are cheaper alternatives
- A gentle prompt to review or cancel`,

  peer_comparison: `Compare the user's spending to their peer group. Include:
- The specific category being compared
- How they compare (above/below average, percentile)
- Whether this is good or bad in context
- Relevant factors (e.g., "this is normal for your city")
- One suggestion if they're significantly above average`,

  pattern_detected: `Describe an interesting spending pattern you've detected. Include:
- What the pattern is (e.g., "weekend splurges", "late-night shopping")
- How often it occurs
- The financial impact
- Whether it's helping or hurting their goals
- A behavioral nudge if appropriate`,

  savings_opportunity: `Highlight a potential savings opportunity. Include:
- What the opportunity is
- How much they could save (monthly/yearly)
- How to take action
- Any tradeoffs to consider
- Urgency level (act now vs. consider later)`,

  weekly_summary: `Provide a weekly spending summary. Include:
- Total spent this week vs last week
- Top 3 spending categories
- Any notable transactions
- Progress toward any savings goals
- One win to celebrate and one area for improvement`,

  goal_progress: `Update the user on progress toward a financial goal. Include:
- The goal and target amount
- Current progress (amount and percentage)
- Projected completion date at current pace
- Whether they're on track, ahead, or behind
- Encouragement or adjustment suggestions`,
};

// Message templates for specific scenarios
export const MESSAGE_TEMPLATES = {
  // Transaction alerts
  largeTransaction: (merchantName: string, amount: number, category: string) => 
    `Large purchase detected: $${amount.toFixed(2)} at ${merchantName} (${category})`,
  
  frequentMerchant: (merchantName: string, count: number, total: number, period: string) =>
    `You've visited ${merchantName} ${count} times this ${period}, spending $${total.toFixed(2)} total`,
  
  budgetWarning: (category: string, spent: number, budget: number, percentage: number) =>
    `You've spent $${spent.toFixed(2)} of your $${budget.toFixed(2)} ${category} budget (${percentage}%)`,
  
  // Positive reinforcement
  savingsWin: (amount: number, comparedTo: string) =>
    `You saved $${amount.toFixed(2)} compared to ${comparedTo}!`,
  
  streakAchievement: (days: number, achievement: string) =>
    `${days} day streak! ${achievement}`,
  
  goalMilestone: (goalName: string, percentage: number) =>
    `Milestone reached! You're ${percentage}% of the way to ${goalName}`,
  
  // Mode-specific
  yoloMode: (merchantName: string, amount: number) =>
    `Enjoy! $${amount.toFixed(2)} at ${merchantName}. YOLO mode active - no judgment here 👑`,
  
  brokeMode: (category: string, limit: number, spent: number) =>
    `⚠️ Broke mode alert: You've hit $${spent.toFixed(2)} in ${category}. Daily limit is $${limit.toFixed(2)}`,
  
  vacationMode: (spent: number, budget: number, tripName: string) =>
    `${tripName} spending: $${spent.toFixed(2)} of $${budget.toFixed(2)} trip budget`,
};

// Build a complete prompt for generating an insight
export function buildInsightPrompt(
  coachingStyle: keyof typeof COACHING_STYLES,
  insightType: keyof typeof INSIGHT_PROMPTS,
  context: {
    userData: {
      name?: string;
      currency: string;
      monthlyIncome?: number;
    };
    spendingData: {
      currentPeriodTotal: number;
      previousPeriodTotal: number;
      topCategories: { name: string; amount: number }[];
      recentTransactions: { merchantName: string; amount: number; category: string }[];
    };
    specificContext?: Record<string, unknown>;
  }
): { systemPrompt: string; userPrompt: string } {
  const style = COACHING_STYLES[coachingStyle];
  const insightPrompt = INSIGHT_PROMPTS[insightType];
  
  const systemPrompt = `${style.systemPrompt}

You are helping a user manage their personal finances. Your responses should be:
- Concise (2-4 sentences max)
- Actionable when possible
- Personalized based on their data
- In their preferred currency (${context.userData.currency})

${insightPrompt}`;

  const userPrompt = `User: ${context.userData.name ?? "User"}
Monthly Income: ${context.userData.monthlyIncome ? `${context.userData.currency} ${context.userData.monthlyIncome}` : "Not specified"}

Current Period Spending: ${context.userData.currency} ${context.spendingData.currentPeriodTotal.toFixed(2)}
Previous Period Spending: ${context.userData.currency} ${context.spendingData.previousPeriodTotal.toFixed(2)}

Top Categories:
${context.spendingData.topCategories.map(c => `- ${c.name}: ${context.userData.currency} ${c.amount.toFixed(2)}`).join("\n")}

Recent Transactions:
${context.spendingData.recentTransactions.slice(0, 5).map(t => `- ${t.merchantName}: ${context.userData.currency} ${t.amount.toFixed(2)} (${t.category})`).join("\n")}

${context.specificContext ? `Additional Context: ${JSON.stringify(context.specificContext)}` : ""}

Generate an insight based on this data.`;

  return { systemPrompt, userPrompt };
}

// Format insight for storage
export function formatInsightForStorage(
  rawResponse: string,
  type: keyof typeof INSIGHT_PROMPTS,
  severity: "info" | "warning" | "alert" | "celebration"
): { title: string; message: string } {
  // Extract a title from the first line or generate one
  const lines = rawResponse.trim().split("\n");
  let title = lines[0];
  let message = rawResponse;
  
  // If the response has a clear title/body structure
  if (lines.length > 1 && lines[0].length < 60) {
    title = lines[0].replace(/^[#\-*]+\s*/, ""); // Remove markdown
    message = lines.slice(1).join("\n").trim();
  } else {
    // Generate a title based on type
    const defaultTitles: Record<string, string> = {
      spending_spike: "Spending Alert",
      subscription_waste: "Subscription Review",
      peer_comparison: "How You Compare",
      pattern_detected: "Pattern Spotted",
      savings_opportunity: "Save Money Here",
      weekly_summary: "Your Week in Review",
      goal_progress: "Goal Update",
    };
    title = defaultTitles[type] ?? "Financial Insight";
  }
  
  return { title, message };
}

