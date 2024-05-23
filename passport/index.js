const passport = require("passport");
const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const User = require("../models/user");

module.exports = () => {
  passport.serializeUser((user, done) => {
    // user == exUser
    // user id, 토큰만 추출, { 세션쿠키 : { id, 토큰 } }가 메모리에 저장됨
    done(null, { id: user.id, accessToken: user.accessToken });
  });

  passport.deserializeUser(({ id, accessToken }, done) => {
    // 구조 분해하여 id와 accessToken을 가져옴
    User.findOne({
      where: { id },
      include: [
        {
          model: User,
          attributes: ["id", "nick"],
          as: "Followers",
        },
        {
          model: User,
          attributes: ["id", "nick"],
          as: "Followings",
        },
      ],
    })
      .then((user) => {
        if (user) {
          user.accessToken = accessToken; // user 객체에 accessToken을 추가
          return done(null, user); // req.user
        } else {
          return done(new Error("User not found"), null);
        }
      })
      .catch((err) => done(err));
  });

  local();
  kakao();
};
