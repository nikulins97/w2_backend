const User = require("../models/User")

class UserService {

    async getUsers() {
        return await User.findAll({
            attributes: ['id', 'name', 'surname'],
            order: [['id', 'ASC']]
        });
    }

    async getUser(id) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new Error('User not found')
        }
        return user
    }

    async createUser(userData) {
        if(!userData.name || !userData.surname) {
            throw new Error('Missing required fields "name" and "surname"')
        }
        return await User.create(userData)
    }

    async updateUser(id, userData) {
        if(!userData.name || !userData.surname) {
            throw new Error('Missing required fields "name" and "surname"')
        }
        const user = await this.getUser(id)
        return await user.update(userData)
    }

    async deleteUser(id) {
        const user = await this.getUser(id);
        await user.destroy();
        return { message: 'User is deleted'}
    }
}

module.exports = new UserService();