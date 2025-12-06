/**
 * RAG (Retrieval-Augmented Generation) Pipeline
 * Integrates Islamic finance knowledge base with Claude AI agents
 *
 * Purpose:
 * - Retrieves relevant Islamic rulings based on query context
 * - Builds enhanced system prompts with domain knowledge
 * - Provides accurate Shariah references for agent decisions
 */

import { internalQuery } from "../_generated/server";
import { v } from "convex/values";
import {
  ISLAMIC_FINANCE_TOPICS,
  KEY_RULINGS,
  CHAPTER_TITLES,
} from "./islamicFinance";

// ==================== RAG CONTEXT BUILDERS ====================

/**
 * Build enriched system prompt with RAG context for Shariah Compliance
 * Retrieves relevant rulings to inform transaction analysis
 */
export function buildShariahComplianceRAGContext(
  merchant: string,
  amount: number,
  description: string
): string {
  const query = `${merchant} ${description}`.toLowerCase();

  // Find relevant rulings from KEY_RULINGS
  const relevantRulings: Array<{
    ruling: string;
    chapter: number;
    topic: string;
  }> = [];

  // Check for transaction-related topics
  const topicsToCheck = [
    "haram_transactions",
    "riba",
    "transactions",
  ];

  for (const [key, rule] of Object.entries(KEY_RULINGS)) {
    if (topicsToCheck.includes(rule.topic)) {
      const ruleText = rule.ruling.toLowerCase();
      // Simple keyword matching
      if (
        query.includes("riba") ||
        query.includes("interest") ||
        query.includes("credit")
      ) {
        if (ruleText.includes("riba") || ruleText.includes("interest")) {
          relevantRulings.push(rule);
        }
      } else if (
        query.includes("gambling") ||
        query.includes("casino") ||
        query.includes("bet")
      ) {
        if (
          ruleText.includes("maysir") ||
          ruleText.includes("gambling") ||
          ruleText.includes("speculation")
        ) {
          relevantRulings.push(rule);
        }
      } else if (
        query.includes("alcohol") ||
        query.includes("bar") ||
        query.includes("pub")
      ) {
        if (ruleText.includes("haram") || ruleText.includes("prohibited")) {
          relevantRulings.push(rule);
        }
      } else {
        // Default: include general haram transaction ruling
        if (key === "haram_transactions") {
          relevantRulings.push(rule);
        }
      }
    }
  }

  // Build context string
  let context = `## Shariah Compliance Reference Context

### Transaction Analysis
Merchant: ${merchant}
Amount: RM${amount}
Description: ${description}

### Relevant Islamic Rulings:
`;

  if (relevantRulings.length > 0) {
    for (const ruling of relevantRulings.slice(0, 3)) {
      context += `
**${CHAPTER_TITLES[ruling.chapter] || `Chapter ${ruling.chapter}`}** (Topic: ${ruling.topic})
${ruling.ruling}
`;
    }
  } else {
    context += `
**General Haram Transactions (Chapter 183)**
${KEY_RULINGS.haram_transactions.ruling}

**Riba Prohibition (Chapter 183)**
${KEY_RULINGS.riba_prohibition.ruling}
`;
  }

  context += `

### Analysis Framework:
1. Check if transaction involves prohibited goods (alcohol, pork, gambling)
2. Verify no interest (riba) component exists
3. Confirm no excessive uncertainty (gharar)
4. Ensure legitimate business transaction
5. Apply Malaysian Shariah standards (JAKIM, BNM)`;

  return context;
}

/**
 * Build enriched system prompt with RAG context for Zakat Agent
 * Retrieves relevant nisab and calculation rulings
 */
