const UserService = require('../users/UserService');

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
});