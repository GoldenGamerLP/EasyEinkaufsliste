import { AnswerData, Question, QuestionSkeleton } from "~/types/QandA";
import { addQuestionGenerator } from "./QuestionUtils";
import { addRecipesUpvotes, getRandomRecipesFromHousehold } from "./recipeUtils";

export const QUESTION_IDENTIFIER = "recipe-surveys";

const handleAnsweredSurvey = async (question: Question, answers: AnswerData) => {
  // Handle the logic when a survey is answered
  const increments = new Map();

  for (let ans of answers.answer) {
    increments.set(ans.answerId, (increments.get(ans.answerId) || 0) + 1);
  }

  const res = await addRecipesUpvotes(increments);

  if(res.hasWriteErrors()) {
    console.error("Write erros occoured!");
    return;
  }

  console.log("Updated upvotes.");
};

const createQuestionFromHousehold = async (householdId: string) => {
  const recipes = await getRandomRecipesFromHousehold(householdId, 3);
  console.log("Length: " + recipes.map((recipe) => recipe.name));

  if (recipes.length < 3) {
    console.log(
      `Not enough recipes in household ${householdId} to create a question.`
    );
    return;
  }

  const answerPosibillities = recipes.map((recipe) => ({
    title: recipe.name,
    id: recipe._id.toString(),
    bild_refrence: recipe.bild_reference,
  }));

  const qSkel: QuestionSkeleton = {
    answers: answerPosibillities,
    description: "Wähle ein Rezept für den heutigen Tag aus.",
    title: "Rezept Umfrage",
  };

  return qSkel;
};

export const init = () => {
  addQuestionGenerator(
    QUESTION_IDENTIFIER,
    (householdId: string) => createQuestionFromHousehold(householdId),
    (question: Question, answer: AnswerData) =>
      handleAnsweredSurvey(question, answer)
  );
};
