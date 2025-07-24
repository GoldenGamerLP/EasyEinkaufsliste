import { ObjectId } from "mongodb";
import database from "./DBUtils";
import {
  AnswerData,
  AnswerPosibillity,
  Question,
  QuestionSkeleton,
} from "~/types/QandA";
import { init } from "./QuestionSurveysUtils";

const questionDatabase = database.collection<Question>("ehQuestions");
const answerDatabase = database.collection<AnswerData>("ehAnswers");

const questionGeneratorsList: Record<
  string,
  {
    questionCallback: (
      householdId: string
    ) => Promise<QuestionSkeleton | undefined> | QuestionSkeleton | undefined;
    onQuestionEnd: (question: Question, answerData: AnswerData) => void;
  }
> = {};

const addQuestionGenerator = (
  identifier: string,
  questionCallback: (
    householdId: string
  ) => Promise<QuestionSkeleton | undefined> | QuestionSkeleton | undefined,
  onQuestionEnd: (question: Question, answerData: AnswerData) => void
) => {
  if (questionGeneratorsList[identifier]) {
    console.warn(
      `Question generator with identifier ${identifier} already exists.`
    );
    return;
  }

  questionGeneratorsList[identifier] = { questionCallback, onQuestionEnd };
  console.log(`Added Question Generator - ${identifier}`);
};

const createNewQuestion = async (qGenerator: string, householdId: string) => {
  if (!questionGeneratorsList[qGenerator]) {
    console.log(`QuestionGenerator ${qGenerator} does not exist.`);
    return false;
  }

  const skeleton = await questionGeneratorsList[qGenerator].questionCallback(
    householdId
  );

  if (!skeleton) {
    console.log(
      `Ein fehler ist aufgtreten beim erstellen der Umfrage bei Household: ${householdId}`
    );
    return false;
  }

  const questionBefore = await questionDatabase.findOne({
    householdId,
    generatorId: qGenerator,
  });

  if (questionBefore) {
    const answerBefore = answerDatabase.findOne({ _id: questionBefore._id });
    //Only update fields/refresh dont do anything
    const res = questionDatabase.updateOne({ _id: questionBefore._id }, [
      {
        $set: {
          title: skeleton.title,
          description: skeleton.description,
          answers: skeleton.answers,
          ttl: new Date(Date.now() + (skeleton.ttl || 5 * 60 * 1000)), // Default TTL is 5 minutes
        },
      },
    ]);

    const ans = answerDatabase.updateOne(
      { _id: questionBefore._id },
      {
        $set: {
          answer: [],
        },
      }
    );

    const promises = await Promise.all([answerBefore, res, ans]);

    if (!promises[0]) {
      console.warn(
        `An error appeared getting answer before on household: ${householdId}`
      );
      return true;
    }

    questionGeneratorsList[qGenerator].onQuestionEnd(
      questionBefore,
      promises[0]
    );

    console.log(promises[2].matchedCount, promises[2].modifiedCount);

    return promises[1].acknowledged && promises[2].acknowledged;
  } else {
    //Insert
    const question: Question = {
      _id: new ObjectId().toString(),
      householdId,
      title: skeleton.title,
      description: skeleton.description,
      answers: skeleton.answers,
      ttl: new Date(Date.now() + (skeleton.ttl || 5 * 60 * 1000)), // Default TTL is 5 minutes
      generatorId: qGenerator,
    };

    const answerData: AnswerData = {
      _id: question._id,
      answer: [],
    };

    const ans = answerDatabase.insertOne(answerData);
    const res = questionDatabase.insertOne(question);
    const promises = await Promise.all([res, ans]);

    return promises[0].acknowledged && promises[1].acknowledged;
  }
};

const markAnswerByUser = async (
  userId: string,
  questionId: string,
  answer: string
) => {
  const response = await answerDatabase.updateOne(
    { _id: questionId, "answer.userId": userId },
    {
      $set: {
        "answer.$.answerId": answer,
        "answer.$.date": new Date(),
      },
    }
  );

  if (response.modifiedCount === 0) {
    await answerDatabase.updateOne(
      { _id: questionId },
      {
        $push: {
          answer: {
            userId,
            answerId: answer,
            date: new Date(),
          },
        },
      }
    );
  }

  return true;
};

const getHouseholdQuestions = (householdId: string) => {
  return questionDatabase.find({ householdId }).toArray();
};

const getAnswersByQuestionId = (questionId: string) => {
  return answerDatabase.findOne({ _id: questionId });
};

const createOrCheckIndexes = async () => {
  console.log("Creating or checking indexes for questions and answers...");
  await questionDatabase.createIndex({ householdId: 1 });
  await questionDatabase.createIndex({ generatorId: 1 });
  init();
};

createOrCheckIndexes().catch(console.error);

export {
  getAnswersByQuestionId,
  getHouseholdQuestions,
  markAnswerByUser,
  createNewQuestion,
  addQuestionGenerator,
};
