import * as z from "zod";
import { findLebensmittel } from "~/server/utils/lebensmittelUtils";

export default defineEventHandler(async (event) => {
  const { success, data, error } = await getValidatedQuery(
    event,
    validation.safeParseAsync
  );

  if (!success) {
    throw createError({
      status: 405,
      message: error.message,
    });
  }

  return await findLebensmittel(
    data.searchType,
    data.limit,
    data.lebensmittelname
  );
});

const validation = z.object({
  searchType: z.enum(["preis", "typ", "portion", "name"]),
  lebensmittelname: z.string(),
  limit: z.coerce.number().optional().default(5),
});
