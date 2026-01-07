const router = require("express").Router();
const UserController = require("../controllers/UserController");

// GET все пользователи
router.get("/", UserController.getUsers);

// GET пользователь по ID
// router.get("/:id", UserController.getUser);

// // POST создать пользователя
// router.post("/", UserController.createUser);

// // PUT обновить пользователя
// router.put("/:id", UserController.updateUser);

// // DELETE удалить пользователя
// router.delete("/:id", UserController.deleteUser);

module.exports = router;

