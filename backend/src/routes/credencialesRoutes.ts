import { Router } from "express";
import { crearCredencial, listarCredenciales } from "../controllers/credencialesController";
import { authenticateJWT } from "../middlewares/auth";

const router = Router();

router.post("/", authenticateJWT, crearCredencial);
router.get("/", authenticateJWT, listarCredenciales);

export default router; 