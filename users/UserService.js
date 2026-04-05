const { hashValue } = require('../utils/hash');

class UserService {
    constructor(userRepository) {
        this.repo = userRepository;
    }

    serializeUser(user) {
        const { password, refreshToken, ...safeUser } = user;
        return safeUser;
    }

    async getUsers() {
        return await this.repo.findMany();
    }

    async getUser(id) {
        const user = await this.repo.findUnique({ id: parseInt(id) });
        if (!user) {
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

        return this.serializeUser(user);
    }

    async updateUser(id, userData) {
        const user = await this.repo.update({ id: parseInt(id) }, userData);
        return this.serializeUser(user);
    }

    async deleteUser(id) {
        await this.repo.delete({ id: parseInt(id) });
        return { message: 'User is deleted' };
    }
}

module.exports = UserService;
