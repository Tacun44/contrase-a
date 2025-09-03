import { Router } from "express";
import { crearCredencial, listarCredenciales, eliminarCredencial } from "../controllers/credencialesController";
import { authenticateJWT } from "../middlewares/auth";

const router = Router();

router.post("/", authenticateJWT, crearCredencial);
router.get("/", authenticateJWT, listarCredenciales);
router.delete("/:id", authenticateJWT, eliminarCredencial);

export default router; 