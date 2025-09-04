import { Router } from "express";
import { checkCurrentUserStatus, getAllUsers, updateUser, updateUserStatus, deleteUser } from "../controllers/usersController";
import { authenticateJWT } from "../middlewares/auth";
import { checkActiveSession } from "../middlewares/activeSession";

const router = Router();

router.get("/me", authenticateJWT, checkCurrentUserStatus);
router.get("/", authenticateJWT, checkActiveSession, getAllUsers);
router.put("/:id", authenticateJWT, checkActiveSession, updateUser);
router.patch("/:id/status", authenticateJWT, checkActiveSession, updateUserStatus);
router.delete("/:id", authenticateJWT, checkActiveSession, deleteUser);

export default router;
