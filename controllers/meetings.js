const HttpError = require("../models/http-error");
const moment = require("moment");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const Meeting = require("../models/meeting");
const Participant = require("../models/participant");

const createMeeting = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }
  let { title, start_time, end_time } = req.body;
  start_time = moment(start_time).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  end_time = moment(end_time).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  const createdMeeting = new Meeting({
    title,
    start_time,
    end_time,
    participants: [],
  });
  try {
    await createdMeeting.save();
  } catch (err) {
    const error = new HttpError(
      "Failed to create meeting,please try again later.",
      500
    );
    return next(error);
  }
  res.status(201).json({ Meeting: createdMeeting.toObject({ getter: true }) });
};

const addParticipant = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }
  const meetingId = req.query.meetingId;
  const participantId = req.query.participantId;

  let meeting;
  let participant;
  let meetingIds;
  let meetingList;
  try {
    participant = await Participant.findById(participantId);
    meetingIds = participant.meetings;
  } catch (err) {
    const error = new HttpError(
      "Particpant not found,please try again later.",
      404
    );
    return next(error);
  }

  try {
    meeting = await Meeting.findById(meetingId);
  } catch (err) {
    const error = new HttpError(
      "Meeting not found,please try again later.",
      404
    );
    return next(error);
  }

  try {
    meetingList = await Promise.all(
      meetingIds.map((meetingId) => Meeting.findById(meetingId))
    );
    console.log(meetingList);
    meetingList.map((meet) => {
      if (meet.end_time >= meeting.start_time) {
        console.log("Hello");
        const error = new HttpError(
          "Failed to add participants,meetings overlapped,please try again later.",
          500
        );
        return next(error);
      }
    });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong,please try again later.",
      500
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    participant.meetings.push(meetingId);
    await participant.save({ session: sess });
    meeting.participants.push(participant);
    await meeting.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Failed to add participants,please try again later.",
      500
    );
    return next(error);
  }
  res.status(201).json({ meeting });
};

const getMeeting = async (req, res, next) => {
  const meetingId = req.query.meetingId;
  let meeting;
  try {
    meeting = await Meeting.findById(meetingId);
  } catch (err) {
    const error = new HttpError(
      "Meeting not found,please try again later.",
      404
    );
    return next(error);
  }
  res.status(200).json(meeting);
};

const getMeetingByTime = async (req, res, next) => {
  const page = parseInt(req.query.page) || 0; //for next page pass 1 here
  const limit = parseInt(req.query.limit) || 3;
  const start_date = moment(req.query.start_time).format(
    "YYYY-MM-DDTHH:mm:ss.SSSZ"
  );
  const end_date = moment(req.query.end_time).format(
    "YYYY-MM-DDTHH:mm:ss.SSSZ"
  );
  const query = {
    $and: [
      {
        start_time: {
          $gte: start_date,
        },
      },
      {
        end_time: {
          $lte: end_date,
        },
      },
    ],
  };
  const total = await Meeting.estimatedDocumentCount(query);
  const results = await Meeting.find(query)
    .sort()
    .skip(page * limit)
    .limit(limit);
  res.status(201).json({
    meetings: results,
    total,
    page,
    pageSize: results.length,
  });
};

exports.getMeeting = getMeeting;
exports.addParticipant = addParticipant;
exports.createMeeting = createMeeting;
exports.getMeetingByTime = getMeetingByTime;
