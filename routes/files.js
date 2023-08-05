const express = require("express");
const {fileReceive, getFile, Downloads, sendFiles} = require("../controllers/files");
const router = express.Router();

router.route("/files").post(fileReceive);
router.route("/files/:id").get(getFile);
router.route("/files/downloads/:id").get(Downloads);
router.route("/files/send").post(sendFiles);

module.exports = router;