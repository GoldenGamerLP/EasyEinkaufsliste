import {
  FrontEndRezept,
  HouseholdRezept,
  Rezept,
  RezeptErstellType,
} from "~/types/HouseHold";
import database from "./DBUtils";
import { ObjectId } from "mongodb";
import { QUESTION_IDENTIFIER } from "./QuestionSurveysUtils";

const rezeptCollection = database.collection<Rezept>("rezepte");
const rezepteHouseholdCollection =
  database.collection<HouseholdRezept>("household_recipes");

export const findPublicRecipes = async (
  search: string,
  householdId: string | undefined
): Promise<FrontEndRezept[]> => {
  //Return all public recipes that match the search term and do not belong to the householdId
  const query: any = {
    isPublic: true,
  };

  if (search) {
    query.name = { $regex: new RegExp(escapedRegex(search), "i") }; // Case insensitive search
  }

  const recipes = rezeptCollection.aggregate([
    { $match: query },
    { $unwind: { path: "$zutaten" } },
    {
      $addFields: {
        zutatenId: {
          $toObjectId: "$zutaten.lebensmittel_id",
        },
      },
    },
    {
      $lookup: {
        from: "lebensmittel",
        localField: "zutatenId",
        foreignField: "_id",
        as: "zutat",
      },
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        beschreibung: { $first: "$beschreibung" },
        bild_reference: { $first: "$bild_reference" },
        zutaten: {
          $push: {
            $mergeObjects: [
              { $first: "$zutat" },
              { portion: "$zutaten.portion" },
            ],
          },
        },
        created: { $first: "$created" },
        lastModified: { $first: "$lastModified" },
        createdby: { $first: "$createdby" },
        householdId: { $first: "$householdId" },
        isPublic: { $first: "$isPublic" },
      },
    },
  ]);

  const result = await recipes.toArray();

  return result as FrontEndRezept[];
};

export const getRandomRecipesFromHousehold = async (
  householdId: string,
  size: number
) => {
  const recipes = await rezepteHouseholdCollection
    .aggregate([
      {
        $match: { householdId },
      },
      {
        $sample: { size },
      },
      {
        $addFields: {
          recipeId: {
            $toObjectId: "$recipeId",
          },
        },
      },
      {
        $lookup: {
          from: "rezepte",
          localField: "recipeId",
          foreignField: "_id",
          as: "recipe",
        },
      },
      { $unwind: "$recipe" },
      {
        $match: {
          $or: [
            {
              "recipe.householdId": householdId,
            },
            {
              householdId,
              isEnabled: true,
            },
          ],
        },
      },
      {
        $group: {
          _id: "$recipe._id",
          name: { $first: "$recipe.name" },
          beschreibung: { $first: "$recipe.beschreibung" },
          bild_reference: { $first: "$recipe.bild_reference" },
          created: { $first: "$recipe.created" },
          lastModified: { $first: "$recipe.lastModified" },
          createdby: { $first: "$recipe.createdby" },
          householdId: { $first: "$recipe.householdId" },
          isPublic: { $first: "$recipe.isPublic" },
          isFavorite: { $first: "$isFavorite" },
        },
      },
    ])
    .toArray();

  return recipes as FrontEndRezept[];
};

export const getRecipe = async (
  recipeId: string,
  householdId?: string
): Promise<FrontEndRezept | null> => {
  const recipe = rezeptCollection.aggregate([
    { $match: { _id: new ObjectId(recipeId.toString()) } },
    { $unwind: { path: "$zutaten" } },
    {
      $addFields: {
        zutatenId: {
          $toObjectId: "$zutaten.lebensmittel_id",
        },
      },
    },
    {
      $lookup: {
        from: "lebensmittel",
        localField: "zutatenId",
        foreignField: "_id",
        as: "zutat",
      },
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        beschreibung: { $first: "$beschreibung" },
        bild_reference: { $first: "$bild_reference" },
        zutaten: {
          $push: {
            $mergeObjects: [
              { $first: "$zutat" },
              { portion: "$zutaten.portion" },
            ],
          },
        },
        created: { $first: "$created" },
        lastModified: { $first: "$lastModified" },
        createdby: { $first: "$createdby" },
        householdId: { $first: "$householdId" },
        isPublic: { $first: "$isPublic" },
      },
    },
  ]);

  if (householdId) {
    const householdRes = rezepteHouseholdCollection.findOne(
      {
        householdId,
        recipeId,
      },
      { projection: { _id: 0, lastModified: 0 } }
    );

    const response = await Promise.all([householdRes, recipe.toArray()]);

    if (response[1].length === 0) {
      return null;
    }

    return { ...response[1][0], ...response[0] } as FrontEndRezept;
  }

  const array = await recipe.toArray();
  if (array.length === 0) {
    return null; // No recipe found
  }

  return array[0] as FrontEndRezept; // Return the first recipe found
};

