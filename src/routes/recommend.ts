import express from "express";
import { getRecommendations } from "../services/recommend.js";

const router = express.Router();

/**
 * GET /recommend?tenant_id=bankcorp&office_id=blr_finops
 * or  /recommend/:tenant_id/:office_id
 * Returns a list of underutilized rooms for a given tenant + office.
 */
router.get("/", (req, res) => {
  const tenant_id = req.query.tenant_id as string;
  const office_id = req.query.office_id as string;

  if (!tenant_id || !office_id) {
    return res.status(400).json({ error: "Missing tenant_id or office_id" });
  }

  try {
    const result = getRecommendations(tenant_id, office_id);
    return res.json(result);
  } catch (err) {
    console.error("❌ Recommendation error:", err);
    return res.status(500).json({ error: "Failed to compute recommendations" });
  }
});

// ✅ Support path parameters too (Swagger-friendly)
router.get("/:tenant_id/:office_id", (req, res) => {
  const { tenant_id, office_id } = req.params;

  if (!tenant_id || !office_id) {
    return res.status(400).json({ error: "Missing tenant_id or office_id" });
  }

  try {
    const result = getRecommendations(tenant_id, office_id);
    return res.json(result);
  } catch (err) {
    console.error("❌ Recommendation (path params) error:", err);
    return res.status(500).json({ error: "Failed to compute recommendations" });
  }
});

export default router;