export function buildZakatRAGContext(
  totalWealth: number,
  nisabThreshold: number
): string {
  const relevantRulings: Array<{
    ruling: string;
    chapter: number;
    topic: string;
  }> = [];

  // Always include core zakat rulings
  relevantRulings.push(KEY_RULINGS.nisab_gold);
  relevantRulings.push(KEY_RULINGS.zakat_rate);
  relevantRulings.push(KEY_RULINGS.zakat_recipients);

  // Include business zakat if relevant
  if (totalWealth > 100000) {
    relevantRulings.push(KEY_RULINGS.zakat_business);
  }

  let context = `## Zakat Calculation Reference Context

### Wealth Assessment
Total Wealth: RM${totalWealth.toLocaleString()}
Nisab Threshold: RM${nisabThreshold.toLocaleString()}
Above Nisab: ${totalWealth >= nisabThreshold ? "Yes" : "No"}

### Authoritative Islamic Rulings:
`;

  for (const ruling of relevantRulings) {
    context += `
**${CHAPTER_TITLES[ruling.chapter]}** (Topic: ${ruling.topic})
${ruling.ruling}
`;
  }

  context += `

### Calculation Guidelines:
1. Determine if wealth exceeds Nisab (85g gold equivalent)
2. Confirm one Islamic year (Haul) of ownership
3. Calculate 2.5% of total zakatable wealth
4. Identify 8 Asnaf recipient categories
5. Process through legitimate state Zakat authority

### Malaysian State Zakat Distribution:
- Selangor: Lembaga Zakat Selangor (LZS)
- KL/WP: PPZ-MAIWP
- Johor: Majlis Agama Islam Johor (MAIJ)
- Penang: Zakat Pulau Pinang (ZPP)
- Other states: Respective Islamic authorities`;

  return context;
}

/**
 * Build enriched context for Hajj savings recommendations
 */
export function buildHajjRAGContext(
  currentSavings: number,
  targetAmount: number
): string {
  const relevantRulings: Array<{
    ruling: string;
    chapter: number;
    topic: string;
  }> = [];

  relevantRulings.push(KEY_RULINGS.hajj_obligation);

  // Add zakat reminder if approaching nisab
  if (currentSavings >= 15000) {
    relevantRulings.push(KEY_RULINGS.zakat_fitr);
  }

  let context = `## Hajj Savings Reference Context

### Savings Progress
Current Savings: RM${currentSavings.toLocaleString()}
Target Amount: RM${targetAmount.toLocaleString()}
Progress: ${((currentSavings / targetAmount) * 100).toFixed(1)}%

### Authoritative Islamic Guidance:
`;

  for (const ruling of relevantRulings) {
    context += `
**${CHAPTER_TITLES[ruling.chapter]}**
${ruling.ruling}
`;
  }

  context += `

### Hajj Preparation Checklist:
1. Ensure financial means (at least RM25,000-30,000)
2. Secure dependents' welfare during absence
3. Pay off immediate debts first
4. Use only Halal income for Hajj savings
5. Register with Tabung Haji (queue time ~5-7 years)
6. Remember Zakat obligation if savings exceed Nisab
7. Make sincere intention (Niyyah) for Hajj

### Tabung Haji Benefits:
- Official Hajj fund with Shariah compliance
- Hibah (profit-sharing) on savings
- Integrated Hajj package management
- State-based quota system`;

  return context;
}

/**
 * Build enriched context for transaction validation
 */
export function buildTransactionValidationRAGContext(): string {
  const riba = KEY_RULINGS.riba_prohibition;
  const haram = KEY_RULINGS.haram_transactions;
  const validSale = KEY_RULINGS.valid_sale;

  return `## Transaction Validation Reference

### Core Islamic Finance Principles:

**1. Riba Prohibition (Chapter ${riba.chapter})**
${riba.ruling}

**2. Haram Transactions (Chapter ${haram.chapter})**
${haram.ruling}

**3. Valid Sale Requirements (Chapter ${validSale.chapter})**
${validSale.ruling}

### Validation Checklist:
- [ ] Subject matter is Halal (not alcohol, pork, gambling, weapons)
- [ ] No interest (Riba) component in payment or financing
- [ ] Terms are clear and certain (no Gharar/excessive uncertainty)
- [ ] Both parties consent freely
- [ ] Merchant is legitimate and not involved in prohibited activities
- [ ] Price is transparent and known upfront
- [ ] No deception or fraud involved`;
}

/**
 * Build enriched context for credit and loan transactions
 */
