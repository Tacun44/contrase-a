import { Router } from "express";
import { crearCredencial, listarCredenciales, actualizarCredencial, eliminarCredencial } from "../controllers/credencialesController";
import { authenticateJWT } from "../middlewares/auth";
import { checkActiveSession } from "../middlewares/activeSession";

const router = Router();

router.post("/", authenticateJWT, checkActiveSession, crearCredencial);
router.get("/", authenticateJWT, checkActiveSession, listarCredenciales);
router.put("/:id", authenticateJWT, checkActiveSession, actualizarCredencial);
router.delete("/:id", authenticateJWT, checkActiveSession, eliminarCredencial);

export default router; 