const AuthService = require('../auth/AuthService');
const { hashValue, compareValues } = require('../utils/hash');
const { signToken, verifyToken } = require('../utils/token');

jest.mock('../utils/hash', () => ({
    hashValue: jest.fn(),
    compareValues: jest.fn(),
}));
jest.mock('../utils/token', () => ({
    signToken: jest.fn(),
    verifyToken: jest.fn(),
}));

// Env variables required by AuthService
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.ACCESS_TOKEN_EXPIRY = '15m';
process.env.REFRESH_TOKEN_EXPIRY = '7d';

// --------------------------------------------------------------------------
// Mock repository — replaces real Prisma calls
// --------------------------------------------------------------------------
const mockRepo = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
};

let service;

beforeEach(() => {
    service = new AuthService(mockRepo);
    jest.clearAllMocks();
});

// ==========================================================================
describe('AuthService', () => {

    // ------------------------------------------------------------------------
    describe('generateAccessToken', () => {

        it('calls jwt.sign with correct arguments and returns the token', () => {
            signToken.mockReturnValue('mocked-access-token');

            const token = service.generateAccessToken(1, 'john', 'EMPLOYEE');

            expect(signToken).toHaveBeenCalledWith(
                { userId: 1, login: 'john', role: 'EMPLOYEE' },
                'test-access-secret',
                { expiresIn: '15m' }
            );
            expect(token).toBe('mocked-access-token');
        });
    });

    // ------------------------------------------------------------------------
    describe('generateRefreshToken', () => {

        it('calls jwt.sign with correct arguments and returns the token', () => {
            signToken.mockReturnValue('mocked-refresh-token');

            const token = service.generateRefreshToken(1, 'john', 'EMPLOYEE');

            expect(signToken).toHaveBeenCalledWith(
                { userId: 1, login: 'john', role: 'EMPLOYEE' },
                'test-refresh-secret',
                { expiresIn: '7d' }
            );
            expect(token).toBe('mocked-refresh-token');
        });
    });

    // ------------------------------------------------------------------------
    describe('register', () => {

        it('hashes the password and passes it to repo.create', async () => {
            hashValue.mockResolvedValue('hashed-password');
            mockRepo.create.mockResolvedValue({
                id: 1, login: 'john', name: 'John',
                surname: 'Doe', role: 'EMPLOYEE', password: 'hashed-password',
            });

            await service.register({
                login: 'john', password: 'secret123', name: 'John', surname: 'Doe',
            });

            expect(hashValue).toHaveBeenCalledWith('secret123');
            expect(mockRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({ password: 'hashed-password' })
            );
        });

        it('returns the user without the password field', async () => {
            hashValue.mockResolvedValue('hashed-password');
            mockRepo.create.mockResolvedValue({
                id: 1, login: 'john', name: 'John',
                surname: 'Doe', role: 'EMPLOYEE', password: 'hashed-password',
            });

            const result = await service.register({
                login: 'john', password: 'secret123', name: 'John', surname: 'Doe',
            });

            expect(result).not.toHaveProperty('password');
            expect(result).toEqual({ id: 1, login: 'john', name: 'John', surname: 'Doe', role: 'EMPLOYEE' });
        });

        it('defaults to the "EMPLOYEE" role when no role is provided', async () => {
            hashValue.mockResolvedValue('hashed-password');
            mockRepo.create.mockResolvedValue({
                id: 1, login: 'john', name: 'John',
                surname: 'Doe', role: 'EMPLOYEE', password: 'hashed-password',
            });

            await service.register({
                login: 'john', password: 'secret123', name: 'John', surname: 'Doe',
            });

            expect(mockRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({ role: 'EMPLOYEE' })
            );
        });
    });

    // ------------------------------------------------------------------------
    describe('login', () => {

        it('throws "Invalid login" when the user is not found', async () => {
            mockRepo.findUnique.mockResolvedValue(null);

            await expect(service.login('john', 'secret123'))
                .rejects.toThrow('Invalid login');
        });

        it('throws "Invalid password" when the password is incorrect', async () => {
            mockRepo.findUnique.mockResolvedValue({
                id: 1, login: 'john', password: 'hashed-password', role: 'EMPLOYEE',
            });
            compareValues.mockResolvedValue(false);

            await expect(service.login('john', 'wrong-password'))
                .rejects.toThrow('Invalid password');
        });

        it('returns accessToken, refreshToken and user on successful login', async () => {
            mockRepo.findUnique.mockResolvedValue({
                id: 1, login: 'john', name: 'John', surname: 'Doe',
                password: 'hashed-password', role: 'EMPLOYEE',
            });
            compareValues.mockResolvedValue(true);
            hashValue.mockResolvedValue('hashed-refresh-token');
            signToken
                .mockReturnValueOnce('access-token')
                .mockReturnValueOnce('refresh-token');

            const result = await service.login('john', 'secret123');

            expect(result).toEqual({
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
                user: { id: 1, login: 'john', name: 'John', surname: 'Doe', role: 'EMPLOYEE' },
            });
        });

        it('stores the refreshToken hash in the repository', async () => {
            mockRepo.findUnique.mockResolvedValue({
                id: 1, login: 'john', name: 'John', surname: 'Doe',
                password: 'hashed-password', role: 'EMPLOYEE',
            });
            compareValues.mockResolvedValue(true);
            hashValue.mockResolvedValue('hashed-refresh-token');
            signToken.mockReturnValue('some-token');

            await service.login('john', 'secret123');

            expect(mockRepo.update).toHaveBeenCalledWith(
                { id: 1 },
                { refreshToken: 'hashed-refresh-token' }
            );
        });
    });

    // ------------------------------------------------------------------------
    describe('logout', () => {

        it('calls repo.update with refreshToken: null', async () => {
            mockRepo.update.mockResolvedValue({});

            await service.logout(5);

            expect(mockRepo.update).toHaveBeenCalledWith(
                { id: 5 },
                { refreshToken: null }
            );
        });

        it('returns a successful logout message', async () => {
            mockRepo.update.mockResolvedValue({});

            const result = await service.logout(5);

            expect(result).toEqual({ message: 'Logout succeed' });
        });
    });

    // ------------------------------------------------------------------------
    describe('refresh', () => {

        it('throws an error when the JWT is invalid or expired', async () => {
            verifyToken.mockImplementation(() => { throw new Error('jwt expired'); });

            await expect(service.refresh('bad-token'))
                .rejects.toThrow('Invalid or expired refresh token');
        });

        it('throws an error when the user is not found in the database', async () => {
            verifyToken.mockReturnValue({ userId: 99 });
            mockRepo.findUnique.mockResolvedValue(null);

            await expect(service.refresh('valid-jwt'))
                .rejects.toThrow('Invalid or expired refresh token');
        });

        it('throws an error when no refreshToken is stored in the database', async () => {
            verifyToken.mockReturnValue({ userId: 1 });
            mockRepo.findUnique.mockResolvedValue({
                id: 1, login: 'john', role: 'EMPLOYEE', refreshToken: null,
            });

            await expect(service.refresh('valid-jwt'))
                .rejects.toThrow('Invalid or expired refresh token');
        });

        it('throws an error when the token does not match the stored hash', async () => {
            verifyToken.mockReturnValue({ userId: 1 });
            mockRepo.findUnique.mockResolvedValue({
                id: 1, login: 'john', role: 'EMPLOYEE', refreshToken: 'stored-hash',
            });
            compareValues.mockResolvedValue(false);

            await expect(service.refresh('valid-jwt'))
                .rejects.toThrow('Invalid or expired refresh token');
        });

        it('returns new tokens on successful refresh', async () => {
            verifyToken.mockReturnValue({ userId: 1 });
            mockRepo.findUnique.mockResolvedValue({
                id: 1, login: 'john', role: 'EMPLOYEE', refreshToken: 'stored-hash',
            });
            compareValues.mockResolvedValue(true);
            hashValue.mockResolvedValue('new-hashed-refresh-token');
            signToken
                .mockReturnValueOnce('new-access-token')
                .mockReturnValueOnce('new-refresh-token');

            const result = await service.refresh('valid-jwt');

            expect(result).toEqual({
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token',
            });
        });

        it('stores the new refreshToken hash in the repository', async () => {
            verifyToken.mockReturnValue({ userId: 1 });
            mockRepo.findUnique.mockResolvedValue({
                id: 1, login: 'john', role: 'EMPLOYEE', refreshToken: 'stored-hash',
            });
            compareValues.mockResolvedValue(true);
            hashValue.mockResolvedValue('new-hashed-refresh-token');
            signToken.mockReturnValue('some-token');

            await service.refresh('valid-jwt');

            expect(mockRepo.update).toHaveBeenCalledWith(
                { id: 1 },
                { refreshToken: 'new-hashed-refresh-token' }
            );
        });
    });
});
