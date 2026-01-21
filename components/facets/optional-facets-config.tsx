// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import { CheckBadgeIcon, XCircleIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import { useState } from "react";
// components
import Checkbox from "../checkbox";
import { Button, ButtonAsLink } from "../form-elements";
import Icon from "../icon";
import Modal from "../modal";
// lib
import { loginAuthProvider } from "../../lib/authentication";
import { type OptionalFacetsConfigForType } from "../../lib/facets";
// root
import type { SearchResultsFacet } from "../../globals";

/**
 * Wrap each section of checkboxes within the checkbox area.
 */
function CheckboxSection({ children }: { children: React.ReactNode }) {
  return <fieldset data-testid="facet-checkboxes">{children}</fieldset>;
}

/**
 * Display the optional facets configuration modal.
 *
 * @param visibleOptionalFacets - The currently visible optional facets configuration
 * @param allFacets - All facets that would be displayed with no selected facet terms
 * @param onSave - Function called when the user saves the new configuration
 * @param onClose - Function called when the modal is closed
 * @param isAuthenticated - True if the user is authenticated
 */
export function OptionalFacetsConfigModal({
  visibleOptionalFacets,
  allFacets,
  onSave,
  onClose,
}: {
  visibleOptionalFacets: OptionalFacetsConfigForType;
  allFacets: SearchResultsFacet[];
  onSave: (newConfig: OptionalFacetsConfigForType) => void;
  onClose: () => void;
}) {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  // Tracks the optional facet config being modified in the modal.
  const [dynamicConfig, setDynamicConfig] =
    useState<OptionalFacetsConfigForType>(visibleOptionalFacets);

  // Get only the optional facets for all facets available for the current type.
  const optionalFacets = allFacets.filter((facet) => facet.optional);

  // Group each optional facet by their category and sort case insensitively. Any without
  // `category` go into "Other" and get sorted last.
  const groupedOptionalFacets = _.groupBy(
    optionalFacets,
    (facet) => facet.category || "z"
  );
  const sortedGroupNames = _.sortBy(
    Object.keys(groupedOptionalFacets),
    (name) => name.toLowerCase()
  );

  // Called when a field checkbox is clicked to add or remove it from the config.
  function onFieldClick(field: string) {
    let newConfig: OptionalFacetsConfigForType = [];
    if (dynamicConfig.includes(field)) {
      // Remove the field from the config.
      newConfig = dynamicConfig.filter((newField) => newField !== field);
    } else {
      // Add the field to the config.
      newConfig = [...dynamicConfig, field];
    }
    setDynamicConfig(newConfig);
  }

  // Render the modal if it is open. Don't just rely on the `isOpen` prop `Modal` because `Modal`
  // renders the contents even if `isOpen` is false.
  return (
    <Modal isOpen onClose={onClose}>
      <Modal.Header onClose={() => onClose()}>
        <div>
          Configure Optional Filters
          <div className="text-sm font-normal text-neutral-500">
            {isAuthenticated ? (
              `Selections sync to other browsers and devices on which you have signed in.`
            ) : (
              <div>
                Selections saved in this browser while signed out.{" "}
                <ButtonAsLink
                  onClick={() => {
                    void loginAuthProvider(loginWithRedirect);
                  }}
                >
                  Sign in
                </ButtonAsLink>{" "}
                to sync across browser and devices.
              </div>
            )}
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="my-2 grid gap-x-4 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedGroupNames.length === 0 && (
          <p className="col-span-full text-center">
            <i>No optional facets available.</i>
          </p>
        )}
        {sortedGroupNames.map((category) => (
          <div key={category} className="rounded-sm px-2 py-0">
            <h3 className="border-optional-facet-config-divider text-optional-facet-config-header border-b-2 font-semibold">
              {category !== "z" ? category : "Other"}
            </h3>
            <CheckboxSection>
              {groupedOptionalFacets[category].map((facet) => (
                <Checkbox
                  id={facet.field}
                  key={facet.field}
                  name={facet.title}
                  checked={dynamicConfig.includes(facet.field)}
                  onClick={() => onFieldClick(facet.field)}
                >
                  {facet.title}
                </Checkbox>
              ))}
            </CheckboxSection>
          </div>
        ))}
      </Modal.Body>

      <Modal.Footer>
        <div className="flex w-full items-center justify-between gap-1">
          <Button
            id="clear-optional-facets-modal-button"
            type="secondary"
            className="flex items-center gap-1"
            onClick={() => setDynamicConfig([])}
          >
            <Icon.Eraser />
            Clear All
          </Button>
          <div className="flex gap-1">
            <Button
              id="close-optional-facets-modal-button"
              type="secondary"
              className="gap-1"
              onClick={() => onClose()}
            >
              <XCircleIcon />
              Close
            </Button>
            <Button
              id="save-optional-facets-modal-button"
              type="primary"
              className="gap-1"
              onClick={() => onSave(dynamicConfig)}
            >
              <CheckBadgeIcon />
              Save
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
