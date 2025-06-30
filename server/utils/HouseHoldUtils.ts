import database from "./DBUtils";
import fs from "fs";
import { z } from "zod";
import { infer } from "zod";
import {
  FrontEndRezept,
  HouseHold,
  Lebensmittel,
  Rezept,
  RezeptErstellSchema,
  RezeptErstellType,
} from "~/types/HouseHold";
import { uploadFile } from "./FileUtils";
import { ObjectId } from "mongodb";
import { FrontEndUser } from "~/types/User";

const householdCollection = database.collection<HouseHold>("households");
const rezeptCollection = database.collection<Rezept>("rezepte");
const lebensmittelCollection =
  database.collection<Lebensmittel>("lebensmittel");

  export const getRecipe = async (recipeId: string): Promise<FrontEndRezept | null> => {
  const recipe = await rezeptCollection.aggregate([
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
      },
    },
  ]).toArray();

  if (recipe.length === 0) {
    return null; // No recipe found
  }

  return recipe[0] as FrontEndRezept; // Return the first recipe found
}

//TODO: Expose datbases? Or a function callback?
export interface HouseholdAndrecipes {
  household: HouseHold;
  recipes: FrontEndRezept[];
}

export const getHouseholdsAndRecipes = async () => {
  const households = await householdCollection.find().toArray();
  const householdAndRecipes: HouseholdAndrecipes[] = [];

  for (const household of households) {
    const recipes = await getRecipesForHousehold(household._id, undefined, "alphabetical");
    householdAndRecipes.push({ household, recipes });
  }

  return householdAndRecipes as HouseholdAndrecipes[];
}

export const getRecipesForHousehold = async (
  householdId: string,
  search: string | undefined,
  sort: "alphabetical" | "mostliked" | "created"
): Promise<FrontEndRezept[]> => {
  const query: any = { householdId };

  if (search) {
    query.name = { $regex: new RegExp(search, "i") }; // Case insensitive search
  }

  let sortOption: any;
  switch (sort) {
    case "alphabetical":
      sortOption = { name: 1 };
      break;
    /*     case "mostliked":
      sortOption = { likes: -1 }; // Assuming you have a 'likes' field
      break;
    case "created":
      sortOption = { created: -1 };
      break; */
    default:
      sortOption = {};
  }

  const recipes = rezeptCollection.aggregate([
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
      },
    },
  ]);

  return (await recipes.toArray()) as FrontEndRezept[];
};

export const hasAccessToHousehold = async (
  householdId: string,
  userId: string
) => {
  const household = await householdCollection.findOne({
    _id: householdId,
    members: userId,
  });

  return household !== null;
};

export const getHousehold = async (householdId: string, userId: string) => {
  const household = await householdCollection.findOne({
    _id: householdId,
    members: userId,
  });

  return household;
};

export const getHouseholds = async (userId: string) => {
  const households = await householdCollection
    .find({ members: { $in: [userId] } })
    .toArray();
  return households;
};

export const createNewHousehold = async (
  name: string,
  userId: string,
  members: string[]
) => {
  const existingHousehold = await householdCollection.findOne({ name });

  if (existingHousehold) {
    throw new Error("Household with this name already exists.");
  }

  const newHousehold: HouseHold = {
    _id: new ObjectId().toString(),
    name,
    members: members.concat(userId), // Add the creator as a member
    createdBy: userId,
    createdAt: new Date(),
  };

  const result = await householdCollection.insertOne(newHousehold);

  if (result.acknowledged) {
    return result.insertedId.toString(); // Return the inserted ID as a string
  } else {
    throw new Error("Failed to create household");
  }
};

const checkOrInstert = async () => {
  const size = await lebensmittelCollection.countDocuments();

  if (size == 0) {
    console.log("Inserting new Lebensmittel.csv.");
    const exists = fs.existsSync("assets/Lebensmittel.csv");

    if (!exists) {
      console.warn("No Lebensmittel.txt found in assets!");
      return;
    }

    const data: string = fs.readFileSync("assets/Lebensmittel.csv", {
      encoding: "utf-8",
    });

    let lines = data.split("\n");
    let lebensmittel: Lebensmittel[] = [];

    for (let i = 1; i < lines.length; i++) {
      let contents = lines[i].split(",");
      if (contents.length < 7) {
        console.warn("Not enough parameters inside the csv file!");
        break;
      }

      lebensmittel.push({
        name: contents[0],
        lebensmittel_gruppe: contents[1],
        preis: parseFloat(contents[2]),
        verpackungsart: contents[3],
        verpackungsmenge: parseInt(contents[4]),
        verpackungsmenge_einheit: contents[5],
        standard_einheit_wert: parseInt(contents[6]),
      });
    }

    await lebensmittelCollection.insertMany(lebensmittel);

    console.log("Done inserting Lebensmittel.txt");
  }
};

export const findLebensmittel = (
  searchType: "name" | "preis" | "typ" | "portion",
  limit: number,
  lebensmittelName: String
) => {
  //Search with regex
  return lebensmittelCollection
    .find({
      [searchType]: {
        $regex: new RegExp(lebensmittelName, "i"), // Case insensitive search
      },
    })
    .limit(limit)
    .toArray();
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
  };

  const result = await rezeptCollection.insertOne(rezeptData);

  if (result.acknowledged) {
    return result.insertedId.toString(); // Return the inserted ID as a string
  } else {
    throw new Error("Failed to insert recipe");
  }
};

export const getHouseholdMembers = async (householdId: string): Promise<FrontEndUser[]> => {
  const members = householdCollection.aggregate([
    {
      $lookup: {
        from: 'users',
        let: { users: '$members' },
        pipeline: [
          {
            $match: {
              $expr: { $in: ['$_id', '$$users'] }
            }
          },
          {
            $project: {
              mail: 1,
              lastname: 1,
              name: 1
            }
          }
        ],
        as: 'members'
      }
    },
    { $project: { members: 1 } }
  ]);

  if(await members.hasNext()) {
    const crrMembers = await members.next();
    return crrMembers?.members || [];
  }

  return [];
}

checkOrInstert();
