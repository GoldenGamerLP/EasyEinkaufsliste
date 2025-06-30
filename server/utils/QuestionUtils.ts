import { ObjectId } from "mongodb";
import database from "./DBUtils";
import { AnswerData, AnswerPosibillity, Question } from "~/types/QandA";
import { startInterval } from "./QuestionSurveysUtils";

const questionDatabase = database.collection<Question>("ehQuestions");
const answerDatabase = database.collection<AnswerData>("ehAnswers");

const createQuestion = async (
  householdId: string,
  title: string,
  description: string,
  answers: AnswerPosibillity[],
  ttl: number = 5 * 60 * 1000
) => {
  const question: Question = {
    _id: new ObjectId().toString(),
    householdId,
    title,
    description,
    answers,
    ttl: new Date(Date.now() + ttl),
  };

  const answerData: AnswerData = {
    _id: new ObjectId().toString(),
    questionId: question._id,
    answer: [],
  };

  const qInserted = await questionDatabase.insertOne(question);
  const aInserted = await answerDatabase.insertOne(answerData);

  return qInserted.acknowledged && aInserted.acknowledged;
};

const markAnswerByUser = async (
  userId: string,
  questionId: string,
  answer: string
) => {
  const answerData = await answerDatabase.findOne({ questionId });

  if (!answerData) return false;

  const answerIndex = answerData.answer.findIndex((a) => a.userId === userId);

  if (answerIndex !== -1) {
    // User already answered, update the answer
    answerData.answer[answerIndex].answerId = answer;
  } else {
    // User has not answered yet, add a new answer
    answerData.answer.push({ userId, answerId: answer });
  }

  // Update the answer data in the database
  const result = await answerDatabase.updateOne(
    { _id: answerData._id },
    { $set: { answer: answerData.answer } }
  );

  return result.acknowledged;
};

const getHouseholdQuestions = (householdId: string) => {
  return questionDatabase.find({ householdId }).toArray();
};

const getAnswersByQuestionId = (questionId: string) => {
  return answerDatabase.findOne({ questionId });
};

const upsertQuestionSurvey = async (
  uniqueIdentifier: string,
  question: Question
) => {
  const existsQuestion = await questionDatabase.findOne({ systemId: uniqueIdentifier });

  const qD = await questionDatabase.findOneAndUpdate(
    { systemId: uniqueIdentifier, ttl: { $lte: new Date() } },
    {
      $set: {
        householdId: question.householdId,
        title: question.title,
        description: question.description,
        answers: question.answers,
        ttl: question.ttl,
      },
      $setOnInsert: {
        _id: question._id, // Use the provided _id if it exists
      },
    },
    { upsert: !existsQuestion, returnDocument: "after" }
  );

  if (!qD) {
    console.log("No question found or created, exiting upsert.");
    return;
  }

  const questionId = qD?._id;

  await answerDatabase.updateOne(
    { questionId },
    {
      $set: {
        ttl: question.ttl,
        answer: [],
      },
      $setOnInsert: {
        questionId,
      },
    },
    { upsert: true }
  );
};

const createOrCheckIndexes = async () => {
  console.log("Creating or checking indexes for questions and answers...");
  await questionDatabase.createIndex({ householdId: 1 });
  await answerDatabase.createIndex({ questionId: 1 });

  startInterval();
};

createOrCheckIndexes().catch(console.error);

export {
  getAnswersByQuestionId,
  getHouseholdQuestions,
  createQuestion,
  markAnswerByUser,
  upsertQuestionSurvey,
};
