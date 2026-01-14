const AuthService = require('./AuthService');
const { setRefreshTokenToCookie } = require('./helpers');


module.exports = {
  
  ////////////////////////////////////////////////////////////////////////////////////
  login: async (req, res) => {
    try {
      const { login, password } = req.body;

      const result = await AuthService.login(login, password);

      setRefreshTokenToCookie(res, result.refreshToken);

      return res.status(200).json({
        status: true,
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    } catch (error) {
      return res.status(401).json({
        status: false,
        error: error.message,
      });
    }
  },

  ////////////////////////////////////////////////////////////////////////////////////
  refresh: async (req, res) => {
    try {
      const { refreshToken } = req.cookies;

      const result = await AuthService.refresh(refreshToken);

      // Update refreshToken in cookies
      setRefreshTokenToCookie(res, result.refreshToken);

      return res.status(200).json({
        status: true,
        data: {
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      return res.status(401).json({
        status: false,
        error: error.message,
      });
    }
  },

  ////////////////////////////////////////////////////////////////////////////////////
  logout: async (req, res) => {
    try {
      const userId = req.user.userId;

      await AuthService.logout(userId);

      // Очистить cookie
      res.clearCookie('refreshToken');

      return res.status(200).json({
        status: true,
        message: 'Logout succeed',
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        error: error.message,
      });
    }
  },

  ////////////////////////////////////////////////////////////////////////////////////
  register: async (req, res) => {
    try {
      const { login, password, name, surname, role } = req.body;

      const user = await AuthService.register({ login, password, name, surname, role });

      return res.status(201).json({
        status: true,
        data: user,
      });
    } catch (error) {
      return res.status(400).json({
        status: false,
        error: error.message,
      });
    }
  },
};