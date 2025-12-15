import { Router } from "express";
import { search } from "../controllers/searchControllers.js";


const searchRoutes = Router(); 
searchRoutes.get('/', search);

export default searchRoutes

