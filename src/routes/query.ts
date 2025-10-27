// src/routes/query.ts
import express from "express";
import { nlqAnswer } from "../services/nlq.js";

const router = express.Router();

/**
 * POST /query
 * Body: { "q": "your question" }
 * Reads user/tenant/role/region context from headers via contextMiddleware.
 */
router.post("/query", async (req, res) => {
  try {
    const q = (req.body?.q || "").toString();
    if (!q) return res.status(400).json({ error: "Missing 'q' in body" });

    const ctx = (req as any).userCtx;
    const result = await nlqAnswer(ctx, q);
    return res.json({ context: ctx, query: q, result });
  } catch (err) {
    console.error("NLQ error:", err);
    return res.status(500).json({ error: "NLQ processing failed" });
  }
});

export default router;
