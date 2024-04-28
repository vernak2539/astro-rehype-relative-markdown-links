import { z } from "zod";
import { OptionsSchema, CollectionConfigSchema } from "./options.mjs";

export type OptionsSchemaType = typeof OptionsSchema;
export interface Options extends z.input<OptionsSchemaType> {}
export interface EffectiveOptions extends z.infer<OptionsSchemaType> {}
export interface EffectiveCollectionOptions
  extends Omit<EffectiveOptions, "collections"> {
  collectionName: string;
}
export type ValidateOptions = (
  options: Options | null | undefined,
) => EffectiveOptions;
export type CollectionConfigSchemaType = typeof CollectionConfigSchema;
export interface CollectionConfig extends z.input<CollectionConfigSchemaType> {}
export type MergeCollectionOptions = (
  collectionName: string,
  options: EffectiveOptions,
) => EffectiveCollectionOptions;
