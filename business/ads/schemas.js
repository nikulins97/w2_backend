const createAdSchema = {
  type: 'object',
  properties: {
    url: {
      type: 'string',
      minLength: 8,
      maxLength: 4096,
      format: 'uri',
    },
    userId: {
      type: 'integer',
    },
    refresh: {
      type: 'boolean',
    },
  },
  required: ['url'],
  additionalProperties: false,
};

module.exports = { createAdSchema };
