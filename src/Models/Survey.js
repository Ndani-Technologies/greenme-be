const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema({
  questions: [
    {
      question: { type: String, required: true },
      answers: [{ type: String, required: true }],
    },
  ],
});

const Survey = mongoose.model("Survey", surveySchema);
module.exports = Survey;
