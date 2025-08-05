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
