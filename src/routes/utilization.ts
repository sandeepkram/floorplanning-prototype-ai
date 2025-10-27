import express from "express";
import { getRoomUtilization } from "../services/analytics.js";

const router = express.Router();

/**
 * GET /utilization?tenant_id=bankcorp&room_id=conf_A
 * or  /utilization/:tenant_id/:room_id
 * Returns average utilization and peak over last 30 days.
 */
router.get("/", (req, res) => {
  const tenant_id = (req.query.tenant_id as string) || "";
  const room_id = (req.query.room_id as string) || "";

  if (!tenant_id || !room_id) {
    return res.status(400).json({ error: "Missing tenant_id or room_id" });
  }

  try {
    const result = getRoomUtilization(tenant_id, room_id);
    return res.json(result);
  } catch (err) {
    console.error("❌ Utilization error:", err);
    return res.status(500).json({ error: "Failed to compute utilization" });
  }
});

// ✅ Support path parameters too (Swagger-friendly)
router.get("/:tenant_id/:room_id", (req, res) => {
  const { tenant_id, room_id } = req.params;

  if (!tenant_id || !room_id) {
    return res.status(400).json({ error: "Missing tenant_id or room_id" });
  }

  try {
    const result = getRoomUtilization(tenant_id, room_id);
    return res.json(result);
  } catch (err) {
    console.error("❌ Utilization (path params) error:", err);
    return res.status(500).json({ error: "Failed to compute utilization" });
  }
});

export default router;
