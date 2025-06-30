import { Question } from "~/types/QandA";
import { getHouseholdsAndRecipes } from "./HouseHoldUtils";
import { upsertQuestionSurvey } from "./QuestionUtils";
import { ObjectId } from "mongodb";

const createIntervall = 1 * 60 * 1000;
const identifier = (householdId: string) => `question-survey-${householdId}`;

export const startInterval = () => {
  console.log("Starting question survey interval...");
  setInterval(() => {
    checkQuestionSurves();
  }, createIntervall);
};

const checkQuestionSurves = async () => {
  console.log("Checking for question surveys...");
  const har = await getHouseholdsAndRecipes();
  for (const h of har) {
    if (h.recipes.length < 3) {
      console.log(
        `Household ${h.household._id} has less than 3 recipes, skipping question survey.`
      );
      continue;
    }

    const uniqueIdentifier = identifier(h.household._id);

    const survey: Question = {
      _id: new ObjectId().toString(),
      systemId: uniqueIdentifier,
      householdId: h.household._id,
      title: "Recipe Survey",
      description: "Please answer the following questions about your recipes.",
      answers: randomizeAndSpliceArray(h.recipes, 3).map((recipe) => ({
        title: recipe.name,
        id: recipe._id,
        bild_refrence: recipe.bild_reference
          ? recipe.bild_reference
          : undefined,
      })),
      ttl: new Date(calucalteTillNextDay()),
    };

    try {
      upsertQuestionSurvey(uniqueIdentifier, survey);
    } catch (error) {
      console.error(
        `Error creating question survey for household ${h.household._id}:`,
        error
      );
    }
  }
};

const calucalteTillNextDay = () => {
  // Calculate the next day at midnight
  return Date.now() + (24 * 60 * 60 * 1000) - (Date.now() % (24 * 60 * 60 * 1000));
};

const randomizeAndSpliceArray = <T>(array: T[], count: number): T[] => {
  if (count >= array.length) {
    return array;
  }
  const shuffled = array.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
