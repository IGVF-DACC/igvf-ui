// node_modules
import _ from "lodash";
// root
import {
  AnalysisStepObject,
  AnalysisStepVersionObject,
  DatabaseObject,
  DocumentObject,
  PageObject,
  PublicationObject,
} from "../globals";

export interface WorkflowObject extends DatabaseObject {
  aliases?: string[];
  analysis_step_versions?: string[] | AnalysisStepVersionObject[];
  analysis_steps?: string[] | AnalysisStepObject[];
  description?: string;
  documents?: string[] | DocumentObject[];
  name: string;
  notes?: string;
  publications?: string[] | PublicationObject[];
  source_url: string;
  standards_page?: string | PageObject;
  uniform_pipeline?: boolean;
  workflow_repositories?: string[];
  workflow_version?: string;
}

/**
 * Generate a text title for a workflow object, including its name and version number if available.
 * Compare with `<WorkflowTitle>` that generates a React element for the title including a styled
 * version number.
 * @param workflow - Workflow object to generate a text title for
 * @returns Title text and version number if available as a string
 */
export function workflowTextTitle(workflow: WorkflowObject): string {
  return [workflow.name, workflow.workflow_version].filter(Boolean).join(" ");
}

/**
 * Type guard to check if the given analysis step versions array exists and has an array of
 * objects (after indexing) instead of an array of strings (before indexing has completed).
 *
 * @param versions - Analysis Step Versions array to check
 * @returns True if the array is valid and indexed, false otherwise
 */
export function hasIndexedVersions(
  versions: AnalysisStepVersionObject[] | string[] | undefined
): versions is AnalysisStepVersionObject[] {
  return (
    Array.isArray(versions) &&
    versions.length > 0 &&
    typeof versions[0] !== "string" &&
    "workflows" in versions[0]
  );
}

/**
 * Type guard to check if the given workflows array exists and has an array of objects (after
 * indexing) instead of an array of strings (before indexing has completed). You can also pass
 * `undefined` to this function, which returns false.
 *
 * @param workflows - Workflows array to check
 * @returns True if the array is valid and indexed, false otherwise
 */
export function hasIndexedWorkflows(
  workflows: WorkflowObject[] | string[] | undefined
): workflows is WorkflowObject[] {
  return (
    Array.isArray(workflows) &&
    workflows.length > 0 &&
    typeof workflows[0] !== "string" &&
    "name" in workflows[0]
  );
}

/**
 * Sort and de-duplicate an array of Workflow objects.
 *
 * @param workflows - Array of Workflow objects to de-duplicate and sort
 * @returns De-duplicated and sorted array of Workflow objects
 */
export function sortUniqueWorkflows(
  workflows: WorkflowObject[]
): WorkflowObject[] {
  return _.chain(workflows)
    .uniqBy("@id")
    .sortBy((workflow) => workflow.name?.toLowerCase() || "zzz")
    .value();
}

/**
 * Get all the workflow objects in all the analysis step versions embedded in the given analysis
 * step, and return a de-duplicated array of those workflow objects.
 *
 * @param analysisStep - Analysis Step object to find related workflows for
 * @returns Array of Workflow objects that the given Analysis Step includes
 */
export function getAnalysisStepWorkflows(
  analysisStep: AnalysisStepObject
): WorkflowObject[] {
  let workflows: WorkflowObject[] = [];
  if (hasIndexedVersions(analysisStep.analysis_step_versions)) {
    workflows = analysisStep.analysis_step_versions.reduce((acc, version) => {
      if (hasIndexedWorkflows(version.workflows)) {
        return [...acc, ...version.workflows];
      }
      return acc;
    }, [] as WorkflowObject[]);

    // De-duplicate workflows that have the same @id, then sort them by name case-insensitively.
    workflows = sortUniqueWorkflows(workflows);
  }
  return workflows;
}
