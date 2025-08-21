// ====== routes/roleRoutes.js ======
import express from "express";
import {
createOrUpdateRole,
getRoleById,
getAllRoles,
getAllRolesforWeb,
deleteRole
} from "../Controllers/roleController.js";
import { verifyUser } from "../Middleware/verifyAuthMiddleware.js";
import { uploadIcon } from "../Middleware/imageUploadMiddleware.js";

const router = express.Router();


router.get("/",verifyUser, getAllRoles);
router.get("/get", getAllRolesforWeb);
router.post("/",verifyUser,uploadIcon.single("icon"), createOrUpdateRole);
router.get("/:id",verifyUser, getRoleById);
router.put("/:id",verifyUser, createOrUpdateRole); // update same as createOrUpdate
router.delete("/:id",verifyUser, deleteRole);


export default router;