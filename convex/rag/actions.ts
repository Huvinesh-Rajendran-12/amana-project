/**
 * RAG Actions for Islamic Finance Knowledge Base
 *
 * Provides semantic search and context retrieval for all agents.
 * Uses the Convex RAG component with OpenAI embeddings.
 */

import { action, internalAction } from "../_generated/server";
import { v } from "convex/values";
import { rag } from "./config";
import { ISLAMIC_CHAPTERS } from "./knowledgeBase";

// ==================== SEEDING ====================

/**
 * Seed Islamic chapters into RAG
 * Run once during initial setup to populate the knowledge base
 *
 * Usage:
 *   Call from dashboard: npx convex run rag/actions:seedIslamicKnowledge
 */
export const seedIslamicKnowledge = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("📚 Seeding Islamic Finance Knowledge Base...");
    console.log(`Total chapters to seed: ${ISLAMIC_CHAPTERS.length}\n`);

    let seeded = 0;

    for (const chapter of ISLAMIC_CHAPTERS) {
      console.log(
        `[${seeded + 1}/${ISLAMIC_CHAPTERS.length}] Chapter ${chapter.chapterNum}: ${chapter.title}`
      );

      try {
        // Add chapter to RAG with text and metadata filters
        await rag.add(ctx, {
          namespace: "islamic-finance",
          text: `**${chapter.title}** (Chapter ${chapter.chapterNum})\n\n${chapter.content}`,
          filterValues: [
            {
              name: "chapter",
              value: chapter.chapterNum.toString(),
            },
            {
              name: "topics",
              value: chapter.topics.join(","),
            },
          ],
        });

        seeded++;
        console.log("   ✓ Added to RAG\n");
      } catch (error) {
        console.error(`   ✗ Error: ${error}\n`);
      }
    }

    console.log("✅ Seeding complete!");
    console.log(`✓ ${seeded}/${ISLAMIC_CHAPTERS.length} chapters added to RAG`);

    return {
      success: true,
      seeded,
      total: ISLAMIC_CHAPTERS.length,
    };
  },
});

// ==================== SEMANTIC SEARCH ====================

/**
 * Search Islamic knowledge base by semantic similarity
 * Returns relevant rulings based on query meaning, not just keyword matching
 */
export const searchKnowledge = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    topic: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 3;

    console.log(`🔍 Semantic search: "${args.query}"`);
    if (args.topic) {
      console.log(`   Filter by topic: ${args.topic}`);
    }

    // Build filters if topic is specified
    const filters = args.topic
      ? [
          {
            name: "topics",
            value: args.topic,
          },
        ]
      : undefined;

    // Perform semantic search
    const results = await rag.search(ctx, {
      namespace: "islamic-finance",
      query: args.query,
      limit,
      filters,
      vectorScoreThreshold: 0.3, // Lower threshold for better retrieval
    });

    console.log(`✓ Found ${results.results.length} relevant results\n`);

    return {
      query: args.query,
      results: results.results,
      text: results.text,
      entries: results.entries,
      usage: results.usage,
    };
  },
});

// ==================== AGENT-SPECIFIC CONTEXT RETRIEVAL ====================

/**
 * Get context for Shariah Compliance Agent
 * Retrieves rulings about haram transactions and compliance
 */
export const getShariahContext = action({
  args: {
    merchant: v.string(),
    description: v.string(),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = `Is ${args.merchant} ${args.description} halal or haram? Transaction Shariah compliance.`;

    console.log(
      `⚖️ Shariah check: ${args.merchant} - ${args.description}${args.amount ? ` (RM${args.amount})` : ""}`
    );

    const results = await rag.search(ctx, {
      namespace: "islamic-finance",
      query,
      limit: 3,
      filters: [
        {
          name: "topics",
          value: "haram",
        },
      ],
    });

    return {
      merchant: args.merchant,
      description: args.description,
      amount: args.amount,
      context: results.text,
      relevantRulings: results.results,
    };
  },
});

/**
 * Get context for Zakat Agent
 * Retrieves rulings about zakat calculation, nisab, and distribution
 */
