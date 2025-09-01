// ====== routes/roleRoutes.js ======
import express from "express";
import {
createOrUpdateRole,
getRoleById,
getAllRoles,
getAllRolesforWeb,
deleteRole
} from "../Controllers/roleController.js";
import { verifyUser,cookiesverifyUser } from "../Middleware/verifyAuthMiddleware.js";
import { uploadIcon } from "../Middleware/imageUploadMiddleware.js";

const router = express.Router();


router.get("/",cookiesverifyUser, getAllRoles);
router.get("/get", getAllRolesforWeb);
router.post("/",cookiesverifyUser,uploadIcon.single("icon"), createOrUpdateRole);
router.get("/:id",cookiesverifyUser, getRoleById);
router.put("/:id",cookiesverifyUser, createOrUpdateRole); // update same as createOrUpdate
router.delete("/:id",cookiesverifyUser, deleteRole);


export default router;