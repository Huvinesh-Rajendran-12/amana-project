/**
 * RAG Configuration (Stub)
 *
 * Shariah Compliance Agent uses agentic text search over hardcoded Islamic policy file
 * See: convex/agents/shariahComplianceAgent.ts
 *
 * Features:
 * - All 255 Islamic chapters from IS Dataset
 * - Claude-based agentic retrieval through policy database
 * - No embeddings or vectors needed
 * - No external APIs beyond Claude
 */

import { components } from "../_generated/api";
import { RAG } from "@convex-dev/rag";

// Stub - Convex RAG component not actively used
export const rag = new RAG(components.rag, {} as any);

export type RAGInstance = typeof rag;
