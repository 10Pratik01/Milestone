import { Router } from "express";
import { getTeams } from "../controllers/teamController.js";

const teamRoutes = Router(); 

teamRoutes.get("/everyone", getTeams);

export default teamRoutes; 