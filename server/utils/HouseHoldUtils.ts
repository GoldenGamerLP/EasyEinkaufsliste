import database from "./DBUtils";
import {
  FrontEndRezept,
  HouseHold,
  UserRole,
  UserRoles,
} from "~/types/HouseHold";
import { ObjectId } from "mongodb";
import { FrontEndUser } from "~/types/User";

const householdCollection = database.collection<HouseHold>("households");

//TODO: Expose datbases? Or a function callback? -> For QUestions survey - refractoring
export interface HouseholdAndrecipes {
  household: HouseHold;
  recipes: FrontEndRezept[];
}

export const getHouseholdsAndRecipes = async () => {
  const households = await householdCollection.find().toArray();
  const householdAndRecipes: HouseholdAndrecipes[] = [];

  for (const household of households) {
    const recipes = await getRecipesForHousehold(
      household._id,
      undefined,
      "alphabetical"
    );
    householdAndRecipes.push({ household, recipes });
  }

  return householdAndRecipes as HouseholdAndrecipes[];
};

export const addMemberToHousehold = async (
  householdId: string,
  userId: string
) => {
  const req = householdCollection.updateOne(
    { _id: householdId },
    {
      $push: {
        members: userId,
      },
      $set: {
        [`memberRoles.${userId}`]: UserRoles[0], // Set default role for new member
      },
    }
  );

  const user = getUserById(userId);

  return Promise.all([
    req,
    user.then((u) => {
      if (!u) {
        throw new Error("User not found");
      }
      return u;
    }),
  ]).then(([result, user]) => {
    if (result.modifiedCount === 0) {
      throw new Error("Failed to add member to household");
    }
    return user; // Return the user object
  });
};

export const removeMemberFromHousehold = async (
  householdId: string,
  userId: string
) => {
  const req = householdCollection.updateOne(
    { _id: householdId },
    {
      $pull: {
        members: userId,
      },
      $unset: {
        [`memberRoles.${userId}`]: "", // Remove the user's role
      },
    }
  );

  return (await req).modifiedCount != 0;
};

export const updateMemberRole = async (
  userId: string,
  householdId: string,
  role: UserRole
) => {
  // Ensure householdId is a string (or ObjectId if needed)
  const req = await householdCollection.updateOne(
    { _id: householdId, members: { $in: [userId] } },
    {
      $set: {
        [`memberRoles.${userId}`]: role, // Update the user's role
      },
    }
  );

  return req.modifiedCount != 0;
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
    memberRoles: { [userId]: UserRoles[2] }, // Store as plain object for MongoDB compatibility
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

export const getHouseholdMembers = async (
  householdId: string
): Promise<FrontEndUser[]> => {
  const members = householdCollection.aggregate([
    {
      $match: { _id: householdId },
    },
    {
      $lookup: {
        from: "users",
        let: { users: "$members" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$_id", "$$users"] },
            },
          },
          {
            $project: {
              mail: 1,
              lastname: 1,
              name: 1,
              bild_reference: 1,
            },
          },
        ],
        as: "members",
      },
    },
    { $project: { members: 1 } },
  ]);

  if (await members.hasNext()) {
    const crrMembers = await members.next();
    return crrMembers?.members || [];
  }

  return [];
};