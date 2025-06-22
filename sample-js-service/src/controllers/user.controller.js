const userService = require("../services/user.service");

exports.getUser = async (call, callback) => {
  try {
    const user = await userService.getUserById(call.request.id);
    callback(null, user);
  } catch (err) {
    callback(err);
  }
};
