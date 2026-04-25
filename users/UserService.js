const { hashValue } = require('../utils/hash');
const logger = require('../utils/logger');

class UserService {
    constructor(userRepository) {
        this.repo = userRepository;
    }

    serializeUser(user) {
        const { password, refreshToken, ...safeUser } = user;
        return safeUser;
    }

    async getUsers() {
        const users = await this.repo.findMany();
        logger.info('Users list retrieved', { count: users.length });
        return users;
    }

    async getUser(id) {
        const user = await this.repo.findUnique({ id: parseInt(id) });
        if (!user) {
            logger.warn('User not found', { userId: id });
            throw new Error('User not found');
        }
        return this.serializeUser(user);
    }

    async createUser(userData) {
        const { login, password, name, surname, role } = userData;

        const hashedPassword = await hashValue(password);

        const user = await this.repo.create({
            login,
            password: hashedPassword,
            name,
            surname,
            role,
        });

        logger.info('User created', { userId: user.id, login: user.login, role: user.role });

        return this.serializeUser(user);
    }

    async updateUser(id, userData) {
        const user = await this.repo.update({ id: parseInt(id) }, userData);
        logger.info('User updated', { userId: id });
        return this.serializeUser(user);
    }

    async deleteUser(id) {
        await this.repo.delete({ id: parseInt(id) });
        logger.info('User deleted', { userId: id });
        return { message: 'User is deleted' };
    }
}

module.exports = UserService;
