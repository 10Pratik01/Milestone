import { Router } from "express";
import { getProjects } from "../controllers/projectControllers.js";
const router = Router();
router.get("/", getProjects);
export default router;
