const jwt = require('jsonwebtoken');

async function signToken(payload, secret, options) {
    return jwt.sign(payload, secret, options);
}

async function verifyToken(token, secret) {
    return jwt.verify(token, secret);
}

module.exports = { signToken, verifyToken };