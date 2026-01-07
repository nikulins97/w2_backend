const UserModel = require("../models/User");

module.exports = {
  // Получить всех пользователей
  getUsers: async (req, res) => {
    try {
      const users = await UserModel.getUsers();
      return res.status(200).json({
        status: true,
        data: users,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        error: err.message,
      });
    }
  },

};
