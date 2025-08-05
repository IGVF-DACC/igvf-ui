// node_modules
import _ from "lodash";
// components
import {
  CollapseControlVertical,
  useCollapseControl,
} from "./collapse-control";
import { UniformlyProcessedBadge } from "./common-pill-badges";
import Link from "./link-no-prefetch";
import { VersionNumber } from "./version-number";
// root
import { type WorkflowObject } from "../lib/workflow";

/**
 * Display the title of a workflow, including its name and version number if available. The version
 * number uses the standard version-number style for the site. Compare with `workflowTextTitle()`
 * that generates a text string for both the name and version number.
 * @param workflow - Workflow object to display the title for
 */
export function WorkflowTitle({ workflow }: { workflow: WorkflowObject }) {
  return (
    <span>
      {workflow.name}
      {workflow.workflow_version && (
        <>
          {" "}
          <VersionNumber version={workflow.workflow_version} />
        </>
      )}
    </span>
  );
}

/**
 * Display a list of workflows, sorted by name. Each workflow is displayed as a link to its
 * object page, with the workflow name and version number if available. If there are more than
 * a certain number of workflows, only the first few are displayed, with a collapse control
 * to show or hide the rest.
 * @param workflows - Workflow objects to display
 */
export function WorkflowList({ workflows }: { workflows: WorkflowObject[] }) {
  const sortedWorkflows = _.sortBy(workflows, (workflow) =>
    workflow.name.toLowerCase()
  );
  const collapser = useCollapseControl(sortedWorkflows);

  if (sortedWorkflows.length > 0) {
    return (
      <div>
        <ul className="min-w-50">
          {collapser.items.map((workflow) => (
            <li
              key={workflow["@id"]}
              className="my-2 block first:mt-0 last:mb-0"
            >
              <Link
                href={workflow["@id"]}
                className="mr-1 inline-block"
                aria-label={`View workflow ${workflow.name}${
                  workflow.workflow_version
                    ? ` version ${workflow.workflow_version}`
                    : ""
                }`}
              >
                {workflow.name}
              </Link>
              <div className="inline-flex whitespace-nowrap">
                {workflow.workflow_version && (
                  <VersionNumber version={workflow.workflow_version} />
                )}
                {workflow.uniform_pipeline && (
                  <UniformlyProcessedBadge
                    className="ml-1 inline-block align-middle"
                    isAbbreviated
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
        {collapser.isCollapseControlVisible && (
          <div className="mt-2">
            <CollapseControlVertical
              length={sortedWorkflows.length}
              isCollapsed={collapser.isCollapsed}
              setIsCollapsed={collapser.setIsCollapsed}
            />
          </div>
        )}
      </div>
    );
  }
}
