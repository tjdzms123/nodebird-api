const User = require("../models/user");

exports.follow = async (req, res, next) => {
  // req.user.id, req.params.id
  console.log("req.params.id", req.params.id);
  try {
    const user = await User.findOne({
      where: {
        id: req.user.id,
      },
    });
    if (user) {
      await user.addFollowing(parseInt(req.params.id, 10));
      res.send("success");
    } else {
      res.status(404).send("no user");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};