export function buildLoanRAGContext(): string {
  const riba = KEY_RULINGS.riba_prohibition;
  const creditSale = KEY_RULINGS.credit_sale;
  const islamicLoan = KEY_RULINGS.islamic_loan;

  return `## Loan & Credit Transaction Reference

**Riba (Interest) Prohibition (Chapter 183)**
${riba.ruling}

**Credit Sales (Chapter 188)**
${creditSale.ruling}

**Islamic Loans - Qard (Chapter 205)**
${islamicLoan.ruling}

### Key Distinctions:

**Permissible: Credit Sale (Muajjal)**
- Price may be higher for deferred payment
- Example: Motorcycle RM15,000 cash vs RM18,000 on 12-month installment
- Condition: Price difference is final, not additional charges for delays

**Prohibited: Interest-Based Loans (Riba)**
- Any additional amount beyond principal
- Late payment charges become Riba
- Example: RM10,000 loan + RM2,500 interest = HARAM

**Recommended: Interest-Free Loans (Qard)**
- Borrow only principal amount
- Return only principal amount
- Optional: Return with extra as goodwill (not obligation)`;
}

/**
 * Query relevant rulings by keyword
 */
export const queryRulingsByKeyword = internalQuery({
  args: {
    keyword: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;
    const keywordLower = args.keyword.toLowerCase();

    const matchedRulings: Array<{
      ruling: string;
      chapter: number;
      topic: string;
      relevance: number;
    }> = [];

    // Search through KEY_RULINGS
    for (const [key, rule] of Object.entries(KEY_RULINGS)) {
      const rulingText = rule.ruling.toLowerCase();
      const topicText = rule.topic.toLowerCase();

      // Simple keyword matching with relevance scoring
      let relevance = 0;
      if (topicText.includes(keywordLower)) relevance += 2;
      if (rulingText.includes(keywordLower)) relevance += 1;

      // Check chapter title
      const chapterTitle = CHAPTER_TITLES[rule.chapter].toLowerCase();
      if (chapterTitle.includes(keywordLower)) relevance += 1;

      if (relevance > 0) {
        matchedRulings.push({
          ...rule,
          relevance,
        });
      }
    }

    // Sort by relevance
    matchedRulings.sort((a, b) => b.relevance - a.relevance);

    return matchedRulings.slice(0, limit);
  },
});

/**
 * Get all rulings by topic for comprehensive context
 */
export function getRulingsByTopic(topic: keyof typeof ISLAMIC_FINANCE_TOPICS): string {
  const topicConfig = ISLAMIC_FINANCE_TOPICS[topic];
  if (!topicConfig) return "";

  let context = `## ${topicConfig.description}\n\n`;

  // Add relevant key rulings
  const relevantRulings = Object.entries(KEY_RULINGS)
    .filter(([_, r]) => r.topic === topic || r.topic.includes(topic))
    .map(
      ([_, r]) =>
        `### ${CHAPTER_TITLES[r.chapter] || `Chapter ${r.chapter}`}\n${r.ruling}`
    )
    .join("\n\n");

  context += relevantRulings;
  return context;
}

// ==================== RAG ENHANCEMENT HELPER ====================

/**
 * Enhance a system prompt with relevant Islamic finance context
 * Use this to inject domain knowledge into Claude responses
 */
export function enhanceSystemPromptWithRAGContext(
  baseSystemPrompt: string,
  contextType:
    | "shariah"
    | "zakat"
    | "hajj"
    | "transaction"
    | "loan"
    | "general",
  additionalContext?: string
): string {
  let ragContext = "";

  switch (contextType) {
    case "shariah":
      ragContext = buildTransactionValidationRAGContext();
      break;
    case "zakat":
      ragContext = getRulingsByTopic("zakat");
      break;
    case "hajj":
      ragContext = getRulingsByTopic("hajj");
      break;
    case "transaction":
      ragContext = buildTransactionValidationRAGContext();
      break;
    case "loan":
      ragContext = buildLoanRAGContext();
      break;
    case "general":
      ragContext = getRulingsByTopic("transactions");
      break;
  }

  if (additionalContext) {
    ragContext += `\n\n${additionalContext}`;
  }

  return `${baseSystemPrompt}

## Reference Knowledge Base (Shariah Rulings)

${ragContext}`;
}
