/**
 * Islamic Finance Knowledge Base for RAG (Retrieval-Augmented Generation)
 * Provides Islamic jurisprudence (fiqh) context for AI responses.
 *
 * Sources: Islamic text dataset chapters 164-193, 205 covering:
 * - Zakat (164-178)
 * - Hajj (179)
 * - Transactions/Muamalat (180-193)
 * - Loans (205)
 */

import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "../_generated/server";

// ==================== ISLAMIC FINANCE TOPICS ====================

export const ISLAMIC_FINANCE_TOPICS = {
  zakat: {
    chapters: [164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178],
    keywords: ["zakat", "nisab", "alms", "charity", "zakatable", "haul", "fitr", "fitrah"],
    description: "Zakat - obligatory alms tax on wealth",
  },
  hajj: {
    chapters: [179],
    keywords: ["hajj", "pilgrimage", "mecca", "makkah", "umrah", "ihram"],
    description: "Hajj - pilgrimage to Mecca",
  },
  transactions: {
    chapters: [180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193],
    keywords: ["buying", "selling", "trade", "transaction", "contract", "payment", "credit"],
    description: "Islamic rules on buying, selling, and business transactions",
  },
  haram_transactions: {
    chapters: [182, 183],
    keywords: ["haram", "prohibited", "unlawful", "forbidden", "riba", "usury", "gambling"],
    description: "Prohibited and disapproved transactions in Islam",
  },
  riba: {
    chapters: [183, 188, 191],
    keywords: ["riba", "interest", "usury", "loan", "credit", "bunga"],
    description: "Riba (usury/interest) prohibition in Islamic finance",
  },
  loans: {
    chapters: [205],
    keywords: ["loan", "qarḍ", "debt", "lending", "borrowing"],
    description: "Islamic rules on loans (Qarḍ)",
  },
};

// ==================== CHAPTER MAPPINGS ====================

export const CHAPTER_TITLES: Record<number, string> = {
  164: "Alms Tax (Zakat)",
  165: "Distribution of khums",
  166: "Conditions for zakat to become obligatory (wājib)",
  167: "Zakat of wheat, barley, and raisins",
  168: "The taxable limit (niṣāb) for gold",
  169: "The niṣāb for silver",
  170: "Zakat of camels, cows, and sheep",
  171: "Zakat on business goods",
  172: "Distribution of zakat",
  173: "Criteria for being entitled to receive (mustaḥiqq) zakat",
  174: "Intention (niyyah) for giving zakat",
  175: "Miscellaneous rulings on zakat",
  176: "The fiṭrah alms tax (zakāt al-fiṭrah)",
  177: "Distribution of zakāt al-fiṭrah",
  178: "Miscellaneous rulings on zakāt al-fiṭrah",
  179: "Hajj",
  180: "Buying and Selling",
  181: "Recommended (mustaḥabb) acts of buying and selling",
  182: "Disapproved (makrūh) transactions",
  183: "Unlawful (ḥarām) transactions",
  184: "Conditions relating to the seller and the buyer",
  185: "Conditions relating to the commodity and the payment in exchange",
  186: "The transaction formula (ṣīghah)",
  187: "Buying and selling fruit",
  188: "Immediate exchange (naqd) and credit (nasīʾah) transactions",
  189: "Prepayment (salaf) transaction and its conditions",
  190: "Laws relating to prepayment (salaf) transactions",
  191: "Selling gold and silver for gold and silver",
  192: "Cases when a person can annul a transaction",
  193: "Miscellaneous rulings",
  205: "Loan (Qarḍ)",
};

// ==================== KEY ISLAMIC FINANCE RULINGS ====================

/**
 * Pre-indexed rulings for common queries.
 * These are used when vector search is not available.
 */
