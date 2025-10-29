// ====== routes/roleRoutes.js ======
import express from "express";
import {
createOrUpdateWhyChoose,
  getWhyChooseList,
  deleteWhyChoose,
  getWhyChooseListForWeb,
} from "../Controllers/whyChooseController.js";
import { cookiesVerifyUser } from "../Middleware/verifyAuthMiddleware.js";
import { uploadIcon } from "../Middleware/imageUploadMiddleware.js";

const router = express.Router();


router.get("/",cookiesVerifyUser, getWhyChooseList);
router.post("/",cookiesVerifyUser,uploadIcon.single("icon"), createOrUpdateWhyChoose);
router.put("/:id",cookiesVerifyUser, createOrUpdateWhyChoose); // update same as createOrUpdate
router.delete("/:id",cookiesVerifyUser, deleteWhyChoose);


export default router;