class UserRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }

    async findMany() {
        return await this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                surname: true,
                login: true,
                role: true,
            },
            orderBy: {
                id: 'asc',
            },
        });
    }

    async findUnique(where) {
        return await this.prisma.user.findUnique({ where });
    }

    async create(data) {
        return await this.prisma.user.create({ data });
    }

    async update(where, data) {
        return await this.prisma.user.update({ where, data });
    }

    async delete(where) {
        return await this.prisma.user.delete({ where });
    }
}

module.exports = UserRepository;
