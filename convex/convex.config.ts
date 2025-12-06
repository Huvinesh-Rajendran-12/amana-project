/**
 * Convex Configuration
 * Enables RAG component for semantic search over Islamic finance knowledge
 * Uses HuggingFace Inference API for embeddings (free tier available)
 */

import { defineApp } from "convex/server";
import rag from "@convex-dev/rag/convex.config.js";

const app = defineApp();
app.use(rag);

export default app;

