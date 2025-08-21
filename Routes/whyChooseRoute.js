// ====== routes/roleRoutes.js ======
import express from "express";
import {
createOrUpdateWhyChoose,
  getWhyChooseList,
  deleteWhyChoose,
  getWhyChooseListForWeb,
} from "../Controllers/whyChooseController.js";
import { verifyUser } from "../Middleware/verifyAuthMiddleware.js";
import { uploadIcon } from "../Middleware/imageUploadMiddleware.js";

const router = express.Router();


router.get("/",verifyUser, getWhyChooseList);
router.get("/get", getWhyChooseListForWeb);
router.post("/",verifyUser,uploadIcon.single("icon"), createOrUpdateWhyChoose);
router.put("/:id",verifyUser, createOrUpdateWhyChoose); // update same as createOrUpdate
router.delete("/:id",verifyUser, deleteWhyChoose);


export default router;