export const KEY_RULINGS = {
  // Nisab thresholds
  nisab_gold: {
    ruling: "The nisab for gold is 20 mithqals, which is equivalent to approximately 85 grams of pure gold.",
    chapter: 168,
    topic: "zakat",
  },
  nisab_silver: {
    ruling: "The nisab for silver is 200 dirhams, which is equivalent to approximately 595 grams of pure silver.",
    chapter: 169,
    topic: "zakat",
  },

  // Zakat rate
  zakat_rate: {
    ruling: "When wealth reaches the nisab and has been held for one complete lunar year (haul), zakat of 2.5% (one-fortieth) becomes obligatory.",
    chapter: 166,
    topic: "zakat",
  },

  // Zakat on gold
  zakat_gold: {
    ruling: "Zakat is obligatory on gold when it reaches 20 mithqals (approximately 85 grams) and has been owned for one complete lunar year. The zakat due is 2.5% of the total value.",
    chapter: 168,
    topic: "zakat",
  },

  // Zakat on business
  zakat_business: {
    ruling: "Zakat is obligatory on business goods (stock in trade) if they reach the nisab value. The zakat is calculated on the market value at the end of the haul.",
    chapter: 171,
    topic: "zakat",
  },

  // Zakat distribution (8 Asnaf)
  zakat_recipients: {
    ruling: "Zakat can only be given to the eight categories mentioned in the Quran: the poor (fuqara), the needy (masakin), zakat collectors (amilin), those whose hearts are to be reconciled (muallafa), freeing slaves (riqab), those in debt (gharimin), in the cause of Allah (fi sabilillah), and travelers in need (ibn al-sabil).",
    chapter: 172,
    topic: "zakat",
  },

  // Zakatul Fitr
  zakat_fitr: {
    ruling: "Zakatul Fitr is obligatory upon every Muslim who possesses sustenance for himself and his family for the day and night of Eid. It must be paid before the Eid prayer.",
    chapter: 176,
    topic: "zakat",
  },

  // Riba prohibition
  riba_prohibition: {
    ruling: "Riba (interest/usury) is categorically prohibited in Islam. Any excess charged on a loan beyond the principal is riba. This includes bank interest, credit card interest, and any form of guaranteed return on loans.",
    chapter: 183,
    topic: "riba",
  },

  // Haram transactions
  haram_transactions: {
    ruling: "The following transactions are prohibited (haram): 1) Transactions involving riba (interest), 2) Transactions involving gharar (excessive uncertainty), 3) Gambling and speculation, 4) Trading in prohibited goods (alcohol, pork, weapons for oppression), 5) Deceitful trading practices.",
    chapter: 183,
    topic: "haram_transactions",
  },

  // Buying and selling basics
  valid_sale: {
    ruling: "For a sale to be valid, there must be: 1) A willing seller and buyer, 2) Clear subject matter, 3) A known price, 4) Delivery capability, 5) Avoidance of prohibited elements like riba and gharar.",
    chapter: 180,
    topic: "transactions",
  },

  // Credit transactions
  credit_sale: {
    ruling: "Credit sales (bay' bi-thaman ajil) are permissible if the price and payment terms are clearly specified at the time of contract. Increasing the price for deferred payment is allowed, but charging interest on late payments is riba.",
    chapter: 188,
    topic: "transactions",
  },

  // Loans in Islam
  islamic_loan: {
    ruling: "A loan (qard) in Islam must be given without any benefit to the lender. The borrower returns only the principal amount. Any excess is riba. It is recommended to lend to those in need.",
    chapter: 205,
    topic: "loans",
  },

  // Gold and silver exchange
  gold_exchange: {
    ruling: "When exchanging gold for gold, or silver for silver, the exchange must be equal in weight and immediate (spot). Any disparity or delay is riba al-fadl or riba al-nasiah.",
    chapter: 191,
    topic: "transactions",
  },

  // Hajj obligation
  hajj_obligation: {
    ruling: "Hajj is obligatory once in a lifetime for every Muslim who has the physical ability and financial means to perform it. Financial means includes having enough for the journey and to support dependents during absence.",
    chapter: 179,
    topic: "hajj",
  },
};

// ==================== RAG QUERY FUNCTIONS ====================

/**
 * Find relevant rulings for a query
 */
