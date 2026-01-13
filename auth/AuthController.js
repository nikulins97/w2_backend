const AuthService = require('./AuthService');

module.exports = {
  
    // POST /login
  login: async (req, res) => {
    try {
      const { login, password } = req.body;

      if (!login || !password) {
        return res.status(400).json({
          status: false,
          error: 'Login and password a mandatory fields',
        });
      }

      const result = await AuthService.login(login, password);

      // Set refreshToken into httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true в production (HTTPS)
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

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

  // POST /refresh
  refresh: async (req, res) => {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return res.status(401).json({
          status: false,
          error: 'Refresh token not found',
        });
      }

      const result = await AuthService.refresh(refreshToken);

      // Uodate refreshToken in cookies
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

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

  // POST /logout
  logout: async (req, res) => {
    try {
      const userId = req.user.userId; // Из middleware

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

  // POST /register
  register: async (req, res) => {
    try {
      const { login, password, name, surname, role } = req.body;

      if (!login || !password || !name || !surname) {
        return res.status(400).json({
          status: false,
          error: 'Missing required fields: login, password, name, surname',
        });
      }

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