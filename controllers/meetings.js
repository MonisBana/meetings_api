const HttpError = require("../models/http-error");
const moment = require("moment");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const Meeting = require("../models/meeting");
const Participant = require("../models/participant");

// Creates new meeting.
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

//Adds Participant to a meeting
const addParticipant = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }
  const { meetingId, participantId } = req.query;

  let meeting;
  let participant;
  let meetingIds;
  let meetingList;

  //Check if Participant exists
  try {
    participant = await Participant.findById(participantId);
    console.log(participant);
    meetingIds = participant.meetings;
  } catch (err) {
    const error = new HttpError(
      // "Particpant not found,please try again later.",
      err,
      404
    );
    return next(error);
  }
  //Check if meeting exists
  try {
    meeting = await Meeting.findById(meetingId);
  } catch (err) {
    const error = new HttpError(
      "Meeting not found,please try again later.",
      404
    );
    return next(error);
  }
  //Check if meetings are overlapped for the given participant
  try {
    //Map meeting Ids of given partcipant to create the detailed list of meetings
    meetingList = await Promise.all(
      meetingIds.map((meetingId) => Meeting.findById(meetingId))
    );
    //Sort meetingList in ascending order of start time
    meetingList.sort((a, b) => a.start_time - b.start_time);
    meetingList.map((meet) => {
      //Check if new meetings's start time is greater than end time of current meeting
      if (meet.end_time >= meeting.start_time) {
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
  //1.Push meeting id in given partcipant
  //2.Push partcipant in given meeting
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

//Get meeting by meeting id
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

// Get meeting within time frame(Added Pagination for this route)
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
