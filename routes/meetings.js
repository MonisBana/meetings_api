const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const meetingControllers = require("../controllers/meetings");

router.post("/", meetingControllers.createMeeting);
router.post("/addParticipant", meetingControllers.addParticipant);
router.get("/", meetingControllers.getMeeting);
router.get("/getmeetingByTime", meetingControllers.getMeetingByTime);

module.exports = router;
