const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
const passport = require("passport");
const { sequelize } = require("./models");
// process.env.COOKIE_SECRET 없음
dotenv.config();
// process.env.COOKIE_SECRET 있음
const pageRouter = require("./routes/page");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");
const passportConfig = require("./passport");

const app = express();
passportConfig();
app.set("port", process.env.PORT || 8001);
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "uploads")));
app.use(express.json()); // req.body를 ajax json 요청으로부터 받음
app.use(express.urlencoded({ extended: false })); // req.body 폼으로부터 받음
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);
// passport는 반드시 express.session 밑에다가!
app.use(passport.initialize());
// passport를 연결하면 아래 친구들이 생긴다
// req.user, req.login, req.isAuthenticate, req.logout
app.use(passport.session()); // connect.sid 라는 이름으로 세션 쿠키가 브라우저로 전송

app.use("/", pageRouter);
app.use("/auth", authRouter);
app.use("/post", postRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 없는 페이지 입니다.`);
  error.status = 404;
  next(error);
});
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중~");
});