export const changeVisibillityFromRecipe = async (
  recipeId: string,
  isPublic: boolean
) => {
  // Update recipe visibility
  const result = rezeptCollection.updateOne(
    { _id: new ObjectId(recipeId) },
    { $set: { isPublic: isPublic, lastModified: new Date() } }
  );

  // If recipe becomes private, disable it in all households that have it
  const householdUpdatePromise = rezepteHouseholdCollection.updateMany(
    { recipeId: recipeId.toString() },
    { $set: { isEnabled: isPublic, lastModified: new Date() } }
  );

  const res = await Promise.all([result, householdUpdatePromise]);

  return res[0].acknowledged && res[1].acknowledged;
};

export const getRecipesForHousehold = async (
  householdId: string,
  search: string | undefined,
  sort: "alphabetical" | "mostliked" | "created"
): Promise<FrontEndRezept[]> => {
  const matchStage: any = {
    $match: {
      $or: [
        {
          "recipe.householdId": householdId,
        },
        {
          householdId,
          isEnabled: true,
        },
      ],
    },
  };

  let sortStage: any = {};
  switch (sort) {
    case "alphabetical":
      sortStage = { name: 1 };
      break;
    case "created":
      sortStage = { created: -1 };
      break;
    case "mostliked":
      sortStage = { isFavorite: -1, name: 1 };
      break;
    default:
      sortStage = { created: -1 };
  }

  if (search) {
    matchStage.$match["name"] = {
      $regex: new RegExp(escapedRegex(search), "i"),
    };
  }

  const recipes = await rezepteHouseholdCollection
    .aggregate([
      {
        $addFields: {
          recipeId: {
            $toObjectId: "$recipeId",
          },
        },
      },
      {
        $lookup: {
          from: "rezepte",
          localField: "recipeId",
          foreignField: "_id",
          as: "recipe",
        },
      },
      { $unwind: "$recipe" },
      matchStage,
      { $unwind: { path: "$recipe.zutaten" } },
      {
        $addFields: {
          "recipe.zutaten.lebensmittel_id": {
            $toObjectId: "$recipe.zutaten.lebensmittel_id",
          },
        },
      },
      {
        $lookup: {
          from: "lebensmittel",
          localField: "recipe.zutaten.lebensmittel_id",
          foreignField: "_id",
          as: "zutat",
        },
      },
      {
        $group: {
          _id: "$recipe._id",
          name: { $first: "$recipe.name" },
          beschreibung: {
            $first: "$recipe.beschreibung",
          },
          bild_reference: {
            $first: "$recipe.bild_reference",
          },
          zutaten: {
            $push: {
              $mergeObjects: [
                { $first: "$zutat" },
                { portion: "$recipe.zutaten.portion" },
              ],
            },
          },
          created: { $first: "$recipe.created" },
          lastModified: {
            $first: "$recipe.lastModified",
          },
          createdby: { $first: "$recipe.createdby" },
          householdId: {
            $first: "$recipe.householdId",
          },
          isPublic: { $first: "$recipe.isPublic" },
          isFavorite: { $first: "$isFavorite" },
        },
      },
      { $sort: sortStage },
    ])
    .toArray();

  return recipes as FrontEndRezept[];
};

export const insertNewRecipe = async (
  rezept: RezeptErstellType,
  household: string,
  userId: string
) => {
  //base64 image to buffer
  let base64Image = rezept.bild;
  if (base64Image.startsWith("data:")) {
    base64Image = base64Image.split(",")[1]; // Get only the base64 part
  }
  const buffer = Buffer.from(base64Image, "base64");

  const file = await uploadFile(buffer, rezept.name + ".webp", "image/webp");

  const rezeptData: Rezept = {
    _id: new ObjectId(),
    name: rezept.name,
    beschreibung: rezept.beschreibung,
    bild_reference: file.id.toString(), // Store the file ID as a string
    zutaten: rezept.zutaten.map((zutat) => ({
      portion: zutat.portion,
      lebensmittel_id: zutat.lebensmittel._id || "",
    })),
    created: new Date(),
    lastModified: new Date(),
    createdby: userId,
    householdId: household,
    isPublic: rezept.isPublic || false, // Default to false if not provided
  };

  const result = rezeptCollection.insertOne(rezeptData);
  const addH = addRecipeToHousehold(
    household,
    rezeptData._id?.toString()!,
    userId
  );

  //An better check?
  const checkQuestion = createNewQuestion(QUESTION_IDENTIFIER, household);

  const res = await Promise.all([result, addH, checkQuestion]);

  if (!(res[0].acknowledged && res[1] && checkQuestion)) {
    throw createError({
      status: 500,
      message: "An error appeared while adding recipe, try again.",
    });
  }

  return rezeptData;
};

