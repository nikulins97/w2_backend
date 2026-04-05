const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { hashValue } = require("../utils/hash");
require("dotenv").config();


class AuthService {
    constructor(userRepository) {
        this.repo = userRepository;
    }

    generateAccessToken(userId, login, role) {
        return jwt.sign(
            { userId, login, role },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );
    }

    generateRefreshToken(userId, login, role) {
        return jwt.sign(
            { userId, login, role },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
        );
    }

    async hashToken(token) {
        return await hashValue(token);
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

        return {
            id: user.id,
            login: user.login,
            name: user.name,
            surname: user.surname,
            role: user.role,
        };
    }

    async login(login, password) {
        const user = await this.repo.findUnique({ login });

        if (!user) {
            throw new Error("Invalid login");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new Error("Invalid password");
        }

        const accessToken = this.generateAccessToken(user.id, user.login, user.role);
        const refreshToken = this.generateRefreshToken(user.id, user.login, user.role);

        const hashedRefreshToken = await this.hashToken(refreshToken);

        await this.repo.update({ id: user.id }, { refreshToken: hashedRefreshToken });

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
        return { message: "Logout succeed" };
    }

    async refresh(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            const user = await this.repo.findUnique({ id: decoded.userId });

            if (!user || !user.refreshToken) {
                throw new Error("Invalid refresh token");
            }

            const isTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);

            if (!isTokenValid) {
                throw new Error("Invalid refresh token");
            }

            const newAccessToken = this.generateAccessToken(user.id, user.login, user.role);
            const newRefreshToken = this.generateRefreshToken(user.id, user.login, user.role);

            const hashedRefreshToken = await this.hashToken(newRefreshToken);
            await this.repo.update({ id: user.id }, { refreshToken: hashedRefreshToken });

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            throw new Error("Invalid or expired refresh token");
        }
    }
}


module.exports = AuthService;
