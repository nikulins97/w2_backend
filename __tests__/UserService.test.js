const UserService = require('../users/UserService');
const { hashValue } = require('../utils/hash');

jest.mock('../utils/hash', () => ({
    hashValue: jest.fn(),
}));

const mockRepo = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

let service;

beforeEach(() => {
    service = new UserService(mockRepo);
    jest.clearAllMocks();
});

describe('UserService', () => {
    
    describe('serializeUser', () => {
        it('should serialize user without password and refreshToken', () => {
            const user = {
                id: 1,
                name: 'John',
                surname: 'Doe',
                login: 'john',
                password: 'password',
                refreshToken: 'refreshToken',
            };
            const serializedUser = service.serializeUser(user);
            expect(serializedUser).not.toHaveProperty('password');
            expect(serializedUser).not.toHaveProperty('refreshToken');
            expect(serializedUser).toEqual({
                id: 1,
                name: 'John',
                surname: 'Doe',
                login: 'john',
            });
        });
    });

    describe('getUsers', () => {
        it('should return all users', async () => {
            const expectedUsers = [
                {
                    id: 1,
                    name: 'John',
                    surname: 'Doe',
                    login: 'john',
                    role: 'EMPLOYEE',
                },
                {
                    id: 2,
                    name: 'Jane',
                    surname: 'Doe',
                    login: 'jane',
                    role: 'ADMIN',
                },
            ];
            mockRepo.findMany.mockResolvedValue(expectedUsers);
            const users = await service.getUsers();
            
            expect(mockRepo.findMany).toHaveBeenCalled();
            expect(users).toEqual(expectedUsers);

        });
    });

    describe('getUser', () => {
        it('should return user by id', async () => {
            const expectedUser = {
                id: 1,
                name: 'John',
                surname: 'Doe',
                login: 'john',
                role: 'EMPLOYEE',
            };
            mockRepo.findUnique.mockResolvedValue(expectedUser);
            const user = await service.getUser(1);
            expect(mockRepo.findUnique).toHaveBeenCalledWith({ id: 1 });
            expect(user).toEqual(expectedUser);
        });

        it('should throw an error if user not found', async () => {
            mockRepo.findUnique.mockResolvedValue(null);
            await expect(service.getUser(1)).rejects.toThrow('User not found');
        });
    });

    describe('createUser', () => {
        it('should create a new user', async () => {
            const newUser = {
                login: 'john',
                password: 'password',
                name: 'John',
                surname: 'Doe',
                role: 'EMPLOYEE',
            };
            const createdUserFromDb = {
                id: 1,
                name: 'John',
                surname: 'Doe',
                login: 'john',
                role: 'EMPLOYEE',
                password: 'hashed-password',
                refreshToken: null,
            };
            const expectedUser = {
                id: 1,
                name: 'John',
                surname: 'Doe',
                login: 'john',
                role: 'EMPLOYEE',
            };
            hashValue.mockResolvedValue('hashed-password');
            mockRepo.create.mockResolvedValue(createdUserFromDb);
            const user = await service.createUser(newUser);
            expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
                password: 'hashed-password',
            }));
            expect(user).not.toHaveProperty('password');
            expect(user).toEqual(expectedUser);
        });
    });

    describe('updateUser', () => {
        it('should update a user', async () => {
            const updatedUser = {
                id: 1,
                name: 'John',
                surname: 'Doe',
                role: 'EMPLOYEE',
            };
            const updatedUserFromDb = {
                id: 1,
                name: 'John',
                surname: 'Doe',
                login: 'john',
                role: 'EMPLOYEE',
                password: 'hashed-password',
                refreshToken: null,
            };
            const expectedUser = {
                id: 1,
                name: 'John',
                surname: 'Doe',
                login: 'john',
                role: 'EMPLOYEE',
            };
            mockRepo.update.mockResolvedValue(updatedUserFromDb);
            const user = await service.updateUser(1, updatedUser);
            expect(mockRepo.update).toHaveBeenCalledWith({ id: 1 }, updatedUser);
            expect(user).toEqual(expectedUser);
        });
    });

    describe('deleteUser', () => {
        it('should delete a user', async () => {
            mockRepo.delete.mockResolvedValue({});
            const result = await service.deleteUser(1);
            expect(mockRepo.delete).toHaveBeenCalledWith({ id: 1 });
            expect(result).toEqual({ message: 'User is deleted' });
        });
    });
});