export const addRecipeToHousehold = async (
  householdId: string,
  recipeId: string,
  userId: string
): Promise<boolean> => {
  // Check if the relationship already exists
  const existing = await rezepteHouseholdCollection.findOne({
    householdId,
    recipeId,
  });

  if (existing) {
    return true; // Recipe already added to household
  }

  const result = await rezepteHouseholdCollection.insertOne({
    householdId,
    recipeId,
    addedAt: new Date(),
    addedBy: userId,
    isFavorite: false,
    isEnabled: true,
    lastModified: new Date(),
  });

  return result.acknowledged;
};

export const removeRecipeFromHousehold = async (
  householdId: string,
  recipeId: string
): Promise<boolean> => {
  const result = await rezepteHouseholdCollection.deleteOne({
    householdId,
    recipeId,
  });

  return result.deletedCount > 0;
};

export const getHouseholdRecipes = async (
  householdId: string,
  search?: string,
  sort: "alphabetical" | "mostliked" | "created" = "created"
): Promise<FrontEndRezept[]> => {
  const matchStage: any = {
    $match: {
      $and: [
        {
          $or: [
            { householdId }, // Recipes directly in the household
            {
              $and: [
                { "recipe.isPublic": true },
                { householdId: { $exists: true } },
              ],
            }, // Public recipes
          ],
        },
        { isEnabled: true }, // Only show enabled recipes
      ],
    },
  };

  if (search) {
    matchStage.$match["recipe.name"] = {
      $regex: new RegExp(escapedRegex(search), "i"),
    };
  }

  let sortStage: any = {};
  switch (sort) {
    case "alphabetical":
      sortStage = { "recipe.name": 1 };
      break;
    case "created":
      sortStage = { addedAt: -1 };
      break;
    default:
      sortStage = { addedAt: -1 };
  }

  const recipes = await rezepteHouseholdCollection
    .aggregate([
      {
        $lookup: {
          from: "rezepte",
          localField: "recipeId",
          foreignField: "_id",
          as: "recipe",
        },
      },
      { $unwind: "$recipe" },
      { $sort: sortStage },
      matchStage,

      // Expand recipe ingredients
      { $unwind: { path: "$recipe.zutaten" } },
      {
        $lookup: {
          from: "lebensmittel",
          localField: "recipe.zutaten.lebensmittel_id",
          foreignField: "_id",
          as: "zutat",
        },
      },
      {
        $group: {
          _id: "$recipe._id",
          name: { $first: "$recipe.name" },
          beschreibung: { $first: "$recipe.beschreibung" },
          bild_reference: { $first: "$recipe.bild_reference" },
          zutaten: {
            $push: {
              $mergeObjects: [
                { $first: "$zutat" },
                { portion: "$recipe.zutaten.portion" },
              ],
            },
          },
          created: { $first: "$recipe.created" },
          lastModified: { $first: "$recipe.lastModified" },
          createdby: { $first: "$recipe.createdby" },
          householdId: { $first: "$recipe.householdId" },
          isPublic: { $first: "$recipe.isPublic" },
          isFavorite: { $first: "$isFavorite" },
          addedAt: { $first: "$addedAt" },
        },
      },
    ])
    .toArray();

  return recipes as FrontEndRezept[];
};

export const toggleFavoriteRecipe = async (
  householdId: string,
  recipeId: string
): Promise<boolean> => {
  const result = await rezepteHouseholdCollection.updateOne(
    { householdId, recipeId },
    [
      {
        $set: {
          isFavorite: { $not: "$isFavorite" },
        },
      },
    ]
  );

  return result.modifiedCount > 0;
};

export const setRecipeEnabled = async (
  householdId: string,
  recipeId: string,
  isEnabled: boolean
): Promise<boolean> => {
  try {
    const result = await rezepteHouseholdCollection.updateOne(
      { householdId, recipeId },
      {
        $set: {
          isEnabled,
          lastModified: new Date(),
        },
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error updating recipe availability:", error);
    return false;
  }
};

export const deleteRecipe = async (recipeId: string): Promise<boolean> => {
  // Prüfen ob das Rezept zum Haushalt gehört
  const recipe = await rezeptCollection.findOne({
    _id: new ObjectId(recipeId),
  });

  if (!recipe) {
    console.warn("Das Rezept zum löschen wurde nicht gefunden! - " + recipeId);
    return false;
  }

  // Rezept aus der Hauptsammlung löschen
  const deleteResult = await rezeptCollection.deleteOne({
    _id: new ObjectId(recipeId),
  });

  if (!deleteResult.acknowledged) {
    console.warn("Fehler beim Löschen des Rezepts.");
    return false;
  }

  // Alle Beziehungen zu diesem Rezept in anderen Haushalten löschen
  const del = rezepteHouseholdCollection.deleteMany({
    recipeId: recipeId,
  });

  const imgDel = deleteFile(new ObjectId(recipe.bild_reference));

  //ImgDel does not return anything
  const res = await Promise.all([del, imgDel]);

  return res[0].acknowledged;
};

const escapedRegex = (search: string) => {
  return search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
