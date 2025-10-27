import express, { Request, Response } from "express";
import { getTenantId, getEntitySlice, insertEntityRecord } from "../utils/dataStore.js";

const router = express.Router();

router.get("/:tenantId/:entity", (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req.params.tenantId, req.header("x-tenant-id") || undefined);
    const entity = req.params.entity;
    const data = getEntitySlice(tenantId, entity);
    return res.status(200).json({ tenantId, entity, data });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.post("/:tenantId?/:entity", (req: Request, res: Response) => {
  try {
    const pathTenant = req.params.tenantId;
    const headerTenant = req.header("x-tenant-id") || undefined;
    const tenantId = getTenantId(pathTenant, headerTenant);
    const entity = req.params.entity;
    const created = insertEntityRecord(tenantId, entity, req.body);
    const data = getEntitySlice(tenantId, entity);
    return res.status(201).json({ tenantId, entity, created, total: data.length });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
