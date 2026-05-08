const router = require('express').Router();
const prisma = require('../db');
const internalAuth = require('../middleware/internalAuth');
const { validateSchema } = require('../middleware/schemaValidation');
const AdRepository = require('./AdRepository');
const AdService = require('./AdService');
const AdController = require('./AdController');
const { createAdSchema } = require('./schemas');

const repo = new AdRepository(prisma);
const adService = new AdService(repo);
const controller = new AdController(adService);

router.use(internalAuth);

router.post('/', validateSchema(createAdSchema, 'body'), (req, res) =>
  controller.createOrGet(req, res)
);

router.get('/:id', (req, res) => controller.getById(req, res));

module.exports = router;
