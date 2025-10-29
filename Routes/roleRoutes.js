// ====== routes/roleRoutes.js ======
import express from "express";
import {
createOrUpdateRole,
getRoleById,
getAllRoles,
getAllRolesforWeb,
deleteRole
} from "../Controllers/roleController.js";
import { cookiesVerifyUser } from "../Middleware/verifyAuthMiddleware.js";
import { uploadIcon } from "../Middleware/imageUploadMiddleware.js";

const router = express.Router();


router.get("/",cookiesVerifyUser, getAllRoles);
router.post("/",cookiesVerifyUser,uploadIcon.single("icon"), createOrUpdateRole);
router.get("/:id",cookiesVerifyUser, getRoleById);
router.put("/:id",cookiesVerifyUser, createOrUpdateRole); // update same as createOrUpdate
router.delete("/:id",cookiesVerifyUser, deleteRole);


export default router;