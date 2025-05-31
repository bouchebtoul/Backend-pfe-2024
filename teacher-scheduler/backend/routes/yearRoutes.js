const express = require("express");
const router = express.Router();
const yearController = require("../controllers/yearController");

router.post("/", yearController.addYear);
router.get("/", yearController.getYears);
router.put("/:id", yearController.updateYear);
router.delete("/:id", yearController.deleteYear);

module.exports = router;
