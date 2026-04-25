const { hashValue, compareValues } = require("../utils/hash");
const { signToken, verifyToken } = require("../utils/token");
const logger = require("../utils/logger");
require("dotenv").config();


class AuthService {
    constructor(userRepository) {
        this.repo = userRepository;
    }

    generateAccessToken(userId, login, role) {
        return signToken(
            { userId, login, role },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );
    }

    generateRefreshToken(userId, login, role) {
        return signToken(
            { userId, login, role },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
        );
    }

    async register(userData) {
        const { login, password, name, surname, role = "EMPLOYEE" } = userData;

        const hashedPassword = await hashValue(password);

        const user = await this.repo.create({
            login,
            password: hashedPassword,
            name,
            surname,
            role,
        });

        logger.info('User registered', { userId: user.id, login: user.login, role: user.role });

        return {
            id: user.id,
            login: user.login,
            name: user.name,
            surname: user.surname,
            role: user.role,
        };
    }

    async login(login, password) {
        logger.info('Login attempt', { login });

        const user = await this.repo.findUnique({ login });

        if (!user) {
            logger.warn('Login failed: user not found', { login });
            throw new Error("Invalid login");
        }

        const isPasswordValid = await compareValues(password, user.password);

        if (!isPasswordValid) {
            logger.warn('Login failed: invalid password', { login });
            throw new Error("Invalid password");
        }

        const accessToken = this.generateAccessToken(user.id, user.login, user.role);
        const refreshToken = this.generateRefreshToken(user.id, user.login, user.role);

        const hashedRefreshToken = await hashValue(refreshToken);

        await this.repo.update({ id: user.id }, { refreshToken: hashedRefreshToken });

        logger.info('Login successful', { userId: user.id, login: user.login });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                login: user.login,
                name: user.name,
                surname: user.surname,
                role: user.role,
            },
        };
    }   

    async logout(userId) {
        await this.repo.update({ id: parseInt(userId) }, { refreshToken: null });
        logger.info('User logged out', { userId });
        return { message: "Logout succeed" };
    }

    async refresh(refreshToken) {
        try {
            const decoded = await verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);

            const user = await this.repo.findUnique({ id: decoded.userId });

            if (!user || !user.refreshToken) {
                logger.warn('Token refresh failed: invalid or missing refresh token', { userId: decoded.userId });
                throw new Error("Invalid refresh token");
            }

            const isTokenValid = await compareValues(refreshToken, user.refreshToken);

            if (!isTokenValid) {
                logger.warn('Token refresh failed: token mismatch', { userId: decoded.userId });
                throw new Error("Invalid refresh token");
            }

            const newAccessToken = this.generateAccessToken(user.id, user.login, user.role);
            const newRefreshToken = this.generateRefreshToken(user.id, user.login, user.role);

            const hashedRefreshToken = await hashValue(newRefreshToken);
            await this.repo.update({ id: user.id }, { refreshToken: hashedRefreshToken });

            logger.info('Token refreshed', { userId: user.id });

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            if (!error.message.includes('Invalid refresh token')) {
                logger.warn('Token refresh failed', { error: error.message });
            }
            throw new Error("Invalid or expired refresh token");
        }
    }
}


module.exports = AuthService;
