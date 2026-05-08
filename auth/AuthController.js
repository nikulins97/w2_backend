const { setRefreshTokenToCookie } = require('./cookieHelpers');

class AuthController {
    constructor(authService) {
        this.service = authService;
    }

    async login(req, res) {
        try {
            const { login, password } = req.body;

            const result = await this.service.login(login, password);

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
    }

    async refresh(req, res) {
        try {
            const { refreshToken } = req.cookies;

            const result = await this.service.refresh(refreshToken);

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
    }

    async logout(req, res) {
        try {
            const userId = req.user.userId;

            await this.service.logout(userId);

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
    }

    async register(req, res) {
        try {
            const { login, password, name, surname, role } = req.body;

            const user = await this.service.register({ login, password, name, surname, role });

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
    }
}

module.exports = AuthController;
