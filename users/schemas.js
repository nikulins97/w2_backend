/**
 * JSON Schemas for users-endpoints validation
 */


////////////////////////////////////////////////////////////////////////////////////
const createUserSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    surname: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    login: {
      type: 'string',
      minLength: 3,
      maxLength: 50,
      pattern: '^[a-zA-Z0-9_@.-]+$',
    },
    password: {
      type: 'string',
      minLength: 6,
      maxLength: 100,
    },
    role: {
      type: 'string',
      enum: ['employee', 'admin'],
    },
  },
  required: ['name', 'surname', 'login', 'password', 'role'],
  additionalProperties: false,
};


////////////////////////////////////////////////////////////////////////////////////
const updateUserSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    surname: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    role: {
      type: 'string',
      enum: ['employee', 'admin'],
    },
  },
  required: ['name', 'surname'],
  additionalProperties: false,
};


////////////////////////////////////////////////////////////////////////////////////
module.exports = {
  createUserSchema,
  updateUserSchema,
};

