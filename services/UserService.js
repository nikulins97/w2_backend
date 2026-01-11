const prisma = require("../db")

class UserService {

    async getUsers() {
        return await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                surname: true
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
        return user
    }

    async createUser(userData) {
        if(!userData.name || !userData.surname) {
            throw new Error('Missing required fields "name" and "surname"')
        }
        return await prisma.user.create({
            data: userData
        })
    }

    async updateUser(id, userData) {
        if(!userData.name || !userData.surname) {
            throw new Error('Missing required fields "name" and "surname"')
        }
        
        return await prisma.user.update({
            where: { id: parseInt(id)},
            data: userData
        })
    }

    async deleteUser(id) {
        await prisma.user.delete({
            where: { id: parseInt(id)}
        });
        return { message: 'User is deleted'}
    }
}

module.exports = new UserService();