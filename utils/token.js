const jwt = require('jsonwebtoken');

function signToken(payload, secret, options) {
    return jwt.sign(payload, secret, options);
}

function verifyToken(token, secret) {
    return jwt.verify(token, secret);
}

module.exports = { signToken, verifyToken };