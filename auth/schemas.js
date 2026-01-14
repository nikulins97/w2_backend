/**
 * JSON Schemas for auth-endpoints validation
 */


////////////////////////////////////////////////////////////////////////////////////
const loginSchema = {
  type: 'object',
  properties: {
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
  },
  required: ['login', 'password'],
  additionalProperties: false,
};


////////////////////////////////////////////////////////////////////////////////////
const registerSchema = {
  type: 'object',
  properties: {
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
  required: ['login', 'password', 'name', 'surname'],
  additionalProperties: false,
};


////////////////////////////////////////////////////////////////////////////////////
const refreshTokenSchema = {
  type: 'object',
  properties: {
    refreshToken: {
      type: 'string',
      minLength: 1,
    },
  },
  required: ['refreshToken'],
  additionalProperties: false,
};


////////////////////////////////////////////////////////////////////////////////////
module.exports = {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
};

