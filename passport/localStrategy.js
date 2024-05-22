const passport = require("passport");
const User = require("../models/user");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcrypt');

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email", // === req.body.email
        passwordField: "password", // === req.body.password
        passReqToCallback: false,
      },
      async (email, password, done) => {
        // done(서버실패, 성공유저, 로직실패)
        try {
          // 입력한 로그인 정보가 있는지 확인하는 로직
          const exUser = await User.findOne({ where: { email } });
          if (exUser) {
            const result = await bcrypt.compare(password, exUser.password);
            if (result) {
              done(null, exUser);
            } else {
              done(null, false, { message: "비밀번호가 일치하지 않습니다." });
            }
          } else {
            done(null, false, { message: "가입되지 않은 회원입니다." });
          }
        } catch (error) {
          console.error(error);
        }
      }
    )
  );
};
