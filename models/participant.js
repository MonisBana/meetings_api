const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const participantSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  RSVP: { type: String, required: true },
  meetings: [
    {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Meeting",
      unique: true,
    },
  ],
});
participantSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Participant", participantSchema);
