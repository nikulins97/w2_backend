const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

function validateSchema(schema, source = 'body') {
  const validate = ajv.compile(schema);

  return (req, res, next) => {
    const data = req[source];

    if (!validate(data)) {
      const errors = validate.errors.map(err => {
        const field = err.instancePath.replace('/', '') || err.params.missingProperty;
        
      const messages = {
        'required': `Field '${err.params.missingProperty}' is required`,
        'minLength': `Field '${field}' must be at least ${err.params.limit} characters`,
        'maxLength': `Field '${field}' must be no more than ${err.params.limit} characters`,
        'pattern': `Field '${field}' has invalid format`,
        'type': `Field '${field}' must be ${err.params.type}`,
        'enum': `Field '${field}' must be one of: ${err.params.allowedValues?.join(', ') || 'allowed values'}`,
        'additionalProperties': `Unknown field '${err.params.additionalProperty}'`,
      };

        return messages[err.keyword] || `${field}: ${err.message}`;
      });

      return res.status(400).json({
        status: false,
        error: 'Validation failed',
        details: errors,
      });
    }

    next();
  };
}

module.exports = { validateSchema };

