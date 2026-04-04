class UserController {
    constructor(userService) {
        this.service = userService;
    };

    async getUsers (req, res) {
        try {
            const users = await this.service.getUsers();
            return res.status(200).json({
                status: true,
                data: users,
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                error: error.message,
            });
        }
    };

    async getUser (req, res) {
        try {
        const user = await this.service.getUser(req.params.id);
        return res.status(200).json({
            status: true,
            data: user,
        });
        } catch (err) {
        return res.status(404).json({
            status: false,
            error: err.message,
        });
        }
    };


    async createUser (req, res) {
        try {
        const user = await this.service.createUser(req.body);
        return res.status(200).json({
            status: true,
            data: user,
        });
        } catch (err) {
        return res.status(400).json({
            status: false,
            error: err.message,
        });
        }
    };

    async updateUser (req, res) {
        try {
        const user = await this.service.updateUser(req.params.id, req.body);
        return res.status(200).json({
            status: true,
            data: user,
        });
        } catch (err) {
        return res.status(400).json({
            status: false,
            error: err.message,
        });
        }
    };

    async deleteUser (req, res) {
        try {
        const user = await this.service.deleteUser(req.params.id);
        return res.status(200).json({
            status: true,
            data: user,
        });
        } catch (err) {
        return res.status(400).json({
            status: false,
            error: err.message,
        });
        }
    };

};

module.exports = UserController;

