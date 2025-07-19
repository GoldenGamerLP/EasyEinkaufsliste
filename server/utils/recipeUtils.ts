import { FrontEndRezept, Rezept, RezeptErstellType } from "~/types/HouseHold";
import database from "./DBUtils";
import { ObjectId } from "mongodb";

const rezeptCollection = database.collection<Rezept>("rezepte");

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
        last_updated: { $first: "$last_updated" },
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
  const agg = rezeptCollection.aggregate([
    {
      $match: { householdId }
    },
    {
      $sample: { size }
    },
  ]);

  return await agg.toArray() as FrontEndRezept[];
};

export const getRecipe = async (
  recipeId: string
): Promise<FrontEndRezept | null> => {
  const recipe = await rezeptCollection
    .aggregate([
      { $match: { _id: new ObjectId(recipeId) } },
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
          last_updated: { $first: "$last_updated" },
          createdby: { $first: "$createdby" },
          householdId: { $first: "$householdId" },
          isPublic: { $first: "$isPublic" },
        },
      },
    ])
    .toArray();

  if (recipe.length === 0) {
    return null; // No recipe found
  }

  return recipe[0] as FrontEndRezept; // Return the first recipe found
};

export const changeVisibillityFromRecipe = async (
  recipeId: string,
  isPublic: boolean
) => {
  console.log(recipeId, isPublic);
  const result = rezeptCollection.updateOne(
    { _id: new ObjectId(recipeId) },
    { $set: { isPublic: isPublic } }
  );

  const lastUpdateResult = await changeLastUpdated(recipeId);

  const res = await Promise.all([result, lastUpdateResult]);

  if (!res[0]) {
    throw new Error("Rezept nicht gefunden.");
  }
  return res[0].acknowledged;
};

export const getRecipesForHousehold = async (
  householdId: string,
  search: string | undefined,
  sort: "alphabetical" | "mostliked" | "created"
): Promise<FrontEndRezept[]> => {
  const query: any = { householdId };

  if (search) {
    query.name = { $regex: new RegExp(escapedRegex(search), "i") }; // Case insensitive search
  }

  let sortOption: any;
  switch (sort) {
    case "alphabetical":
      sortOption = { name: 1 };
      break;
    case "created":
      sortOption = { created: -1 };
      break;
    default:
      sortOption = {};
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
        bild_reference: {
          $first: "$bild_reference",
        },
        zutaten: {
          $push: {
            $mergeObjects: [
              { $first: "$zutat" },
              { portion: "$zutaten.portion" },
            ],
          },
        },
        created: { $first: "$created" },
        last_updated: { $first: "$last_updated" },
        createdby: { $first: "$createdby" },
        householdId: { $first: "$householdId" },
        isPublic: { $first: "$isPublic" },
      },
    },
    {
      $sort: sortOption,
    },
  ]);

  return (await recipes.toArray()) as FrontEndRezept[];
};

export const insertNewRecipe = async (
  rezept: RezeptErstellType,
  household: string,
  userId: string
) => {
  //Convert rezept: RezeptErstellType to Rezept type and insert it into the database, upload the bild/image to the database via uploadFile

  //base64 image to buffer
  let base64Image = rezept.bild;
  if (base64Image.startsWith("data:")) {
    base64Image = base64Image.split(",")[1]; // Get only the base64 part
  }
  const buffer = Buffer.from(base64Image, "base64");

  const file = await uploadFile(buffer, rezept.name + ".jpg", "image/jpeg");

  const rezeptData: Rezept = {
    name: rezept.name,
    beschreibung: rezept.beschreibung,
    bild_reference: file.id.toString(), // Store the file ID as a string
    zutaten: rezept.zutaten.map((zutat) => ({
      portion: zutat.portion,
      lebensmittel_id: zutat.lebensmittel._id || "",
    })),
    created: new Date(),
    last_updated: new Date(),
    createdby: userId,
    householdId: household,
    isPublic: rezept.isPublic || false, // Default to false if not provided
  };

  const result = await rezeptCollection.insertOne(rezeptData);

  if (result.acknowledged) {
    return result.insertedId.toString(); // Return the inserted ID as a string
  } else {
    throw new Error("Failed to insert recipe");
  }
};

const changeLastUpdated = async (recipeId: string) => {
  const result = await rezeptCollection.updateOne(
    { _id: new ObjectId(recipeId) },
    { $set: { last_updated: new Date() } }
  );

  if (result.modifiedCount === 0) {
    throw new Error("Failed to update last updated date");
  }
};

const escapedRegex = (search: string) => {
  return search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
