import express from "express";
import entityRoutes from "./entityRoutes.js";
const router = express.Router();
router.use('/api', entityRoutes);
export default router;