export const findRelevantRulings = internalQuery({
  args: {
    query: v.string(),
    topic: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;
    const queryLower = args.query.toLowerCase();

    // First, try to find in key rulings (keyword matching)
    const matchedRulings: Array<{
      ruling: string;
      chapter: number;
      topic: string;
      relevance: number;
    }> = [];

    for (const [key, ruling] of Object.entries(KEY_RULINGS)) {
      // Check topic filter
      if (args.topic && ruling.topic !== args.topic) continue;

      // Simple keyword matching
      const rulingText = ruling.ruling.toLowerCase();
      const keywords = queryLower.split(/\s+/);
      let matchCount = 0;

      for (const keyword of keywords) {
        if (keyword.length > 2 && rulingText.includes(keyword)) {
          matchCount++;
        }
      }

      if (matchCount > 0) {
        matchedRulings.push({
          ...ruling,
          relevance: matchCount / keywords.length,
        });
      }
    }

    // Sort by relevance
    matchedRulings.sort((a, b) => b.relevance - a.relevance);

    // If we have DB-indexed rulings, query those too
    const dbRulings = await ctx.db.query("islamicRulings").take(100);

    // Filter and score DB rulings
    const scoredDbRulings = dbRulings
      .filter((r) => {
        if (args.topic && !r.topics.includes(args.topic)) return false;
        const content = r.content.toLowerCase();
        return queryLower.split(/\s+/).some((k) => k.length > 2 && content.includes(k));
      })
      .map((r) => {
        const content = r.content.toLowerCase();
        const keywords = queryLower.split(/\s+/);
        let matchCount = 0;
        for (const keyword of keywords) {
          if (keyword.length > 2 && content.includes(keyword)) {
            matchCount++;
          }
        }
        return {
          ruling: r.content,
          chapter: r.chapter,
          topic: r.topics[0] || "general",
          chapterTitle: r.chapterTitle,
          relevance: matchCount / keywords.length,
        };
      });

    // Combine and deduplicate
    const allRulings = [...matchedRulings, ...scoredDbRulings];
    allRulings.sort((a, b) => b.relevance - a.relevance);

    return allRulings.slice(0, limit);
  },
});

/**
 * Get rulings by chapter
 */
export const getRulingsByChapter = internalQuery({
  args: {
    chapter: v.number(),
  },
  handler: async (ctx, args) => {
    const rulings = await ctx.db
      .query("islamicRulings")
      .withIndex("by_chapter", (q) => q.eq("chapter", args.chapter))
      .collect();

    return rulings;
  },
});

/**
 * Get rulings by topic
 */
export const getRulingsByTopic = internalQuery({
  args: {
    topic: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    // Get topic config
    const topicConfig = ISLAMIC_FINANCE_TOPICS[args.topic as keyof typeof ISLAMIC_FINANCE_TOPICS];
    if (!topicConfig) {
      return [];
    }

    // Query by chapters in this topic
    const rulings = await ctx.db
      .query("islamicRulings")
      .collect();

    return rulings
      .filter((r) => topicConfig.chapters.includes(r.chapter))
      .slice(0, limit);
  },
});

// ==================== CONTEXT BUILDERS ====================

/**
 * Build RAG context for a specific question type
 */
export function buildRagContext(
  topic: keyof typeof ISLAMIC_FINANCE_TOPICS,
  specificQuestion?: string
): string {
  const topicConfig = ISLAMIC_FINANCE_TOPICS[topic];
  let context = `## Islamic Finance Context: ${topicConfig.description}\n\n`;

  // Add relevant key rulings
  const relevantRulings = Object.entries(KEY_RULINGS)
    .filter(([_, r]) => r.topic === topic)
    .map(([key, r]) => `### ${CHAPTER_TITLES[r.chapter] || `Chapter ${r.chapter}`}\n${r.ruling}`)
    .join("\n\n");

  context += relevantRulings;

  if (specificQuestion) {
    context += `\n\n## User Question\n${specificQuestion}`;
  }

  return context;
}

/**
 * Build Zakat calculation context
 */
