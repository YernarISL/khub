import express from "express";
import MLRiskController from "../controllers/MLRiskController.js";

const router = express.Router();

router.post("/dropout-risk", (req, res, next) => MLRiskController.dropoutRisk(req, res, next));

export default router;
