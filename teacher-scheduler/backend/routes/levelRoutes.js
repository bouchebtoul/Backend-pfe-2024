const express = require("express");
const router = express.Router();
const levelController = require("../controllers/levelController");

router.post("/", levelController.addLevel);
router.get("/", levelController.getLevels);
router.put("/:id", levelController.updateLevel);
router.delete("/:id", levelController.deleteLevel);

module.exports = router;
