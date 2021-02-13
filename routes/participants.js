const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const participantControllers = require("../controllers/participants");

router.post(
  "/",
  [check("name").not().isEmpty(), check("email").normalizeEmail().isEmail()],
  participantControllers.addParticipant
);
router.get("/", participantControllers.getMeetings);

module.exports = router;
