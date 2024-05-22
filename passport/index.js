const passport = require("passport");
const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const User = require("../models/user");

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, { id: user.id, accessToken: user.accessToken }); // user id만 추출
  });
  //  {세션쿠키: 유저아이디}가 메모리에 저장됨
  passport.deserializeUser(({ id, accessToken }, done) => {
    // 구조 분해하여 id와 accessToken을 가져옴
    User.findOne({ where: { id } })
      .then((user) => {
        if (user) {
          user.accessToken = accessToken; // user 객체에 accessToken을 추가
        }
        done(null, user);
      })
      .catch((err) => done(err));
  });

  local();
  kakao();
};
