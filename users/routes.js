const router = require("express").Router();
const UserController = require("../controllers/UserController");
const authMiddleware = require("../auth/middleware/authMiddleware")

// GET api/getUsers
router.get("/getUsers", UserController.getUsers);

//GET api/getUser
router.get("/getUser/:id", authMiddleware, UserController.getUser);

// POST api/createUser
router.post("/createUser", authMiddleware, UserController.createUser);

// PUT api/updateUser
router.put("/updateUser/:id", authMiddleware, UserController.updateUser);

// DELETE удалить пользователя
router.delete("/deleteUser/:id", authMiddleware, UserController.deleteUser);

module.exports = router;

