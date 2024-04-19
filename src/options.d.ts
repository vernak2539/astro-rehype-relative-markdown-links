import { z } from "zod";
import { OptionsSchema } from "./options.mjs";

export type OptionsSchemaType = typeof OptionsSchema;
export interface Options extends z.input<OptionsSchemaType> {}
export type ValidateOptions = (
  options: Options | null | undefined,
) => z.infer<OptionsSchemaType>;
