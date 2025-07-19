import { Lebensmittel } from "~/types/HouseHold";
import database from "./DBUtils";
import fs from "fs";

const lebensmittelCollection =
  database.collection<Lebensmittel>("lebensmittel");

export const findLebensmittel = (
  searchType: "name" | "preis" | "typ" | "portion",
  limit: number,
  lebensmittelName: string
) => {
  //Search with regex
  return lebensmittelCollection
    .find({
      [searchType]: {
        $regex: new RegExp(escapedRegex(lebensmittelName), "i"), // Case insensitive search
      },
    })
    .limit(limit)
    .toArray();
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

//TODO: A better way of centralizing the check and insert
checkOrInstert();

const escapedRegex = (search: string) => {
  return search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
