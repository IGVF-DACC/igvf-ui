/**
 * The components represents a full Page object as well as the components to edit the page. It
 * doesn't get included under the `pages` directory because the path likely doesn't include
 * `/pages/`. So `getServerSideProps` has already executed under [path].js, and <Page> in this file
 * gets executed rather than the fallback component because of the Page object's @type.
 */

// node_modules
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  EyeIcon,
} from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import {
  createContext,
  memo,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
// components
import { useAuthenticated } from "./authentication";
import Breadcrumbs from "./breadcrumbs";
import Button from "./button";
import { DataPanel } from "./data-area";
import FlashMessage from "./flash-message";
import { Select, TextField } from "./form";
import ListSelect from "./list-select";
import Markdown from "./markdown";
import Modal from "./modal";
import PageComponent from "./page-component";
import PagePreamble from "./page-preamble";
import SessionContext from "./session-context";
// lib
import FetchRequest from "../lib/fetch-request";
import {
  detectConflictingName,
  savePage,
  rewriteBlockIds,
  sliceBlocks,
} from "../lib/page";

/**
 * Page metadata reducer action codes.
 */
const PAGE_META_AWARD = "award";
const PAGE_META_LAB = "lab";
const PAGE_META_NAME = "name";
const PAGE_META_PARENT = "parent";
const PAGE_META_STATUS = "status";
const PAGE_META_TITLE = "title";

/**
 * Live block reducer operation types. Placed in the action.type property.
 */
const LIVE_BLOCK_UPDATE = "UPDATE";
const LIVE_BLOCK_ADD_ABOVE = "ADD_ABOVE";
const LIVE_BLOCK_ADD_BELOW = "ADD_BELOW";
const LIVE_BLOCK_DELETE = "DELETE";

/**
 * Types of each block; either Markdown or for a React component.
 */
const BLOCK_TYPE_MARKDOWN = "markdown";
const BLOCK_TYPE_COMPONENT = "component";

/**
 * Maximum number of blocks the front end allows on a page.
 */
const MAX_BLOCKS = 20;

/**
 * Initializes a new block within a page.
 */
const initialBlock = {
  "@id": "#block1",
  "@type": BLOCK_TYPE_MARKDOWN,
  body: "",
  direction: "ltr",
};
Object.freeze(initialBlock);

/**
 * Page object content for new pages.
 */
const initialPage = {
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
Object.freeze(initialPage.layout.blocks.body);

/**
 * Tracks any errors in the page editor that prevent saving the page.
 */
const EditorValidation = createContext({
  isValidationError: false,
});

/**
 * Tracks the condition of the page overall.
 */
const PageCondition = createContext({
  isDirty: false,
});

/**
 * Shows the button to trigger editing the page.
 */
const EditPageTrigger = ({ href }) => {
  return (
    <div className="mb-1 flex justify-end">
      <Button.Link href={`${href}#!edit`} type="secondary-outline" size="sm">
        Edit Page
      </Button.Link>
    </div>
  );
};

EditPageTrigger.propTypes = {
  // URL to the page to edit
  href: PropTypes.string.isRequired,
};

/**
 * Manages a form to edit the page metadata, e.g. awards and labs. Memoize this component so that
 * it only gets rendered when a change is made to the metadata form, not when the user edits the
 * text blocks -- this component is a little heavy.
 */
const PageMetaEditor = memo(function PageMetaEditor({
  livePageMeta,
  dispatchLivePageMeta,
  awards,
  labs,
  pages,
}) {
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
  const className = "md:grow md:basis-[calc(50%-1rem)]";

  /**
   * Called whenever the user changes anything about the page metadata. Individual keystrokes in
   * the form fields trigger this function. You normally call this through the shortcuts functions
   * below. Also sets the dirty flag.
   * @param {string} type Type code for metadata property to update
   * @param {string} value New value the user set for the metadata property
   */
  const setLivePageMeta = (type, value) => {
    dispatchLivePageMeta({ type, value });
    setDirty(true);
  };

  // Shortcuts to call the reducers for page metadata.
  const setPageMetaName = (value) => setLivePageMeta(PAGE_META_NAME, value);
  const setPageMetaTitle = (value) => setLivePageMeta(PAGE_META_TITLE, value);
  const setPageMetaStatus = (value) => setLivePageMeta(PAGE_META_STATUS, value);
  const setPageMetaParent = (value) => setLivePageMeta(PAGE_META_PARENT, value);
  const setPageMetaAward = (value) => setLivePageMeta(PAGE_META_AWARD, value);
  const setPageMetaLab = (value) => setLivePageMeta(PAGE_META_LAB, value);

  useEffect(() => {
    // Let the <PageEditor> component know if we detected conditions that prevent saving the page.
    setValidationError(isNameConflicting || isNameEmpty || isTitleEmpty);
  }, [isNameConflicting, isNameEmpty, isTitleEmpty, setValidationError]);

  /**
   * Updates the `pageMeta` name property to track text field changes for the Name field. Allows
   * only characters that are valid in a URL path.
   * @param {object} event React synthetic event object for text field changes
   */
  const setNameField = (event) => {
    const validPath = event.target.value.toLowerCase().replace(/\W+/g, "-");
    setPageMetaName(validPath);
    setNameConflicting(detectConflictingName(validPath, pages));
    setNameEmpty(!event.target.value);
  };

  /**
   * Updates the `pageMeta` title property to track text field changes for the Title field.
   * @param {object} event React synthetic event object for text field changes
   */
  const setTitleField = (event) => {
    setPageMetaTitle(event.target.value);
    setTitleEmpty(!event.target.value);
  };

  // Determine the messages to display under the name and title fields.
  let nameFieldMessage = "";
  if (isNameEmpty && isDirty) {
    nameFieldMessage = "Field is required";
  } else if (isNameConflicting) {
    nameFieldMessage = "Name conflicts with an existing page";
  }
  const titleFieldMessage = isTitleEmpty ? "Field is required" : "";

  return (
    <>
      <div className="md:flex md:flex-wrap md:gap-4">
        <div className={className}>
          <TextField
            label="Name"
            name="name"
            value={livePageMeta.name}
            isSpellCheckEnabled={false}
            placeholder="last-part-of-path"
            message={nameFieldMessage}
            onChange={setNameField}
            isRequired
          />
          <TextField
            label="Title"
            name="title"
            value={livePageMeta.title}
            isSpellCheckEnabled={false}
            placeholder="Appears at the top of the page"
            message={titleFieldMessage}
            onChange={setTitleField}
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
            className="self-stretch [&>div]:h-56 [&>div]:max-h-56"
          >
            {pages.map((page) => {
              return (
                <ListSelect.Option
                  key={page["@id"]}
                  id={page["@id"]}
                  label={page.name}
                >
                  <div className="text-left">{page["@id"]}</div>
                </ListSelect.Option>
              );
            })}
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
          >
            {awards.map((award) => {
              return (
                <ListSelect.Option
                  key={award["@id"]}
                  id={award["@id"]}
                  label={award.name}
                >
                  <div className="text-left">{award.name}</div>
                </ListSelect.Option>
              );
            })}
          </ListSelect>
        </div>
        <div className={className}>
          <ListSelect
            label="Lab"
            value={livePageMeta.lab}
            onChange={setPageMetaLab}
            className="[&>div]:max-h-52"
          >
            {labs.map((lab) => {
              return (
                <ListSelect.Option
                  key={lab["@id"]}
                  id={lab["@id"]}
                  label={lab.title}
                >
                  <div className="text-left">{lab.title}</div>
                </ListSelect.Option>
              );
            })}
          </ListSelect>
        </div>
      </div>
    </>
  );
});

PageMetaEditor.propTypes = {
  // All the page metadata states this component can update with user action
  livePageMeta: PropTypes.exact({
    award: PropTypes.string.isRequired,
    lab: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    parent: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }),
  // Dispatches actions to update the page metadata states
  dispatchLivePageMeta: PropTypes.func.isRequired,
  // All awards currently in the database
  awards: PropTypes.arrayOf(PropTypes.object).isRequired,
  // All labs currently in the database
  labs: PropTypes.arrayOf(PropTypes.object).isRequired,
  // All pages currently in the database
  pages: PropTypes.arrayOf(PropTypes.object).isRequired,
};

/**
 * Handles the editing of one block from the page, including its text and type. This component
 * displays the live text content of one editable block, though its contents are held by
 * <PageEditor> state.
 */
const BlockEditor = ({ block, dispatchLiveBlocks, previewedBlockIds }) => {
  const { setDirty } = useContext(PageCondition);
  const isBlockInPreviewMode = previewedBlockIds.includes(block["@id"]);

  if (isBlockInPreviewMode) {
    return (
      <div className="prose h-96 w-full overflow-y-auto border border-data-border bg-data-background p-2 dark:prose-invert">
        <Markdown direction={block.direction} markdown={block.body} />
      </div>
    );
  }

  return (
    <textarea
      className="block h-96 w-full border border-data-border bg-data-background p-2 font-mono text-sm"
      id={block["@id"].substring(1)}
      value={block.body}
      dir={block.direction}
      spellCheck={block["@type"] === BLOCK_TYPE_MARKDOWN}
      aria-label={`Edit ${block["@type"]} block`}
      onChange={(event) => {
        dispatchLiveBlocks({
          type: LIVE_BLOCK_UPDATE,
          blockId: block["@id"],
          content: event.target.value,
        });
        setDirty(true);
      }}
    />
  );
};

BlockEditor.propTypes = {
  // The block of text to edit
  block: PropTypes.object.isRequired,
  // Dispatches actions to update the live blocks state
  dispatchLiveBlocks: PropTypes.func.isRequired,
  // @ids of blocks that are currently being previewed
  previewedBlockIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

/**
 * Displays the two text direction buttons and handles clicks in them.
 */
const TextDirectionSwitch = ({
  direction,
  disabled,
  onBlockDirectionChange,
}) => {
  const buttonClassName = "block border border-data-border py-2 px-3";
  const iconClassName = `h-4 w-4${
    disabled
      ? " fill-gray-400 dark:fill-gray-600"
      : " fill-black dark:fill-white"
  }`;

  /**
   * Called when the user clicks the left-to-right or right-to-left text direction buttons.
   * @param {string} newDirection "ltr" or "rtl"
   */
  const onDirectionClick = (newDirection) => {
    if (newDirection !== direction) {
      onBlockDirectionChange(newDirection);
    }
  };

  return (
    <div className="flex">
      <button
        onClick={() => onDirectionClick("ltr")}
        className={`${buttonClassName} ${
          direction === "ltr"
            ? "bg-gray-200 dark:bg-gray-800"
            : "bg-white dark:bg-black"
        } rounded-l`}
        disabled={disabled}
        aria-label="Left-to-right language text direction"
      >
        <Bars3BottomLeftIcon className={iconClassName} />
      </button>
      <button
        onClick={() => onDirectionClick("rtl")}
        className={`${buttonClassName} ${
          direction === "rtl"
            ? "bg-gray-200 dark:bg-gray-800"
            : "bg-white dark:bg-black"
        } rounded-r border-l-0`}
        disabled={disabled}
        aria-label="Right-to-left language text direction"
      >
        <Bars3BottomRightIcon className={iconClassName} />
      </button>
    </div>
  );
};

TextDirectionSwitch.propTypes = {
  // The current text direction of the block
  direction: PropTypes.string.isRequired,
  // True if the buttons are disabled
  disabled: PropTypes.bool.isRequired,
  // Called when the user chooses a new text direction for the block
  onBlockDirectionChange: PropTypes.func.isRequired,
};

/**
 * Display the Delete Block button and handle the modal confirmation.
 */
const DeleteBlockTrigger = ({ onDelete }) => {
  // True if the Delete warning modal is open
  const [isOpen, setOpen] = useState(false);

  /**
   * Called when the user confirms the deletion of the block.
   */
  const handleDeleteClick = () => {
    setOpen(false);
    onDelete();
  };

  return (
    <>
      <Button
        type="error"
        label="Delete block"
        className="grow"
        onClick={() => setOpen(true)}
      >
        Delete Block
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        defaultElementId="cancel-delete-block"
      >
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
          <Button
            type="primary-outline"
            onClick={() => setOpen(false)}
            id="cancel-delete-block"
            autofocus
          >
            Cancel
          </Button>
          <Button
            type="error"
            id="confirm-delete-block"
            onClick={handleDeleteClick}
          >
            Delete Block
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

DeleteBlockTrigger.propTypes = {
  // Called if the user confirms the deletion of the block
  onDelete: PropTypes.func.isRequired,
};

/**
 * Displays the controls below each block to set the block's type, preview the block, etc.
 */
const BlockControls = ({
  block,
  dispatchLiveBlocks,
  blocks,
  previewedBlockIds,
  onPreview,
}) => {
  const isBlockPreviewed = previewedBlockIds.includes(block["@id"]);
  const { setDirty } = useContext(PageCondition);

  /**
   * Called when the user changes the type of a block between Markdown and Component.
   * @param {object} event React synthetic event
   */
  const onBlockTypeChange = (event) => {
    dispatchLiveBlocks({
      type: LIVE_BLOCK_UPDATE,
      blockId: block["@id"],
      blockType: event.target.value,
    });
    setDirty(true);

    // Blocks transitioning to a component type should have preview mode turned off.
    if (event.target.value === BLOCK_TYPE_COMPONENT) {
      onPreview(block["@id"], false);
    }
  };

  /**
   * Gets called when the user selects a new language text direction (left-to-right or right-to-
   * left) for the block.
   * @param {string} direction Whether to have the "ltr" or "rtl" text direction
   */
  const onBlockDirectionChange = (direction) => {
    dispatchLiveBlocks({
      type: LIVE_BLOCK_UPDATE,
      blockId: block["@id"],
      direction,
    });
    setDirty(true);
  };

  return (
    <div className="mt-1 lg:flex lg:items-start lg:justify-between">
      <div className="flex items-center gap-1">
        <Select
          name={`${block["@id"].substring(1)}-type`}
          value={block["@type"]}
          onChange={onBlockTypeChange}
        >
          <option value={BLOCK_TYPE_MARKDOWN}>Markdown</option>
          <option value={BLOCK_TYPE_COMPONENT}>Component</option>
        </Select>
        {block["@type"] === BLOCK_TYPE_MARKDOWN && (
          <>
            <TextDirectionSwitch
              direction={block.direction}
              disabled={isBlockPreviewed}
              onBlockDirectionChange={onBlockDirectionChange}
            />
            <Button.Icon
              type={`secondary${isBlockPreviewed ? "" : "-outline"}`}
              onClick={() => onPreview(block["@id"], !isBlockPreviewed)}
              label="Preview markdown"
            >
              <EyeIcon className="h-5 w-5" />
            </Button.Icon>
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
                  type: LIVE_BLOCK_ADD_ABOVE,
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
                  type: LIVE_BLOCK_ADD_BELOW,
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
                type: LIVE_BLOCK_DELETE,
                blockId: block["@id"],
              });
              setDirty(true);
            }}
          />
        )}
      </div>
    </div>
  );
};

BlockControls.propTypes = {
  // Block being edited
  block: PropTypes.object.isRequired,
  // Dispatches actions to update the live blocks state
  dispatchLiveBlocks: PropTypes.func.isRequired,
  // All blocks on the page as edited
  blocks: PropTypes.arrayOf(PropTypes.object).isRequired,
  // @ids of all blocks currently in preview mode
  previewedBlockIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Called when the user clicks the preview button
  onPreview: PropTypes.func.isRequired,
};

/**
 * Called on every user edit of any block. Updates the live blocks state with the new text or
 * setting.
 * @param {array} state Live blocks state containing the current text content of each block
 * @param {object} action Action to update the live blocks state
 * @param {string} action.type Type of operation; update, insert, delete
 * @param {string} action.blockId ID of the block to update, delete, or insert before
 * @param {string} action.blockType Type of block; Markdown, Component
 * @param {string} action.content New text content for the block
 * @returns {object} The updated live blocks state
 */
const reducerLiveBlocks = (state, action) => {
  let updatedState = [...state];

  switch (action.type) {
    case LIVE_BLOCK_UPDATE:
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
    case LIVE_BLOCK_ADD_ABOVE:
    case LIVE_BLOCK_ADD_BELOW:
      {
        const index = updatedState.findIndex(
          (block) => block["@id"] === action.blockId
        );
        if (index !== -1) {
          if (action.type === LIVE_BLOCK_ADD_ABOVE) {
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
    case LIVE_BLOCK_DELETE:
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
};

/**
 * Updates the page metadata when changed by the user in the metadata form.
 * @param {object} state The current page metadata states
 * @param {object} action Page metadata property to update and its new value
 * @param {string} action.type Metadata property to update
 * @param {string} action.value New value for the metadata property
 * @returns {object} Copy of the current page metadata states with the new property value
 */
const reducerLivePageMeta = (state, action) => {
  const newLivePageMeta = { ...state };
  newLivePageMeta[action.type] = action.value;
  return newLivePageMeta;
};

/**
 * Displays the page editor with multiple blocks of text and the page metadata.
 */
const PageEditor = ({ blocks, pageMeta, awards, labs, pages, onClose }) => {
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
    const handleWindowClose = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = warningText;
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleWindowClose);
    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
    };
  }, [isDirty, router.events, router.isReady]);

  /**
   * Called to set whether a block goes into or out of preview mode.
   * @param {string} blockId @id of the block being toggled between preview and edit mode
   * @param {boolean} isPreviewMode True to set the block preview mode, false to set the edit mode
   */
  const onPreview = (blockId, isPreviewMode) => {
    if (isPreviewMode) {
      setPreviewedBlockIds([...previewedBlockIds, blockId]);
    } else {
      setPreviewedBlockIds(previewedBlockIds.filter((id) => id !== blockId));
    }
  };

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
          onClick={() => onClose()}
          type="secondary-outline"
          label="Cancel editing page"
        >
          Cancel
        </Button>
        <Button
          disabled={isValidationError}
          label="Save edits to page"
          onClick={() =>
            onClose({ blocks: liveBlocks, pageMeta: livePageMeta })
          }
        >
          Save
        </Button>
      </div>
      <div className="mb-4 border-b border-data-border">
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
};

PageEditor.propTypes = {
  // Editable blocks of markdown text
  blocks: PropTypes.arrayOf(
    PropTypes.exact({
      "@id": PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      "@type": PropTypes.string.isRequired,
      direction: PropTypes.string.isRequired,
    })
  ).isRequired,
  // Page metadata states
  pageMeta: PropTypes.exact({
    award: PropTypes.string.isRequired,
    lab: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    parent: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }),
  // All awards currently in the database
  awards: PropTypes.arrayOf(PropTypes.object).isRequired,
  // All labs currently in the database
  labs: PropTypes.arrayOf(PropTypes.object).isRequired,
  // All pages currently in the database to select as a parent
  pages: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Called when the user either cancels or saves the page
  onClose: PropTypes.func.isRequired,
};

/**
 * Copies editable metadata from the given page object so that the page editor can modify it
 * without modifying the props.
 * @param {object} page Page object to potentially be edited
 * @returns {object} Contains editable copies of the page's metadata
 */
const copyPageMeta = (page) => {
  return {
    award: page?.award || "",
    lab: page?.lab || "",
    name: page?.name || "",
    parent: page?.parent || "",
    status: page?.status || "",
    title: page?.title || "",
  };
};

/**
 * Displays the page content, either as the normal read-only page, or as an editable page if the
 * user has chosen to edit the page. The `page` object is the page as stored in the database, but
 * since the page can get edited, this only gets used on initial render. From then on the contents
 * of the page get displayed from the editable states to prevent the need to reload the page after
 * the user saves their edits.
 */
const Page = ({
  page = initialPage,
  awards,
  labs,
  pages,
  isNewPage = false,
}) => {
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
  const isAuthenticated = useAuthenticated();
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
      router.push(redirectToPage);
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
   * @param {object} updates Updated blocks and metadata after editing
   * @param {object} updates.blocks Updated blocks of text
   * @param {object} updates.pageMeta Updated page metadata
   */
  const onClose = (updates) => {
    setActiveError("");
    if (updates) {
      // User clicked save, so save the blocks and metadata.
      savePage(page, updates.blocks, updates.pageMeta, session, isNewPage).then(
        (updatedPage) => {
          if (FetchRequest.isResponseSuccess(updatedPage)) {
            setDirty(false);
            setEditableBlocks(updates.blocks);
            setEditablePageMeta(updates.pageMeta);
            setEditablePageId(updatedPage["@id"]);

            // The user can change the path to the page, so go to the returned page object's @id.
            setRedirectToPage(updatedPage["@id"]);
          } else {
            setActiveError(
              `${updatedPage.description} The page has not been saved.`
            );
          }
        }
      );
    } else {
      if (isNewPage) {
        router.push("/pages");
      } else {
        // User canceled editing. Remove #!edit from the URL which disables edit mode.
        router.push(`${router.asPath.split("#")[0]}`);
      }
    }
  };

  return (
    <PageCondition.Provider value={{ isDirty, setDirty, isNewPage }}>
      <Breadcrumbs />
      <PagePreamble pageTitle={editablePageMeta.title} />
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
          <DataPanel>
            <div data-testid="page-blocks" className="prose dark:prose-invert">
              {editableBlocks.map((block) => {
                if (block["@type"] === BLOCK_TYPE_MARKDOWN) {
                  return (
                    <Markdown
                      key={block["@id"]}
                      markdown={block.body}
                      direction={block.direction}
                    />
                  );
                }
                if (block["@type"] === BLOCK_TYPE_COMPONENT) {
                  return <PageComponent key={block["@id"]} spec={block.body} />;
                }
              })}
            </div>
          </DataPanel>
        </>
      )}
    </PageCondition.Provider>
  );
};

Page.propTypes = {
  // Page object to display; null for new pages
  page: PropTypes.object,
  // Collection of all awards
  awards: PropTypes.arrayOf(PropTypes.object),
  // Collection of all labs
  labs: PropTypes.arrayOf(PropTypes.object),
  // Collection of all pages
  pages: PropTypes.arrayOf(PropTypes.object),
  // True if adding a page instead of updating an existing page
  isNewPage: PropTypes.bool,
};

export default Page;
