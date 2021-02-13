const HttpError = require("../models/http-error");

const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const Meeting = require("../models/meeting");
const Participant = require("../models/participant");

const addParticipant = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }
  const { name, email } = req.body;

  const createdParticipant = new Participant({
    name,
    email,
    RSVP: "Not Answered",
  });

  try {
    await createdParticipant.save({ getters: true });
  } catch (err) {
    const error = new HttpError(
      // "User already exists",
      err,
      500
    );
    return next(error);
  }
  res
    .status(201)
    .json({ participant: createdParticipant.toObject({ getters: true }) });
};

const getMeetings = async (req, res, next) => {
  const email = req.query.email;
  let participant = await Participant.find({ email });
  let meetings;
  if (participant) {
    meetings = await Promise.all(
      participant[0].meetings.map((meetingId) => Meeting.findById(meetingId))
    );
  }

  res.status(200).json(meetings);
};

exports.getMeetings = getMeetings;
exports.addParticipant = addParticipant;