export function buildZakatContext(): string {
  return `## Zakat Calculation Rules

### Nisab Thresholds
- Gold: 85 grams (or its equivalent value in MYR)
- Silver: 595 grams (or its equivalent value in MYR)
- For cash/wealth, use the LOWER of gold or silver nisab

### Haul (Time Period)
- Wealth must be held for one complete Islamic lunar year (354 days)
- Calculation is done at the end of each haul

### Zakat Rate
- Standard rate: 2.5% (1/40) of net zakatable wealth

### Zakatable Assets
1. Cash and bank balances
2. Gold and silver (above nisab)
3. Business inventory at market value
4. Trade receivables
5. Shariah-compliant investments
6. EPF/retirement funds (varies by state ruling)

### Deductions
1. Immediate debts (due within the year)
2. Basic necessities for current month

### The 8 Asnaf (Recipients)
1. Fakir (الفقير) - The poor who have nothing
2. Miskin (المسكين) - The needy who have some means
3. Amil (العامل) - Zakat collectors/administrators
4. Muallaf (المؤلفة قلوبهم) - New Muslims or those inclined to Islam
5. Riqab (الرقاب) - Freeing those in bondage
6. Gharimin (الغارمين) - Those burdened with debt
7. Fisabilillah (في سبيل الله) - In the cause of Allah
8. Ibnu Sabil (ابن السبيل) - Stranded travelers

Reference: Chapters 164-178 of Islamic jurisprudence`;
}

/**
 * Build Shariah compliance context
 */
export function buildShariahContext(): string {
  return `## Shariah Compliance Guidelines

### Core Prohibitions
1. **Riba (ربا)** - Interest/Usury
   - Any excess over the principal in a loan
   - Bank interest (savings, loans, credit cards)
   - Late payment charges above actual costs

2. **Gharar (غرر)** - Excessive Uncertainty
   - Contracts with unclear terms
   - Speculative transactions
   - Derivatives with uncertain outcomes

3. **Maysir (ميسر)** - Gambling
   - Games of chance
   - Lottery and betting
   - Pure speculation

4. **Haram Goods/Services**
   - Alcohol (الخمر)
   - Pork and pork products (الخنزير)
   - Weapons for aggression
   - Adult entertainment
   - Tobacco (disputed among scholars)

### Halal Transaction Requirements
1. Subject matter must be halal
2. Price must be known
3. Both parties must consent freely
4. Delivery must be possible
5. No deception or fraud

### Malaysian Context
- JAKIM halal certification is the standard
- Bank Negara Malaysia Shariah Advisory Council rulings
- Securities Commission Shariah-compliant securities list

Reference: Chapters 180-193 of Islamic jurisprudence (Muamalat)`;
}

/**
 * Build Hajj savings context
 */
export function buildHajjContext(): string {
  return `## Hajj Preparation Guidelines

### Hajj Obligation
- Once in a lifetime for those who are:
  - Physically able
  - Financially capable
  - Have secure path to Mecca

### Financial Preparation
- Ensure halal income for Hajj savings
- Pay off debts first (recommended)
- Provide for dependents during absence
- Save gradually over time

### Tabung Haji (Malaysia)
- Official Hajj savings fund
- Provides hibah (profit-sharing)
- Manages Hajj packages and logistics
- Registration and queue system

### Zakat on Hajj Savings
- If savings exceed nisab for one year, zakat is due
- Calculate at 2.5% of total savings
- Pay zakat before or after Hajj

### Spiritual Preparation
- Learn Hajj rituals
- Seek forgiveness from others
- Make sincere intention (niyyah)
- Prepare mentally for the journey

Reference: Chapter 179 of Islamic jurisprudence`;
}

// ==================== SEED DATA ====================

/**
 * Seed initial Islamic rulings into the database
 */
