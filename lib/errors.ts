/**
 * Utility functions to handle errors.
 */

// lib
import { HTTP_STATUS_CODE } from "./fetch-request";
// types
import { ErrorObject } from "./fetch-request.d";
import { ServerSideProps } from "../globals.d";

/**
 * Log the error to the console with a timestamp.
 * @param statusCode Error status code, e.g. 403
 * @param title Narrative string corresponding to error code
 */
export function logError(statusCode: string | number, title: string): void {
  const date = new Date().toISOString();
  console.log(`ERROR [${date}] ${statusCode}:${title}`);
}

/**
 * Given an object from data-provider requests containing error information, return an error object
 * expected by the UI. This gets called at the end of most getServerSideProps functions.
 * @param error Retrieved object containing data-provider error information
 * @returns Error object with message and status code, or notFound for 404
 */
export function errorObjectToProps(errorObject: ErrorObject): ServerSideProps {
  // NextJS handles 404 separately.
  if (errorObject.code === HTTP_STATUS_CODE.NOT_FOUND) {
    return { notFound: true };
  }

  // For all other errors, return an object to get rendered as an error page.
  return {
    props: {
      serverSideError: errorObject,
    },
  };
}
