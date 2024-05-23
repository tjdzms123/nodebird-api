const express = require("express");
const router = express.Router();
const { isNotLoggedIn, isLoggedIn } = require("../middlewares");

router.post("/img", isLoggedIn, afterUploadImage);
router.post("/", isLoggedIn, uploadPost);

module.exports = router;