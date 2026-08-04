/**
 * Possible statuses for the uniform pipeline. Update if the `uniform_pipeline_status` enum in the
 * schema changes. Keep `fallback` as the last option to handle unexpected values.
 */
export type UniformPipelineStatusValues =
  "completed" | "error" | "preprocessing" | "processing" | "fallback";
