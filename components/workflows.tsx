// components
import { VersionNumber } from "./version-number";
// root
import { WorkflowObject } from "../globals";

/**
 * Display the title of a workflow, including its name and version number if available.
 * @param workflow - Workflow object to display the title for
 */
export function WorkflowTitle({ workflow }: { workflow: WorkflowObject }) {
  return (
    <span className="inline-flex items-baseline gap-2">
      {workflow.name}
      {workflow.workflow_version && (
        <VersionNumber version={workflow.workflow_version} />
      )}
    </span>
  );
}
