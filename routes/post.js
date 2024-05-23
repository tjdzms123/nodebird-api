const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { isNotLoggedIn, isLoggedIn } = require("../middlewares");
const { afterUploadImage, uploadPost } = require("../controllers/post");

const router = express.Router();

try {
  fs.readdirSync("uploads");
} catch (error) {
  console.error();
  fs.mkdirSync("uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      console.log("파일", file);
      // 확장자 뽑기
      const ext = path.extname(file.originalname);
      // 파일 이름 분리 후 날짜 붙이기 => 중복을 피하기 위함
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/img", isLoggedIn, upload.single("img"), afterUploadImage);

const upload2 = multer({});

router.post("/", isLoggedIn, upload2.none(), uploadPost);

module.exports = router;
