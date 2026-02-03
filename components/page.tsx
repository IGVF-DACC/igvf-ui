/**
 * The components represents a full Page object as well as the components to edit the page. It
 * doesn't get included under the `pages` directory because the path likely doesn't include
 * `/pages/`. So `getServerSideProps` has already executed under [path].js, and <Page> in this file
 * gets executed rather than the fallback component because of the Page object's @type.
 */

// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  EyeIcon,
} from "@heroicons/react/20/solid";
import _ from "lodash";
import { useRouter } from "next/router";
import {
  createContext,
  memo,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
// components
import Breadcrumbs from "./breadcrumbs";
import { DataPanel } from "./data-area";
import FlashMessage from "./flash-message";
import {
  AttachedButtons,
  Button,
  ButtonLink,
  ListSelect,
  Select,
  TextField,
} from "./form-elements";
import MarkdownSection from "./markdown-section";
import Modal from "./modal";
import PageComponent from "./page-component";
import PagePreamble from "./page-preamble";
import SessionContext from "./session-context";
// lib
import FetchRequest, { ErrorObject } from "../lib/fetch-request";
import {
  detectConflictingName,
  getPageTitleAndCodes,
  rewriteBlockIds,
  savePage,
  sliceBlocks,
  type PageLayoutComponent,
  type PageMeta,
  type PageObject,
  type WritingDirection,
} from "../lib/page";
// root
import type { AwardObject, DataProviderObject, LabObject } from "../globals";

/**
 * Page metadata reducer action codes.
 */
const PAGE_META = {
  AWARD: "award",
  LAB: "lab",
  NAME: "name",
  PARENT: "parent",
  STATUS: "status",
  TITLE: "title",
} as const;

/**
 * Live block reducer operation types. Placed in the action.type property.
 */
const LIVE_BLOCK = {
  UPDATE: "update",
  ADD_ABOVE: "add_above",
  ADD_BELOW: "add_below",
  DELETE: "delete",
} as const;

/**
 * Types of each block; either Markdown or for a React component.
 */
const BLOCK_TYPE = {
  MARKDOWN: "markdown",
  COMPONENT: "component",
} as const;

/**
 * Maximum number of blocks the front end allows on a page.
 */
const MAX_BLOCKS = 20;

/**
 * Action type for the page metadata reducer.
 *
 * @property type - Metadata field to update (one of the PAGE_META constants)
 * @property value - New value for the metadata field
 */
type PageMetaAction = {
  type: (typeof PAGE_META)[keyof typeof PAGE_META];
  value: string;
};

/**
 * Action type for the live blocks reducer.
 *
 * @property type - Operation to perform on the blocks (one of the LIVE_BLOCK constants)
 * @property blockId - ID of the block to update, add above/below, or delete
 * @property content - Content of the block to update or add
 */
type BlockAction = {
  type: (typeof LIVE_BLOCK)[keyof typeof LIVE_BLOCK];
  blockId: string;
  blockType?: (typeof BLOCK_TYPE)[keyof typeof BLOCK_TYPE];
  direction?: WritingDirection;
  content?: string;
};

/**
 * Initializes a new block within a page.
 */
const initialBlock: PageLayoutComponent = {
  "@id": "#block1",
  "@type": BLOCK_TYPE.MARKDOWN,
  body: "",
  direction: "ltr",
};
Object.freeze(initialBlock);

/**
 * Page object content for new pages.
 */
const initialPage: PageObject = {
  "@id": "",
  "@type": ["Page", "Item"],
  name: "",
  title: "",
  status: "in progress",
  layout: {
    blocks: [{ ...initialBlock }],
  },
};
Object.freeze(initialPage);
Object.freeze(initialPage.layout);
Object.freeze(initialPage.layout.blocks);

/**
 * Tracks any errors in the page editor that prevent saving the page.
 */
const EditorValidation = createContext<{
  isValidationError: boolean;
  setValidationError: (isValidationError: boolean) => void;
}>({
  isValidationError: false,
  setValidationError: () => {},
});

/**
 * Tracks the condition of the page overall.
 */
const PageCondition = createContext<{
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
  isNewPage: boolean;
}>({
  isDirty: false,
  setDirty: () => {},
  isNewPage: false,
});

/**
 * Shows the button to trigger editing the page.
 *
 * @param href - URL of the page to edit
 */
function EditPageTrigger({ href }: { href: string }) {
  return (
    <div className="mb-1 flex justify-end">
      <ButtonLink href={`${href}#!edit`} type="secondary" size="sm">
        Edit Page
      </ButtonLink>
    </div>
  );
}

/**
 * Manages a form to edit the page metadata, e.g. awards and labs. Memoize this component so that
 * it only gets rendered when a change is made to the metadata form, not when the user edits the
 * text blocks -- this component is a little heavy.
 *
 * @param livePageMeta - All the page metadata states this component can update with user action
 * @param dispatchLivePageMeta - Dispatches actions to update the page metadata states
 * @param awards - All awards currently in the database
 * @param labs - All labs currently in the database
 * @param pages - All pages currently in the database
 */
const PageMetaEditor = memo(function PageMetaEditor({
  livePageMeta,
  dispatchLivePageMeta,
  awards,
  labs,
  pages,
}: {
  livePageMeta: PageMeta;
  dispatchLivePageMeta: React.Dispatch<PageMetaAction>;
  awards: AwardObject[];
  labs: LabObject[];
  pages: PageObject[];
}) {
  // Filter text for the parent page list
  const [parentFilter, setParentFilter] = useState("");
  // Filter text for the award list
  const [awardFilter, setAwardFilter] = useState("");
  // Filter text for the lab list
  const [labFilter, setLabFilter] = useState("");

  function onFilterChange(
    setFilter: React.Dispatch<React.SetStateAction<string>>,
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setFilter(event.target.value.toLowerCase());
  }

  // True if the live page name conflicts with an existing one
  const [isNameConflicting, setNameConflicting] = useState(
    detectConflictingName(livePageMeta.name, pages)
  );
  // True if the live page name is empty
  const [isNameEmpty, setNameEmpty] = useState(!livePageMeta.name);
  // True if the live page title is empty
  const [isTitleEmpty, setTitleEmpty] = useState(false);

  const { isDirty, setDirty } = useContext(PageCondition);
  const { setValidationError } = useContext(EditorValidation);
  const className = "my-4 md:grow md:basis-[calc(50%-1rem)]";

  /**
   * Called whenever the user changes anything about the page metadata. Individual keystrokes in
   * the form fields trigger this function. You normally call this through the shortcuts functions
   * below. Also sets the dirty flag.
   *
   * @param type - Type code for metadata property to update
   * @param value - New value the user set for the metadata property
   */
  function setLivePageMeta(
    type: (typeof PAGE_META)[keyof typeof PAGE_META],
    value: string
  ) {
    dispatchLivePageMeta({ type, value });
    setDirty(true);
  }

  // Shortcuts to call the reducers for page metadata.
  function setPageMetaName(value: string) {
    setLivePageMeta(PAGE_META.NAME, value);
  }
  function setPageMetaTitle(value: string) {
    setLivePageMeta(PAGE_META.TITLE, value);
  }
  function setPageMetaStatus(value: string) {
    setLivePageMeta(PAGE_META.STATUS, value);
  }
  function setPageMetaParent(value: string) {
    setLivePageMeta(PAGE_META.PARENT, value);
  }
  function setPageMetaAward(value: string) {
    setLivePageMeta(PAGE_META.AWARD, value);
  }
  function setPageMetaLab(value: string) {
    setLivePageMeta(PAGE_META.LAB, value);
  }

  useEffect(() => {
    // Let the <PageEditor> component know if we detected conditions that prevent saving the page.
    setValidationError(isNameConflicting || isNameEmpty || isTitleEmpty);
  }, [isNameConflicting, isNameEmpty, isTitleEmpty, setValidationError]);

  /**
   * Updates the `pageMeta` name property to track text field changes for the Name field. Allows
   * only characters that are valid in a URL path.
   *
   * @param event - React synthetic event object for text field changes
   */
  function setNameField(event: React.ChangeEvent<HTMLInputElement>) {
    const validPath = event.target.value.toLowerCase().replace(/\W+/g, "-");
    setPageMetaName(validPath);
    setNameConflicting(detectConflictingName(validPath, pages));
    setNameEmpty(!event.target.value);
  }

  /**
   * Updates the `pageMeta` title property to track text field changes for the Title field.
   *
   * @param event - React synthetic event object for text field changes
   */
  function setTitleField(event: React.ChangeEvent<HTMLInputElement>) {
    setPageMetaTitle(event.target.value);
    setTitleEmpty(!event.target.value);
  }

  // Determine the messages to display under the name and title fields.
  let nameFieldMessage = "";
  if (isNameEmpty && isDirty) {
    nameFieldMessage = "Field is required";
  } else if (isNameConflicting) {
    nameFieldMessage = "Name conflicts with an existing page";
  }
  const titleFieldMessage = isTitleEmpty ? "Field is required" : "";

  // Sort the page array by @id.
  const filteredPages = _.sortBy(pages, (page) => page["@id"]).filter((page) =>
    page["@id"].includes(parentFilter)
  );
  const filteredAwards = _.sortBy(awards, (award) => award.name).filter(
    (award) => award.name.toLowerCase().includes(awardFilter)
  );
  const filteredLabs = _.sortBy(labs, (lab) => lab.title).filter((lab) =>
    lab.title.toLowerCase().includes(labFilter)
  );

  return (
    <>
      <div className="md:flex md:flex-wrap md:gap-4">
        <div className={className}>
          <TextField
            label="Name"
            name="name"
            value={livePageMeta.name}
            isSpellCheckDisabled
            placeholder="last-part-of-path"
            message={nameFieldMessage}
            onChange={setNameField}
            className="my-2"
            isRequired
          />
          <TextField
            label="Title"
            name="title"
            value={livePageMeta.title}
            placeholder="Appears at the top of the page"
            message={titleFieldMessage}
            onChange={setTitleField}
            className="my-2"
            isRequired
          />
          <Select
            label="Status"
            name="status"
            value={livePageMeta.status}
            onChange={(event) => setPageMetaStatus(event.target.value)}
          >
            <option value="released">Released</option>
            <option value="in progress">In Progress</option>
            <option value="deleted">Deleted</option>
          </Select>
        </div>
        <div className={className}>
          <ListSelect
            label="Parent"
            value={livePageMeta.parent}
            onChange={setPageMetaParent}
            className="[&>div]:max-h-56"
            filter={parentFilter}
            onFilterChange={(event) => onFilterChange(setParentFilter, event)}
          >
            {filteredPages.length > 0 ? (
              filteredPages.map((page) => {
                return (
                  <ListSelect.Option
                    key={page["@id"]}
                    id={page["@id"]}
                    label={page.name}
                  >
                    <div className="text-left">{page["@id"]}</div>
                  </ListSelect.Option>
                );
              })
            ) : (
              <ListSelect.Message>
                No parent pages match the filter
              </ListSelect.Message>
            )}
          </ListSelect>
        </div>
      </div>
      <div className="md:flex md:flex-wrap md:gap-4">
        <div className={className}>
          <ListSelect
            label="Award"
            value={livePageMeta.award}
            onChange={setPageMetaAward}
            className="[&>div]:max-h-52"
            filter={awardFilter}
            onFilterChange={(event) => onFilterChange(setAwardFilter, event)}
          >
            {filteredAwards.length > 0 ? (
              filteredAwards.map((award) => {
                return (
                  <ListSelect.Option
                    key={award["@id"]}
                    id={award["@id"]}
                    label={award.name}
                  >
                    <div className="text-left">{award.name}</div>
                  </ListSelect.Option>
                );
              })
            ) : (
              <ListSelect.Message>
                No awards match the filter
              </ListSelect.Message>
            )}
          </ListSelect>
        </div>
        <div className={className}>
          <ListSelect
            label="Lab"
            value={livePageMeta.lab}
            onChange={setPageMetaLab}
            className="[&>div]:max-h-52"
            filter={labFilter}
            onFilterChange={(event) => onFilterChange(setLabFilter, event)}
          >
            {filteredLabs.length > 0 ? (
              filteredLabs.map((lab) => {
                return (
                  <ListSelect.Option
                    key={lab["@id"]}
                    id={lab["@id"]}
                    label={lab.title}
                  >
                    <div className="text-left">{lab.title}</div>
                  </ListSelect.Option>
                );
              })
            ) : (
              <ListSelect.Message>No labs match the filter</ListSelect.Message>
            )}
          </ListSelect>
        </div>
      </div>
    </>
  );
});

/**
 * Handles the editing of one block from the page, including its text and type. This component
 * displays the live text content of one editable block, though its contents are held by
 * <PageEditor> state.
 *
 * @param block - Block of text to edit
 * @param dispatchLiveBlocks - Dispatches actions to update the live blocks state
 * @param previewedBlockIds - `@ids` of blocks that are currently being previewed
 */
function BlockEditor({
  block,
  dispatchLiveBlocks,
  previewedBlockIds,
}: {
  block: PageLayoutComponent;
  dispatchLiveBlocks: React.Dispatch<BlockAction>;
  previewedBlockIds: string[];
}) {
  const { setDirty } = useContext(PageCondition);
  const isBlockInPreviewMode = previewedBlockIds.includes(block["@id"]);

  if (isBlockInPreviewMode) {
    return (
      <MarkdownSection
        direction={block.direction}
        className="border-panel bg-panel h-96 w-full overflow-y-auto border p-2"
      >
        {block.body}
      </MarkdownSection>
    );
  }

  return (
    <textarea
      className="border-form-element bg-form-element block h-96 w-full border p-2 font-mono text-sm"
      id={block["@id"].substring(1)}
      value={block.body}
      dir={block.direction}
      spellCheck={block["@type"] === BLOCK_TYPE.MARKDOWN}
      aria-label={`Edit ${block["@type"]} block`}
      onChange={(event) => {
        dispatchLiveBlocks({
          type: LIVE_BLOCK.UPDATE,
          blockId: block["@id"],
          content: event.target.value,
        });
        setDirty(true);
      }}
    />
  );
}

/**
 * Displays the two text direction buttons and handles clicks in them.
 *
 * @param direction - Current text direction of the block
 * @param disabled - True if the buttons are disabled
 * @param onBlockDirectionChange - Called when the user chooses a new text direction for the block
 */
function TextDirectionSwitch({
  direction,
  disabled,
  onBlockDirectionChange,
}: {
  direction: WritingDirection;
  disabled: boolean;
  onBlockDirectionChange: (direction: WritingDirection) => void;
}) {
  const iconClassName = `h-4 w-4${
    disabled
      ? " fill-gray-400 dark:fill-gray-600"
      : " fill-black dark:fill-white"
  }`;

  /**
   * Called when the user clicks the left-to-right or right-to-left text direction buttons.
   *
   * @param newDirection - "ltr" or "rtl"
   */
  function onDirectionClick(newDirection: WritingDirection) {
    if (newDirection !== direction) {
      onBlockDirectionChange(newDirection);
    }
  }

  return (
    <div className="flex">
      <AttachedButtons>
        <Button
          onClick={() => onDirectionClick("ltr")}
          type={direction === "ltr" ? "selected" : "secondary"}
          isDisabled={disabled}
          label="Left-to-right language text direction"
          hasIconOnly
        >
          <Bars3BottomLeftIcon className={iconClassName} />
        </Button>
        <Button
          onClick={() => onDirectionClick("rtl")}
          type={direction === "rtl" ? "selected" : "secondary"}
          isDisabled={disabled}
          label="Right-to-left language text direction"
          hasIconOnly
        >
          <Bars3BottomRightIcon className={iconClassName} />
        </Button>
      </AttachedButtons>
    </div>
  );
}

/**
 * Display the Delete Block button and handle the modal confirmation.
 *
 * @param onDelete - Called if the user confirms the deletion of the block
 */
function DeleteBlockTrigger({ onDelete }: { onDelete: () => void }) {
  // True if the Delete warning modal is open
  const [isOpen, setOpen] = useState(false);

  /**
   * Called when the user confirms the deletion of the block.
   */
  function handleDeleteClick() {
    setOpen(false);
    onDelete();
  }

  return (
    <>
      <Button
        type="warning"
        label="Delete block"
        className="grow"
        onClick={() => setOpen(true)}
      >
        Delete Block
      </Button>
      <Modal isOpen={isOpen} onClose={() => setOpen(false)}>
        <Modal.Header onClose={() => setOpen(false)}>Delete Block</Modal.Header>
        <Modal.Body>
          <div className="prose dark:prose-invert">
            <p className="py-4">
              Deleting this block loses its contents unless you cancel all
              changes to this page.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button type="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="warning"
            id="confirm-delete-block"
            onClick={handleDeleteClick}
          >
            Delete Block
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

/**
 * Displays the controls below each block to set the block's type, preview the block, etc.
 *
 * @param block - Block being edited
 * @param dispatchLiveBlocks - Dispatches actions to update the live blocks state
 * @param blocks - All blocks on the page as edited
 * @param previewedBlockIds - `@ids` of all blocks currently in preview mode
 * @param onPreview - Called when the user clicks the preview button
 */
function BlockControls({
  block,
  dispatchLiveBlocks,
  blocks,
  previewedBlockIds,
  onPreview,
}: {
  block: PageLayoutComponent;
  dispatchLiveBlocks: React.Dispatch<BlockAction>;
  blocks: PageLayoutComponent[];
  previewedBlockIds: string[];
  onPreview: (blockId: string, preview: boolean) => void;
}) {
  const isBlockPreviewed = previewedBlockIds.includes(block["@id"]);
  const { setDirty } = useContext(PageCondition);

  /**
   * Called when the user changes the type of a block between Markdown and Component.
   * @param {object} event React synthetic event
   */
  function onBlockTypeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    dispatchLiveBlocks({
      type: LIVE_BLOCK.UPDATE,
      blockId: block["@id"],
      blockType: event.target
        .value as (typeof BLOCK_TYPE)[keyof typeof BLOCK_TYPE],
    });
    setDirty(true);

    // Blocks transitioning to a component type should have preview mode turned off.
    if (event.target.value === BLOCK_TYPE.COMPONENT) {
      onPreview(block["@id"], false);
    }
  }

  /**
   * Gets called when the user selects a new language text direction (left-to-right or right-to-
   * left) for the block.
   * @param {string} direction Whether to have the "ltr" or "rtl" text direction
   */
  function onBlockDirectionChange(direction: WritingDirection) {
    dispatchLiveBlocks({
      type: LIVE_BLOCK.UPDATE,
      blockId: block["@id"],
      direction,
    });
    setDirty(true);
  }

  return (
    <div className="mt-1 lg:flex lg:items-start lg:justify-between">
      <div className="flex gap-1">
        <Select
          name={`${block["@id"].substring(1)}-type`}
          value={block["@type"]}
          onChange={onBlockTypeChange}
        >
          <option value={BLOCK_TYPE.MARKDOWN}>Markdown</option>
          <option value={BLOCK_TYPE.COMPONENT}>Component</option>
        </Select>
        {block["@type"] === BLOCK_TYPE.MARKDOWN && (
          <>
            <TextDirectionSwitch
              direction={block.direction}
              disabled={isBlockPreviewed}
              onBlockDirectionChange={onBlockDirectionChange}
            />
            <Button
              type={isBlockPreviewed ? "selected" : "secondary"}
              onClick={() => onPreview(block["@id"], !isBlockPreviewed)}
              label="Preview markdown"
              hasIconOnly
            >
              <EyeIcon />
            </Button>
          </>
        )}
      </div>
      <div className="mt-1 flex gap-1 lg:mt-0">
        {blocks.length < MAX_BLOCKS && (
          <>
            <Button
              className="grow"
              label="Add block above this block"
              onClick={() => {
                dispatchLiveBlocks({
                  type: LIVE_BLOCK.ADD_ABOVE,
                  blockId: block["@id"],
                });
                setDirty(true);
              }}
            >
              Add Block Above <ArrowUturnLeftIcon className="ml-2 h-4 w-4" />
            </Button>
            <Button
              className="grow"
              label="Add block below this block"
              onClick={() => {
                dispatchLiveBlocks({
                  type: LIVE_BLOCK.ADD_BELOW,
                  blockId: block["@id"],
                });
                setDirty(true);
              }}
            >
              Add Block Below{" "}
              <ArrowUturnRightIcon className="ml-2 h-4 w-4 rotate-180" />
            </Button>
          </>
        )}
        {blocks.length > 1 && (
          <DeleteBlockTrigger
            onDelete={() => {
              dispatchLiveBlocks({
                type: LIVE_BLOCK.DELETE,
                blockId: block["@id"],
              });
              setDirty(true);
            }}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Called on every user edit of any block. Updates the live blocks state with the new text or
 * setting.
 *
 * @param state - Live blocks state containing the current text content of each block
 * @param action - Action to update the live blocks state
 * @param action.type - Type of operation; update, insert, delete
 * @param action.blockId - ID of the block to update, delete, or insert before
 * @param action.blockType - Type of block; Markdown, Component
 * @param action.content - New text content for the block
 * @returns The updated live blocks state
 */
function reducerLiveBlocks(state: PageLayoutComponent[], action: BlockAction) {
  const updatedState = [...state];

  switch (action.type) {
    case LIVE_BLOCK.UPDATE:
      // Update the content or type of the block.
      {
        const updatedBlock = updatedState.find(
          (block) => block["@id"] === action.blockId
        );
        if (updatedBlock) {
          if (action.content !== undefined) {
            updatedBlock.body = action.content;
          } else if (action.blockType) {
            updatedBlock["@type"] = action.blockType;
          } else if (action.direction) {
            updatedBlock.direction = action.direction;
          }
        }
      }
      break;
    case LIVE_BLOCK.ADD_ABOVE:
    case LIVE_BLOCK.ADD_BELOW:
      {
        const index = updatedState.findIndex(
          (block) => block["@id"] === action.blockId
        );
        if (index !== -1) {
          if (action.type === LIVE_BLOCK.ADD_ABOVE) {
            // Insert `initialBlock` above the block with the given ID.
            updatedState.splice(index, 0, { ...initialBlock });
          } else {
            // Insert `newBlock` below the block with the given ID.
            updatedState.splice(index + 1, 0, { ...initialBlock });
          }
          rewriteBlockIds(updatedState);
        }
      }
      break;
    case LIVE_BLOCK.DELETE:
      {
        const index = updatedState.findIndex(
          (block) => block["@id"] === action.blockId
        );
        if (index !== -1) {
          updatedState.splice(index, 1);
          rewriteBlockIds(updatedState);
        }
      }
      break;
    default:
      break;
  }
  return updatedState;
}

/**
 * Updates the page metadata when changed by the user in the metadata form.
 *
 * @param state - The current page metadata states
 * @param action - Page metadata property to update and its new value
 * @param action.type - Metadata property to update
 * @param action.value - New value for the metadata property
 * @returns Copy of the current page metadata states with the new property value
 */
function reducerLivePageMeta(
  state: PageMeta,
  action: PageMetaAction
): PageMeta {
  const newLivePageMeta = { ...state };
  newLivePageMeta[action.type] = action.value;
  return newLivePageMeta;
}

/**
 * Displays the page editor with multiple blocks of text and the page metadata.
 *
 * @param blocks - Blocks of text to edit
 * @param pageMeta - Page metadata states
 * @param awards - All awards currently in the database
 * @param labs - All labs currently in the database
 * @param pages - All pages currently in the database
 * @param onClose - Called when the user clicks Cancel or Save;
 */
function PageEditor({
  blocks,
  pageMeta,
  awards,
  labs,
  pages,
  onClose,
}: {
  blocks: PageLayoutComponent[];
  pageMeta: PageMeta;
  awards: AwardObject[];
  labs: LabObject[];
  pages: PageObject[];
  onClose: (
    savedData: {
      blocks: PageLayoutComponent[];
      pageMeta: PageMeta;
    } | null
  ) => void;
}) {
  // Copy of blocks but containing the live editable text content of each block.
  const [liveBlocks, dispatchLiveBlocks] = useReducer(
    reducerLiveBlocks,
    [],
    () => sliceBlocks(blocks)
  );
  // Page metadata state, modified by the page meta editor.
  const [livePageMeta, dispatchLivePageMeta] = useReducer(reducerLivePageMeta, {
    award: pageMeta.award || "",
    lab: pageMeta.lab || "",
    name: pageMeta.name,
    parent: pageMeta.parent || "",
    status: pageMeta.status || "",
    title: pageMeta.title,
  });
  // True if an error condition preventing saving the page exists.
  const [isValidationError, setValidationError] = useState(false);
  // List of block @ids currently in preview mode.
  const [previewedBlockIds, setPreviewedBlockIds] = useState([]);

  const router = useRouter();
  const { isDirty } = useContext(PageCondition);

  // Prompt the user if they try to leave with unsaved changes
  useEffect(() => {
    const warningText =
      "You have unsaved changes. Are you sure you wish to leave this page?";

    // Use the built-in browser alert to handle warning before reloading the page.
    function handleWindowClose(e) {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = warningText;
        return e.returnValue;
      }
    }

    window.addEventListener("beforeunload", handleWindowClose);
    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
    };
  }, [isDirty, router.events, router.isReady]);

  /**
   * Called to set whether a block goes into or out of preview mode.
   *
   * @param blockId - `@id` of the block being toggled between preview and edit mode
   * @param isPreviewMode - True to set the block preview mode, false to set the edit mode
   */
  function onPreview(blockId: string, isPreviewMode: boolean) {
    if (isPreviewMode) {
      setPreviewedBlockIds([...previewedBlockIds, blockId]);
    } else {
      setPreviewedBlockIds(previewedBlockIds.filter((id) => id !== blockId));
    }
  }

  useEffect(() => {
    // If the user deletes or adds a block, disable all preview modes because the block @ids
    // change when this happens.
    setPreviewedBlockIds([]);
  }, [liveBlocks.length]);

  return (
    <EditorValidation.Provider
      value={{ isValidationError, setValidationError }}
    >
      <div className="mb-1 flex justify-end gap-1">
        <Button
          onClick={() => onClose(null)}
          type="secondary"
          label="Cancel editing page"
        >
          Cancel
        </Button>
        <Button
          isDisabled={isValidationError}
          label="Save edits to page"
          onClick={() =>
            onClose({ blocks: liveBlocks, pageMeta: livePageMeta })
          }
        >
          Save
        </Button>
      </div>
      <div className="border-panel mb-4 border-b">
        {liveBlocks.map((block) => {
          return (
            <div key={block["@id"]} className="my-10 first:mt-0">
              <BlockEditor
                block={block}
                dispatchLiveBlocks={dispatchLiveBlocks}
                previewedBlockIds={previewedBlockIds}
              />
              <BlockControls
                block={block}
                dispatchLiveBlocks={dispatchLiveBlocks}
                blocks={liveBlocks}
                previewedBlockIds={previewedBlockIds}
                onPreview={onPreview}
              />
            </div>
          );
        })}
      </div>
      <PageMetaEditor
        livePageMeta={livePageMeta}
        dispatchLivePageMeta={dispatchLivePageMeta}
        awards={awards}
        labs={labs}
        pages={pages}
      />
    </EditorValidation.Provider>
  );
}

/**
 * Copies editable metadata from the given page object so that the page editor can modify it
 * without modifying the props.
 *
 * @param page - Page object to potentially be edited
 * @returns Contains editable copies of the page's metadata
 */
function copyPageMeta(page: PageObject): PageMeta {
  return {
    award: page?.award || "",
    lab: page?.lab || "",
    name: page?.name || "",
    parent: page?.parent || "",
    status: page?.status || "",
    title: page?.title || "",
  };
}

/**
 * Displays the page content, either as the normal read-only page, or as an editable page if the
 * user has chosen to edit the page. The `page` object is the page as stored in the database, but
 * since the page can get edited, this only gets used on initial render. From then on the contents
 * of the page get displayed from the editable states to prevent the need to reload the page after
 * the user saves their edits.
 *
 * @param page - Page object as stored in the database
 * @param awards - All awards currently in the database
 * @param labs - All labs currently in the database
 * @param pages - All pages currently in the database
 * @param breadcrumbMeta - Metadata to display in the breadcrumbs
 * @param isNewPage - True if this is a new page being created, false if editing an existing page
 * @param titleDecoration - React node to display next to the page title, e.g. a badge
 */
export default function Page({
  page = initialPage,
  awards = [],
  labs = [],
  pages = [],
  breadcrumbMeta = null,
  isNewPage = false,
  titleDecoration = "",
}: {
  page: PageObject;
  awards: AwardObject[];
  labs: LabObject[];
  pages: PageObject[];
  breadcrumbMeta: { [key: string]: string } | null;
  isNewPage?: boolean;
  titleDecoration?: React.ReactNode;
}) {
  // Blocks of content; gets updated on save
  const [editableBlocks, setEditableBlocks] = useState(() =>
    sliceBlocks(page.layout.blocks)
  );
  // Page metadata; gets updated on save
  const [editablePageMeta, setEditablePageMeta] = useState(() =>
    copyPageMeta(page)
  );
  // @id of the current page; gets updated on save
  const [editablePageId, setEditablePageId] = useState(page?.["@id"] || "");
  // True if the URL ends with the string "#!edit"
  const [isEditing, setEditing] = useState(false);
  // Error message to display if a network error occurs
  const [activeError, setActiveError] = useState("");
  // True if page has unsaved changes
  const [isDirty, setDirty] = useState(false);
  // After page save, redirect to the page's @id
  const [redirectToPage, setRedirectToPage] = useState("");

  const router = useRouter();
  const { isAuthenticated } = useAuth0();
  const { session } = useContext(SessionContext);

  useEffect(() => {
    // Enable editing mode if the user is authenticated and the URL ends with "#!edit"
    if (isAuthenticated) {
      setEditing(router.asPath.endsWith("#!edit"));
      if (isNewPage) {
        setEditableBlocks(sliceBlocks(page.layout.blocks));
      }
    }
  }, [isAuthenticated, router.asPath, isNewPage, page.layout.blocks]);

  useEffect(() => {
    // Handle redirecting to a page after a save, which can change the path of the page.
    if (redirectToPage) {
      void router.push(redirectToPage);
      setRedirectToPage("");
    }
  }, [redirectToPage, router]);

  useEffect(() => {
    // When the user navigates to a new page, update the editable states to match the new page.
    setEditableBlocks(page ? sliceBlocks(page.layout.blocks) : []);
    setEditablePageMeta(copyPageMeta(page));
    setEditablePageId(page?.["@id"]);
  }, [page]);

  /**
   * Called when the user closes the editor through canceling or saving.
   * @param updates - Updated blocks and metadata after editing
   * @param updates.blocks - Updated blocks of text
   * @param updates.pageMeta - Updated page metadata
   */
  function onClose(
    updates: { blocks: PageLayoutComponent[]; pageMeta: PageMeta } | null
  ) {
    setActiveError("");
    if (updates) {
      // User clicked save, so save the blocks and metadata.
      void savePage(
        page,
        updates.blocks,
        updates.pageMeta,
        session,
        isNewPage
      ).then((updatedPageResponse) => {
        if (
          FetchRequest.isResponseSuccess(
            updatedPageResponse as unknown as DataProviderObject
          )
        ) {
          const updatedPage = updatedPageResponse as PageObject;
          setDirty(false);
          setEditableBlocks(updates.blocks);
          setEditablePageMeta(updates.pageMeta);
          setEditablePageId(updatedPage["@id"]);

          // The user can change the path to the page, so go to the returned page object's @id.
          setRedirectToPage(updatedPage["@id"]);
        } else {
          const updatedPage = updatedPageResponse as ErrorObject;
          setActiveError(
            `${updatedPage.description} The page has not been saved.`
          );
        }
      });
    } else {
      if (isNewPage) {
        void router.push("/pages");
      } else {
        // User canceled editing. Remove #!edit from the URL which disables edit mode.
        void router.push(`${router.asPath.split("#")[0]}`);
      }
    }
  }

  // Get the displayable page title.
  const { title, codes } = getPageTitleAndCodes(
    page as unknown as DataProviderObject
  );

  // Determine whether to display the page border or not.
  const isPanelHidden = codes.includes("nopanel");
  const PanelComponent = isPanelHidden ? "div" : DataPanel;

  return (
    <PageCondition.Provider value={{ isDirty, setDirty, isNewPage }}>
      <Breadcrumbs item={page} meta={breadcrumbMeta} />
      <PagePreamble pageTitle={title} isTitleHidden>
        {titleDecoration}
      </PagePreamble>
      {activeError && (
        <FlashMessage
          message={activeError}
          type="error"
          onClose={() => setActiveError("")}
        />
      )}
      {isEditing ? (
        <PageEditor
          blocks={editableBlocks}
          pageMeta={editablePageMeta}
          awards={awards}
          labs={labs}
          pages={pages.filter((page) => page["@id"] !== editablePageId)}
          onClose={onClose}
        />
      ) : (
        <>
          {isAuthenticated && <EditPageTrigger href={router.asPath} />}
          <PanelComponent>
            <div data-testid="page-blocks" id="page-content">
              {editableBlocks.map((block) => {
                if (block["@type"] === BLOCK_TYPE.MARKDOWN) {
                  return (
                    <MarkdownSection
                      key={block["@id"]}
                      direction={block.direction}
                    >
                      {block.body}
                    </MarkdownSection>
                  );
                }
                if (block["@type"] === BLOCK_TYPE.COMPONENT) {
                  return <PageComponent key={block["@id"]} spec={block.body} />;
                }
              })}
            </div>
          </PanelComponent>
        </>
      )}
    </PageCondition.Provider>
  );
}
