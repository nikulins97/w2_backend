const router = require("express").Router();
const prisma = require("../db");
const UserRepository = require("./UserRepository");
const UserService = require("./UserService");
const UserController = require("./UserController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateSchema } = require("../middleware/schemaValidation");
const { createUserSchema, updateUserSchema } = require("./schemas");

const repo = new UserRepository(prisma);
const service = new UserService(repo);
const controller = new UserController(service);

// GET api/getUsers
router.get("/getUsers", (req, res) => controller.getUsers(req, res));

// GET api/getUser
router.get("/getUser/:id", authMiddleware, (req, res) => controller.getUser(req, res));

// POST api/createUser
router.post("/createUser",
    validateSchema(createUserSchema, 'body'),
    authMiddleware,
    (req, res) => controller.createUser(req, res)
);

// PUT api/updateUser
router.put("/updateUser/:id",
    validateSchema(updateUserSchema, 'body'),
    authMiddleware,
    (req, res) => controller.updateUser(req, res)
);

// DELETE api/deleteUser
router.delete("/deleteUser/:id",
    authMiddleware,
    (req, res) => controller.deleteUser(req, res)
);

module.exports = router;
