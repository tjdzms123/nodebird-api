const Post = require("../models/post");
const Hashtag = require("../models/hashtag");

exports.afterUploadImage = (req, res) => {
  console.log("레큐.파일", req.file);
  res.json({
    url: `/img/${req.file.filename}`,
  });
};

exports.uploadPost = async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) => {
          return Hashtag.findOrCreate({ // 찾아서 없으면 만들어주는 메서드
            where: {
              title: tag.slice(1).toLowerCase(), // # 제외시키기 위한 메서드
            },
          });
        })
      );
      console.log("결과", result);
      await post.addHashtags(result.map((r) => r[0]));
    }
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
};
