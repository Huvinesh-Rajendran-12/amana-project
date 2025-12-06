# RAG (Retrieval-Augmented Generation) System

Semantic search over Islamic Finance knowledge base using Convex RAG component.

## Directory Structure

```
convex/rag/
├── config.ts           # RAG initialization with OpenAI embeddings
├── knowledgeBase.ts    # Islamic chapters and content
├── actions.ts          # Semantic search and context retrieval
└── README.md           # This file
```

## Setup

### 1. Install RAG Component

```bash
npm install @convex-dev/rag
npx convex codegen
```

### 2. Set Environment Variables

Add to your Convex dashboard environment variables:

```
OPENAI_API_KEY=<your-openai-api-key>
```

### 3. Seed Knowledge Base

Run the seeding action:

```bash
npx convex run rag/actions:seedIslamicKnowledge
```

This will:
- Load 14 Islamic finance chapters
- Generate embeddings using text-embedding-3-small
- Store in Convex database with metadata filters
- Enable semantic search for agents

## Files Overview

### `config.ts`

Initializes the RAG instance with:
- OpenAI text-embedding-3-small model (1536 dimensions)
- Metadata filters: `chapter` and `topics`
- Namespace isolation: `islamic-finance`

```typescript
import { rag } from "./config";

const results = await rag.search(ctx, {
  namespace: "islamic-finance",
  query: "Is this transaction halal?",
  limit: 3,
});
```

### `knowledgeBase.ts`

Contains 14 curated Islamic finance chapters:

**Zakat (Chapters 164-176)**
- General principles and obligations
- Nisab thresholds (gold & silver)
- Distribution rules (8 Asnaf)
- Zakat al-Fitr

**Hajj (Chapter 179)**
- Obligation and requirements
- Financial preparation

**Transactions (Chapters 180-191)**
- Valid sales and contracts
- Haram transactions (Riba, Gharar, Maysir)
- Credit and credit terms
- Gold/Silver exchange

**Loans (Chapter 205)**
- Interest-free lending (Qard)
- Islamic loan principles

### `actions.ts`

Provides semantic search functions for agents:

#### Seeding
- `seedIslamicKnowledge()` - Populate knowledge base

#### General Search
- `searchKnowledge(query, limit?, topic?)` - Semantic search

#### Agent-Specific Context
- `getShariahContext(merchant, description, amount?)` - For Shariah Compliance Agent
- `getZakatContext(wealth?, assetType?)` - For Zakat Agent
- `getHajjContext(currentSavings?, targetAmount?)` - For Hajj Savings Agent
- `getTransactionContext(transactionType)` - For Industry Risk Agent
- `getLoanContext(loanAmount?, purpose?)` - For loan-related queries

#### Utilities
- `getAllChapters()` - List all chapters
- `getKnowledgeStats()` - Statistics about knowledge base

## Usage in Agents

### Example: Shariah Compliance Agent

```typescript
import { rag } from "../rag/config";

export const checkTransaction = internalAction({
  args: { merchant: v.string(), amount: v.number() },
  handler: async (ctx, args) => {
    // Get relevant Islamic rulings
    const ragContext = await ctx.runAction(api.rag.actions.getShariahContext, {
      merchant: args.merchant,
      description: "transaction check",
      amount: args.amount,
    });

    // Use context in Claude prompt
    const response = await client.messages.create({
      system: `You are a Shariah compliance expert.

${ragContext.context}

Analyze the transaction based on these Islamic rulings.`,
      messages: [{ role: "user", content: "Is this halal?" }],
    });

    return response;
  },
});
```

## How RAG Search Works

1. **Query Embedding**: Your search query is converted to a 1536-dimensional vector
2. **Vector Similarity**: Compare query vector against stored chapter embeddings
3. **Ranking**: Results ranked by cosine similarity score (0-1)
4. **Filtering**: Optionally filter by `chapter` or `topics` metadata
5. **Threshold**: Only return results above 0.3 similarity score

## Knowledge Base Statistics

- **Total Chapters**: 14
- **Topics Covered**: zakat, hajj, transactions, loans, riba, gharar, maysir, etc.
- **Embedding Model**: text-embedding-3-small (OpenAI)
- **Embedding Dimension**: 1536
- **Namespace**: islamic-finance

## Testing

### Test Semantic Search

```bash
npx convex run rag/actions:searchKnowledge --args '{"query":"What is zakat?"}'
```

### Test Agent Context

```bash
npx convex run rag/actions:getShariahContext --args '{
  "merchant":"Bank Islam",
  "description":"savings account",
  "amount":5000
}'
```

### View Statistics

```bash
npx convex run rag/actions:getKnowledgeStats
```

## Performance Notes

- Embeddings are computed once during seeding
- Subsequent searches are vector-only (very fast)
- Each search uses ~100-200 embedding tokens (from OpenAI usage)
- Results cached by Convex automatically
- Namespace isolation prevents knowledge cross-contamination

## Future Enhancements

1. **More Chapters**: Add chapters 1-163 for comprehensive coverage
2. **Custom Embeddings**: Use Claude API for embeddings if preferred
3. **Knowledge Updates**: Automatic re-embedding on content changes
4. **User-Specific Namespaces**: Per-user knowledge for personalization
5. **Importance Weighting**: Weight critical rulings higher (0-1 importance)
6. **Chunk Context**: Retrieve surrounding chunks for better context

## Troubleshooting

**Q: "Components not found"**
- Run: `npx convex codegen`

**Q: "OPENAI_API_KEY not set"**
- Add to Convex dashboard environment variables
- See: https://docs.convex.dev/dashboard/deployments/deployment-settings

**Q: No results returned**
- Check similarity threshold (currently 0.3)
- Try broader query terms
- Verify seeding completed: `npx convex run rag/actions:getKnowledgeStats`

**Q: Slow performance**
- This is normal; embeddings are computed during seeding
- Search queries are very fast (vector-only)
- Consider increasing `limit` parameter if results are inconsistent

## Documentation

- [Convex RAG Docs](https://www.convex.dev/components/rag)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [Islamic Finance References](../lib/islamicFinance.ts)
