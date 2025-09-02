import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export default publicProcedure
  .input(z.object({ name: z.string().optional().default("World") }))
  .query(({ input }: { input: { name: string } }) => {
    return {
      hello: `Hello ${input.name}!`,
      date: new Date(),
      success: true
    };
  });