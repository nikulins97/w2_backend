const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

async function hashValue(value) {
    return await bcrypt.hash(value, SALT_ROUNDS);
}

module.exports = { hashValue };
