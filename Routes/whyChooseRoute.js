// ====== routes/roleRoutes.js ======
import express from "express";
import {
createOrUpdateWhyChoose,
  getWhyChooseList,
  deleteWhyChoose,
  getWhyChooseListForWeb,
} from "../Controllers/whyChooseController.js";
import { verifyUser,cookiesverifyUser } from "../Middleware/verifyAuthMiddleware.js";
import { uploadIcon } from "../Middleware/imageUploadMiddleware.js";

const router = express.Router();


router.get("/",cookiesverifyUser, getWhyChooseList);
router.get("/get", getWhyChooseListForWeb);
router.post("/",cookiesverifyUser,uploadIcon.single("icon"), createOrUpdateWhyChoose);
router.put("/:id",cookiesverifyUser, createOrUpdateWhyChoose); // update same as createOrUpdate
router.delete("/:id",cookiesverifyUser, deleteWhyChoose);


export default router;