const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const meetingSchema = new Schema(
  {
    title: { type: String, required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    participants: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Participant",
        unique: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meeting", meetingSchema);
