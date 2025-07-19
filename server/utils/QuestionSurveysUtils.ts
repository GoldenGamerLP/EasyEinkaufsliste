import { AnswerData, Question, QuestionSkeleton } from "~/types/QandA";
import { addQuestionGenerator } from "./QuestionUtils";
import { getRandomRecipesFromHousehold } from "./recipeUtils";

const handleAnsweredSurvey = (question: Question, answer: AnswerData) => {
  // Handle the logic when a survey is answered
};

const createQuestionFromHousehold = async (householdId: string) => {
  const recipes = await getRandomRecipesFromHousehold(householdId, 3);

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
  console.log("Added handlers");

  addQuestionGenerator(
  "recipe-surveys",
  (householdId: string) => createQuestionFromHousehold(householdId),
  (question: Question, answer: AnswerData) =>
    handleAnsweredSurvey(question, answer)
);
};