export const getZakatContext = action({
  args: {
    wealth: v.optional(v.number()),
    assetType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const query =
      args.assetType && args.wealth
        ? `Calculate zakat on ${args.assetType} worth RM${args.wealth}`
        : "How to calculate zakat? Nisab threshold and zakat rates.";

    console.log(`📿 Zakat context${args.wealth ? ` (RM${args.wealth})` : ""}`);

    const results = await rag.search(ctx, {
      namespace: "islamic-finance",
      query,
      limit: 5,
      filters: [
        {
          name: "topics",
          value: "zakat",
        },
      ],
    });

    return {
      wealth: args.wealth,
      assetType: args.assetType,
      context: results.text,
      relevantRulings: results.results,
    };
  },
});

/**
 * Get context for Hajj Savings Agent
 * Retrieves rulings about hajj obligation and preparation
 */
export const getHajjContext = action({
  args: {
    currentSavings: v.optional(v.number()),
    targetAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query =
      args.currentSavings && args.targetAmount
        ? `Hajj savings progress: RM${args.currentSavings} towards RM${args.targetAmount}`
        : "What are the requirements and guidance for Hajj preparation?";

    console.log(`🕋 Hajj guidance${args.currentSavings ? ` (RM${args.currentSavings} / RM${args.targetAmount})` : ""}`);

    const results = await rag.search(ctx, {
      namespace: "islamic-finance",
      query,
      limit: 3,
      filters: [
        {
          name: "topics",
          value: "hajj",
        },
      ],
    });

    return {
      currentSavings: args.currentSavings,
      targetAmount: args.targetAmount,
      context: results.text,
      relevantRulings: results.results,
    };
  },
});

/**
 * Get context for transaction rules
 * Retrieves guidelines about buying, selling, and commerce
 */
export const getTransactionContext = action({
  args: {
    transactionType: v.string(),
  },
  handler: async (ctx, args) => {
    const query = `Islamic rules and conditions for ${args.transactionType} transactions`;

    console.log(`💱 Transaction rules: ${args.transactionType}`);

    const results = await rag.search(ctx, {
      namespace: "islamic-finance",
      query,
      limit: 4,
      filters: [
        {
          name: "topics",
          value: "transactions",
        },
      ],
    });

    return {
      transactionType: args.transactionType,
      context: results.text,
      relevantRulings: results.results,
    };
  },
});

/**
 * Get context for loans and credit
 * Retrieves rulings about riba, qard, and interest-free lending
 */
export const getLoanContext = action({
  args: {
    loanAmount: v.optional(v.number()),
    purpose: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const query =
      args.loanAmount && args.purpose
        ? `Is a RM${args.loanAmount} loan for ${args.purpose} allowed in Islam?`
        : "What are the Islamic rules about loans and interest?";

    console.log(`🏦 Loan rules${args.loanAmount ? ` (RM${args.loanAmount})` : ""}`);

    const results = await rag.search(ctx, {
      namespace: "islamic-finance",
      query,
      limit: 3,
      filters: [
        {
          name: "topics",
          value: "loans",
        },
      ],
    });

    return {
      loanAmount: args.loanAmount,
      purpose: args.purpose,
      context: results.text,
      relevantRulings: results.results,
    };
  },
});

// ==================== UTILITIES ====================

/**
 * Get all chapters for debugging/testing
 */
export const getAllChapters = action({
  args: {},
  handler: async (ctx) => {
    console.log(`📚 Retrieving all ${ISLAMIC_CHAPTERS.length} chapters`);

    return {
      total: ISLAMIC_CHAPTERS.length,
      chapters: ISLAMIC_CHAPTERS.map((ch) => ({
        chapter: ch.chapterNum,
        title: ch.title,
        topics: ch.topics,
      })),
    };
  },
});

/**
 * Get statistics about seeded knowledge
 */
export const getKnowledgeStats = action({
  args: {},
  handler: async (ctx) => {
    const allChapters = ISLAMIC_CHAPTERS.length;
    const topicCounts: Record<string, number> = {};

    for (const chapter of ISLAMIC_CHAPTERS) {
      for (const topic of chapter.topics) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    }

    console.log(`📊 Knowledge Base Statistics:`);
    console.log(`   Total Chapters: ${allChapters}`);
    console.log(`   Topics: ${Object.keys(topicCounts).length}`);
    console.log(`   Topic Coverage:`, topicCounts);

    return {
      totalChapters: allChapters,
      topicCount: Object.keys(topicCounts).length,
      topics: topicCounts,
    };
  },
});
