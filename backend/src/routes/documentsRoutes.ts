import { Router } from "express";
import { 
  getDocuments, 
  uploadDocument, 
  downloadDocument, 
  deleteDocument,
  getExpenseCategories,
  simulateEmailDownload,
  uploadMiddleware
} from "../controllers/documentsController";
import { authenticateJWT } from "../middlewares/auth";
import { checkActiveSession } from "../middlewares/activeSession";

const router = Router();

// Rutas para documentos
router.get("/", authenticateJWT, checkActiveSession, getDocuments);
router.post("/upload", authenticateJWT, checkActiveSession, uploadMiddleware, uploadDocument);
router.get("/download/:id", authenticateJWT, checkActiveSession, downloadDocument);
router.delete("/:id", authenticateJWT, checkActiveSession, deleteDocument);

// Rutas para categorías
router.get("/categories", authenticateJWT, checkActiveSession, getExpenseCategories);

// Ruta para simular descarga desde correo
router.post("/email-download", authenticateJWT, checkActiveSession, simulateEmailDownload);

export default router;
