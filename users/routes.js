const router = require("express").Router();
const UserController = require("./UserController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateSchema } = require("../middleware/schemaValidation");
const { createUserSchema, updateUserSchema } = require("./schemas");

// GET api/getUsers
router.get("/getUsers", UserController.getUsers);

//GET api/getUser
router.get("/getUser/:id", authMiddleware, UserController.getUser);

// POST api/createUser
router.post("/createUser", 
  validateSchema(createUserSchema, 'body'),
  authMiddleware, 
  UserController.createUser
);

// PUT api/updateUser
router.put("/updateUser/:id", 
  validateSchema(updateUserSchema, 'body'),
  authMiddleware, 
  UserController.updateUser
);

// DELETE api/deleteUser
router.delete("/deleteUser/:id", 
  authMiddleware, 
  UserController.deleteUser
);

module.exports = router;

