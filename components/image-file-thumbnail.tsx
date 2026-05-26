// node_modules
import { Dialog } from "@headlessui/react";
import { useEffect, useRef, useState } from "react";
// components
import CloseButton from "./close-button";
// lib
import { API_URL } from "../lib/constants";
import { fileNameFromPath } from "../lib/general";
// root
import type { FileObject } from "../globals";

/**
 * Default size of the square thumbnail area for the image-file preview, in pixels.
 */
const DEFAULT_SIZE = 180;

/**
 * Image file formats that we can display as a thumbnail preview on the page.
 */
const THUMBNAIL_FILE_FORMATS = ["jpg", "png", "svg"];

/**
 * Test whether a given file can display a thumbnail preview on the page. This is true if the file
 * has a file format that we know how to display as an image in the browser.
 *
 * @param file - File to test whether it can display a thumbnail
 * @returns True if the given file can display a thumbnail
 */
export function imageFileHasThumbnail(file: FileObject): boolean {
  return THUMBNAIL_FILE_FORMATS.includes(file.file_format?.toLowerCase());
}

/**
 * Display a message centered in the thumbnail area, used for messages like "Loading image..." or
 * "Missing image".
 *
 * @param message - Message to display in the thumbnail area
 */
function ThumbnailMessage({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center text-sm">
      {message}
    </div>
  );
}

/**
 * Display an image thumbnail for an attachment that's viewable in the browser. When the user
 * clicks the thumbnail, display the attachment image preview as a modal overlay on the page.
 *
 * @param imageFile - File object representing the image file to display
 * @param size - Size of the square thumbnail area in pixels
 */
export function ImageFileThumbnailAndPreview({
  imageFile,
  size = DEFAULT_SIZE,
}: {
  imageFile: FileObject;
  size?: number;
}) {
  // True if the attachment image preview is visible
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [imageStatus, setImageStatus] = useState<
    "checking" | "loaded" | "missing"
  >("checking");
  const imgRef = useRef<HTMLImageElement | null>(null);
  const isImageMissing = imageStatus === "missing";

  const fileName = fileNameFromPath(imageFile.href);
  const url = `${API_URL}${imageFile.href}`;
  const alt = `Preview of ${fileName}`;

  useEffect(() => {
    const img = imgRef.current;
    if (!img) {
      return;
    }

    // Set the image-loading state based on properties of the image. Avoid all this if the
    // component is unmounting before image loading completes.
    function reconcileImageLoad() {
      if (!canceled) {
        if (img.complete) {
          // We can end up here if the image has loaded successfully or if it failed to load. Use
          // `naturalWidth` to distinguish these cases, since it will be 0 if the image failed to
          // load.
          setImageStatus(img.naturalWidth > 0 ? "loaded" : "missing");
        } else {
          setImageStatus("checking");
        }
      }
    }

    function onLoad() {
      reconcileImageLoad();
    }

    // Install the event listeners and also check the image status immediately in case the image is already cached
    let canceled = false;
    img.addEventListener("load", onLoad);
    reconcileImageLoad();

    return () => {
      canceled = true;
      img.removeEventListener("load", onLoad);
    };
  }, [url]);

  // This function gets called if the `<img>` element tries to load the image and fails. Set the
  // state to show the "missing image" message in this case.
  function handleImageError() {
    setImageStatus("missing");
  }

  return (
    <>
      <button
        onClick={() => setIsPreviewOpen(true)}
        disabled={isImageMissing}
        style={{ width: `${size}px`, height: `${size}px` }}
        className={`mx-auto ${isImageMissing ? "cursor-not-allowed" : "cursor-pointer"}`}
        aria-label={`Open full-size preview of ${fileName}`}
      >
        <picture
          className={`relative flex h-full items-center justify-center border ${isImageMissing ? "" : "bg-white"}`}
        >
          <img
            ref={imgRef}
            className={
              imageStatus === "loaded"
                ? "block object-contain"
                : "invisible block object-contain"
            }
            src={url}
            alt={alt}
            onError={handleImageError}
          />
          {imageStatus === "checking" && (
            <ThumbnailMessage message="Loading image..." />
          )}
          {isImageMissing && <ThumbnailMessage message="Missing image" />}
        </picture>
      </button>
      <Dialog
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        className="relative z-50"
      >
        <div
          data-testid="dialog-background"
          className="fixed inset-0 bg-white/90"
        />
        <div className="fixed inset-0 overflow-y-auto px-3 py-8 text-center">
          <CloseButton
            className="absolute top-1 right-1"
            onClick={() => setIsPreviewOpen(false)}
            label="Close the full-size preview image"
          />
          <Dialog.Panel className="mx-auto inline-block max-w-3xl">
            <picture className="block border border-gray-200">
              <img
                className="border-data-border block h-full w-full border"
                src={url}
                alt={alt}
                onError={handleImageError}
              />
            </picture>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
