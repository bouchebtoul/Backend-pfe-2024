const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/moduleController");

router.post("/", moduleController.addModule);
router.get("/", moduleController.getModules);
router.put("/:id", moduleController.updateModule);
router.delete("/:id", moduleController.deleteModule);

module.exports = router;
