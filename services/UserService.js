const prisma = require("../db")

class UserService {

    // Removes pass and token from res
    serializeUser(user) {
        const { password, refreshToken, ...safeUser } = user;
        return safeUser;
    }

    async getUsers() {
        return await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                surname: true,
                login: true,
                role: true,
            },
            orderBy: {
                id: 'asc'
            }
        });
    }

    async getUser(id) {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id)}
        });
        if (!user) {
            throw new Error('User not found')
        }
        return this.serializeUser(user);
    }

    async createUser(userData) {
        if(!userData.name || !userData.surname) {
            throw new Error('Missing required fields "name" and "surname"')
        }
        const user = await prisma.user.create({
            data: userData
        });
        return this.serializeUser(user);
    }

    async updateUser(id, userData) {
        if(!userData.name || !userData.surname) {
            throw new Error('Missing required fields "name" and "surname"')
        }
        
        const user = await prisma.user.update({
            where: { id: parseInt(id)},
            data: userData
        });
        return this.serializeUser(user);
    }

    async deleteUser(id) {
        await prisma.user.delete({
            where: { id: parseInt(id)}
        });
        return { message: 'User is deleted'}
    }
}

module.exports = new UserService();