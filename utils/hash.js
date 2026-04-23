const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

async function hashValue(value) {
    return await bcrypt.hash(value, SALT_ROUNDS);
};

async function compareValues(value, hashedValue) {
    return await bcrypt.compare(value, hashedValue);
};

module.exports = { hashValue, compareValues };
