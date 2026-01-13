const UserService = require('./UserService')

module.exports = {
  
  getUsers: async (req, res) => {
    try {
      const users = await UserService.getUsers();
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

  getUser: async (req, res) => {
    try {
      const user = await UserService.getUser(req.params.id);
      return res.status(200).json({
        status: true,
        data: user,
      });
    } catch (err) {
      return res.status(404).json({
        status: false,
        error: err.message,
      });
    }
  },


  createUser: async (req, res) => {
    try {
      const user = await UserService.createUser(req.body);
      return res.status(200).json({
        status: true,
        data: user,
      });
    } catch (err) {
      return res.status(400).json({
        status: false,
        error: err.message,
      });
    }
  },

  updateUser: async (req, res) => {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      return res.status(200).json({
        status: true,
        data: user,
      });
    } catch (err) {
      return res.status(400).json({
        status: false,
        error: err.message,
      });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const user = await UserService.deleteUser(req.params.id);
      return res.status(200).json({
        status: true,
        data: user,
      });
    } catch (err) {
      return res.status(400).json({
        status: false,
        error: err.message,
      });
    }
  },

};

