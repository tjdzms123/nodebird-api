const express = require("express");
const passport = require("passport");
const axios = require("axios");
const { isNotLoggedIn, isLoggedIn } = require("../middlewares");
const { join, login, logout } = require("../controllers/auth");
const router = express.Router();

// POST /auth/join
router.post("/join", isNotLoggedIn, join);
// POST /auth/login
router.post("/login", isNotLoggedIn, login);
// GET /auth/logout
router.get("/logout", isLoggedIn, logout);

// /auth/kakao
router.get("/kakao", passport.authenticate("kakao")); // 카카오톡 로그인 화면으로 redirect

// /auth/kakao -> 카카오 로그인 화면 -> /auth/kakao/callback

// /auth/kakao/callback
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/?loginError=카카오로그인 실패",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

// 카카오 로그아웃
// auth//kakao/logout
router.get("/kakao/logout", isLoggedIn, async (req, res) => {
  try {
    const ACCESS_TOKEN = req.user.accessToken; // res.locals.user에서 req.user로 변경
    const response = await axios.post(
      "https://kapi.kakao.com/v1/user/unlink",
      {},
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );

    // 성공적으로 연결 해제된 경우 로그아웃 처리
    req.logout((err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ message: "Session destruction failed" });
        }
        res.redirect("/");
      });
    });
  } catch (error) {
    console.error("Kakao unlink failed:", error);
    return res.status(500).json({ message: "Kakao unlink failed", error });
  }
});

module.exports = router;
