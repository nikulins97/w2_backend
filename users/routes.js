const router = require("express").Router();
const UserController = require("../controllers/UserController");

// GET все пользователи
router.get("/getUsers", UserController.getUsers);

//GET пользователь по ID
router.get("/getUser/:id", UserController.getUser);

// POST создать пользователя
router.post("/createUser", UserController.createUser);

// PUT обновить пользователя
router.put("/updateUser/:id", UserController.updateUser);

// DELETE удалить пользователя
router.delete("/deleteUser/:id", UserController.deleteUser);

module.exports = router;