export const seedIslamicRulings = internalMutation({
  args: {},
  handler: async (ctx) => {
    const rulings = [
      // Zakat rulings
      {
        chapter: 166,
        chapterTitle: "Conditions for zakat to become obligatory",
        content: "Zakat becomes obligatory when wealth reaches the nisab (minimum threshold) and has been held for one complete lunar year (haul). The owner must be a sane adult Muslim with full ownership of the wealth.",
        topics: ["zakat", "conditions"],
        language: "en",
      },
      {
        chapter: 168,
        chapterTitle: "The taxable limit (niṣāb) for gold",
        content: "The nisab for gold is 20 mithqals (approximately 85 grams of pure gold). When gold reaches this amount and has been owned for one year, zakat of 2.5% becomes obligatory on its value.",
        topics: ["zakat", "nisab", "gold"],
        language: "en",
      },
      {
        chapter: 169,
        chapterTitle: "The niṣāb for silver",
        content: "The nisab for silver is 200 dirhams (approximately 595 grams of pure silver). The same rules apply as for gold regarding haul and rate.",
        topics: ["zakat", "nisab", "silver"],
        language: "en",
      },
      {
        chapter: 172,
        chapterTitle: "Distribution of zakat",
        content: "Zakat must be distributed to one or more of the eight categories (asnaf) mentioned in the Quran: the poor, the needy, zakat collectors, new Muslims, freeing slaves, those in debt, in the cause of Allah, and stranded travelers.",
        topics: ["zakat", "distribution", "asnaf"],
        language: "en",
      },
      // Haram transactions
      {
        chapter: 183,
        chapterTitle: "Unlawful (ḥarām) transactions",
        content: "Transactions involving the following are prohibited: riba (interest/usury), gharar (excessive uncertainty), maysir (gambling), trading in prohibited goods such as alcohol, pork, and weapons for oppression, and any transaction involving deception or fraud.",
        topics: ["haram", "transactions", "riba", "gambling"],
        language: "en",
      },
      // Riba
      {
        chapter: 183,
        chapterTitle: "Riba (Interest) Prohibition",
        content: "Riba is strictly prohibited in Islam. This includes any excess charged on a loan beyond the principal amount. Bank interest, credit card interest, late payment fees beyond actual costs, and guaranteed returns on investments are all forms of riba.",
        topics: ["riba", "interest", "haram"],
        language: "en",
      },
      // Loans
      {
        chapter: 205,
        chapterTitle: "Loan (Qarḍ)",
        content: "A qard (loan) in Islam must be interest-free. The lender may only receive back the exact amount lent. Any additional benefit to the lender is riba. It is recommended (mustahabb) to give loans to those in need, and the borrower should try to repay promptly.",
        topics: ["loans", "qard", "riba"],
        language: "en",
      },
      // Hajj
      {
        chapter: 179,
        chapterTitle: "Hajj",
        content: "Hajj is obligatory (wajib) once in a lifetime for every Muslim who has the physical ability and financial means to perform it. Financial means includes having enough for the journey, maintaining dependents during absence, and returning home safely.",
        topics: ["hajj", "pilgrimage", "obligation"],
        language: "en",
      },
      // Valid sale
      {
        chapter: 180,
        chapterTitle: "Buying and Selling",
        content: "For a sale to be valid, both parties must have legal capacity, the subject matter must be owned and deliverable, the price must be known and agreed upon, and there must be no prohibited elements like riba, gharar, or deception.",
        topics: ["transactions", "sale", "buying", "selling"],
        language: "en",
      },
      // Credit sale
      {
        chapter: 188,
        chapterTitle: "Immediate exchange and credit transactions",
        content: "Credit sales (bay' muajjal) are permissible when the price and payment schedule are clearly defined at the time of contract. The price may be higher for deferred payment compared to immediate payment. However, charging additional interest for late payment is prohibited riba.",
        topics: ["transactions", "credit", "deferred"],
        language: "en",
      },
    ];

    for (const ruling of rulings) {
      // Check if already exists
      const existing = await ctx.db
        .query("islamicRulings")
        .withIndex("by_chapter", (q) => q.eq("chapter", ruling.chapter))
        .first();

      if (!existing) {
        await ctx.db.insert("islamicRulings", {
          ...ruling,
          createdAt: Date.now(),
        });
      }
    }

    return { seeded: rulings.length };
  },
});
