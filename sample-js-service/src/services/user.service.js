const userRepository = require("../repositories/user.repository");

exports.getUserById = async (id) => {
  // Business logic có thể thêm ở đây
  return userRepository.findById(id);
};
