import * as z from "zod";

type FileAttachment = {
  fileId: String; // GridFS file ID
  filename: string;
  contentType: string;
  length: number;
};

const LebensmittelSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId
  name: z.string(),
  lebensmittel_gruppe: z.string(),
  preis: z.number(),
  verpackungsart: z.string(),
  verpackungsmenge: z.number(),
  verpackungsmenge_einheit: z.string(),
  standard_einheit_wert: z.number(),
});

const RezeptErstellSchema = z.object({
  householdId: z.string().min(24, { message: "Ungültige Haushalts-ID." }),
  name: z.string().min(5),
  beschreibung: z.string().optional(),
  bild: z.string({ message: "Ein Bild wird benötigt." }),
  zutaten: z.array(
    z.object({
      portion: z
        .number()
        .min(1, {
          message: "Die Portionen müssen mindestens größer als 0 sein.",
        }),
      lebensmittel: LebensmittelSchema,
    }),
    { message: "Es muss mindestens ein Lebensmittel eingetragen sein." }
  ),
});

type Lebensmittel = z.infer<typeof LebensmittelSchema>;

interface Rezept {
  name: string;
  beschreibung: string | undefined;
  bild_reference: string;
  zutaten: {
    portion: number;
    lebensmittel_id: string;
  }[];
  created: Date;
  last_updated: Date;
  createdby: string;
  householdId: string;
}

interface FrontEndRezept {
  _id: string; // MongoDB ObjectId
  name: string;
  beschreibung: string | undefined;
  bild_reference: string;
  zutaten: Lebensmittel & {
    portion: number;
  }[];
  created: Date;
  last_updated: Date;
  createdby: string;
  householdId: string;
}

type RezeptErstellType = z.infer<typeof RezeptErstellSchema>;

interface HouseHold {
  _id: string; // MongoDB ObjectId
  name: string;
  members: string[]; // Array of user IDs
  createdBy: string; // User ID of the creator
  createdAt: Date; // Date when the household was created
}

export {
  type FileAttachment,
  LebensmittelSchema,
  RezeptErstellSchema,
  type Lebensmittel,
  type Rezept,
  type RezeptErstellType,
  type HouseHold,
  type FrontEndRezept,
};
