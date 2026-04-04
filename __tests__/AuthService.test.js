const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthService = require('../auth/AuthService');

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

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

        it('вызывает jwt.sign с правильными аргументами и возвращает токен', () => {
            jwt.sign.mockReturnValue('mocked-access-token');

            const token = service.generateAccessToken(1, 'john', 'EMPLOYEE');

            expect(jwt.sign).toHaveBeenCalledWith(
                { userId: 1, login: 'john', role: 'EMPLOYEE' },
                'test-access-secret',
                { expiresIn: '15m' }
            );
            expect(token).toBe('mocked-access-token');
        });
    });

    // ------------------------------------------------------------------------
    describe('generateRefreshToken', () => {

        it('вызывает jwt.sign с правильными аргументами и возвращает токен', () => {
            jwt.sign.mockReturnValue('mocked-refresh-token');

            const token = service.generateRefreshToken(1, 'john', 'EMPLOYEE');

            expect(jwt.sign).toHaveBeenCalledWith(
                { userId: 1, login: 'john', role: 'EMPLOYEE' },
                'test-refresh-secret',
                { expiresIn: '7d' }
            );
            expect(token).toBe('mocked-refresh-token');
        });
    });

    // ------------------------------------------------------------------------
    describe('register', () => {

        it('хеширует пароль и передаёт его в repo.create', async () => {
            bcrypt.hash.mockResolvedValue('hashed-password');
            mockRepo.create.mockResolvedValue({
                id: 1, login: 'john', name: 'John',
                surname: 'Doe', role: 'EMPLOYEE', password: 'hashed-password',
            });

            await service.register({
                login: 'john', password: 'secret123', name: 'John', surname: 'Doe',
            });

            expect(bcrypt.hash).toHaveBeenCalledWith('secret123', 10);
            expect(mockRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({ password: 'hashed-password' })
            );
        });

        it('возвращает пользователя без поля password', async () => {
            bcrypt.hash.mockResolvedValue('hashed-password');
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

        it('использует роль "EMPLOYEE" по умолчанию, если роль не передана', async () => {
            bcrypt.hash.mockResolvedValue('hashed-password');
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

        it('выбрасывает ошибку "Invalid login", если пользователь не найден', async () => {
            mockRepo.findUnique.mockResolvedValue(null);

            await expect(service.login('john', 'secret123'))
                .rejects.toThrow('Invalid login');
        });

        it('выбрасывает ошибку "Invalid password", если пароль неверный', async () => {
            mockRepo.findUnique.mockResolvedValue({
                id: 1, login: 'john', password: 'hashed-password', role: 'EMPLOYEE',
            });
            bcrypt.compare.mockResolvedValue(false);

            await expect(service.login('john', 'wrong-password'))
                .rejects.toThrow('Invalid password');
        });

        it('возвращает accessToken, refreshToken и user при успешном входе', async () => {
            mockRepo.findUnique.mockResolvedValue({
                id: 1, login: 'john', name: 'John', surname: 'Doe',
                password: 'hashed-password', role: 'EMPLOYEE',
            });
            bcrypt.compare.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue('hashed-refresh-token');
            jwt.sign
                .mockReturnValueOnce('access-token')
                .mockReturnValueOnce('refresh-token');

            const result = await service.login('john', 'secret123');

            expect(result).toEqual({
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
                user: { id: 1, login: 'john', name: 'John', surname: 'Doe', role: 'EMPLOYEE' },
            });
        });

        it('сохраняет хеш refreshToken в репозитории', async () => {
            mockRepo.findUnique.mockResolvedValue({
                id: 1, login: 'john', name: 'John', surname: 'Doe',
                password: 'hashed-password', role: 'EMPLOYEE',
            });
            bcrypt.compare.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue('hashed-refresh-token');
            jwt.sign.mockReturnValue('some-token');

            await service.login('john', 'secret123');

            expect(mockRepo.update).toHaveBeenCalledWith(
                { id: 1 },
                { refreshToken: 'hashed-refresh-token' }
            );
        });
    });

    // ------------------------------------------------------------------------
    describe('logout', () => {

        it('вызывает repo.update с refreshToken: null', async () => {
            mockRepo.update.mockResolvedValue({});

            await service.logout(5);

            expect(mockRepo.update).toHaveBeenCalledWith(
                { id: 5 },
                { refreshToken: null }
            );
        });

        it('возвращает сообщение об успешном выходе', async () => {
            mockRepo.update.mockResolvedValue({});

            const result = await service.logout(5);

            expect(result).toEqual({ message: 'Logout succeed' });
        });
    });

    // ------------------------------------------------------------------------
    describe('refresh', () => {

        it('выбрасывает ошибку, если JWT невалидный или истёкший', async () => {
            jwt.verify.mockImplementation(() => { throw new Error('jwt expired'); });

            await expect(service.refresh('bad-token'))
                .rejects.toThrow('Invalid or expired refresh token');
        });

        it('выбрасывает ошибку, если пользователь не найден в БД', async () => {
            jwt.verify.mockReturnValue({ userId: 99 });
            mockRepo.findUnique.mockResolvedValue(null);

            await expect(service.refresh('valid-jwt'))
                .rejects.toThrow('Invalid or expired refresh token');
        });

        it('выбрасывает ошибку, если refreshToken не сохранён в БД', async () => {
            jwt.verify.mockReturnValue({ userId: 1 });
            mockRepo.findUnique.mockResolvedValue({
                id: 1, login: 'john', role: 'EMPLOYEE', refreshToken: null,
            });

            await expect(service.refresh('valid-jwt'))
                .rejects.toThrow('Invalid or expired refresh token');
        });

        it('выбрасывает ошибку, если токен не совпадает с хешем в БД', async () => {
            jwt.verify.mockReturnValue({ userId: 1 });
            mockRepo.findUnique.mockResolvedValue({
                id: 1, login: 'john', role: 'EMPLOYEE', refreshToken: 'stored-hash',
            });
            bcrypt.compare.mockResolvedValue(false);

            await expect(service.refresh('valid-jwt'))
                .rejects.toThrow('Invalid or expired refresh token');
        });

        it('возвращает новые токены при успешном обновлении', async () => {
            jwt.verify.mockReturnValue({ userId: 1 });
            mockRepo.findUnique.mockResolvedValue({
                id: 1, login: 'john', role: 'EMPLOYEE', refreshToken: 'stored-hash',
            });
            bcrypt.compare.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue('new-hashed-refresh-token');
            jwt.sign
                .mockReturnValueOnce('new-access-token')
                .mockReturnValueOnce('new-refresh-token');

            const result = await service.refresh('valid-jwt');

            expect(result).toEqual({
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token',
            });
        });

        it('сохраняет хеш нового refreshToken в репозитории', async () => {
            jwt.verify.mockReturnValue({ userId: 1 });
            mockRepo.findUnique.mockResolvedValue({
                id: 1, login: 'john', role: 'EMPLOYEE', refreshToken: 'stored-hash',
            });
            bcrypt.compare.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue('new-hashed-refresh-token');
            jwt.sign.mockReturnValue('some-token');

            await service.refresh('valid-jwt');

            expect(mockRepo.update).toHaveBeenCalledWith(
                { id: 1 },
                { refreshToken: 'new-hashed-refresh-token' }
            );
        });
    });
});
