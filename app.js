const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const meetingsRoutes = require("./routes/meetings");
const participantsRoutes = require("./routes/participants");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use("/api/meetings", meetingsRoutes);
app.use("/api/participants", participantsRoutes);

app.use((req, res, next) => {
  throw new HttpError("Could not find this route", 404);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

mongoose
  .connect(
    "mongodb+srv://mab:79918031@cluster0.bs2kt.mongodb.net/meetings_schema?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => console.log(err));
