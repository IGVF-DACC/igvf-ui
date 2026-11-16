/**
 * This file contains the functions to easily use the access-key API. These all require a session object that you can get using:
 * const { session } = useContext(SessionContext)
 */

// lib
import FetchRequest, { isErrorObject } from "./fetch-request";
// root
import type { AccessKeyObject, SessionObject } from "../globals";

/**
 * Access-key response returned when creating a key or resetting its secret. The plaintext secret is
 * only included in these responses.
 */
export interface AccessKeySecretResponse extends AccessKeyObject {
  secret_access_key: string;
}

/**
 * Creates an access key for the currently logged-in user. It returns the response object including
 * the new access key object in the object's `@graph` property.
 *
 * @param session - Current signed-in user's session
 * @returns Access-key response
 */
export async function createAccessKey(
  session: SessionObject
): Promise<AccessKeySecretResponse> {
  const request = new FetchRequest({ session });
  const response = await request.postObject<AccessKeySecretResponse>(
    "/access-keys",
    {}
  );
  if (isErrorObject(response)) {
    throw response;
  }
  return response;
}

/**
 * Resets the access key secret for the given access key ID. It returns the response object
 * including the new access key object in the object's `@graph` property.
 *
 * @param accessKeyId - Access key ID to reset
 * @param session - Current signed-in user's session
 * @returns Access-key response
 */
export async function resetAccessKey(
  accessKeyId: string,
  session: SessionObject
): Promise<AccessKeySecretResponse> {
  const request = new FetchRequest({ session });
  const response = await request.postObject<AccessKeySecretResponse>(
    `/access-keys/${accessKeyId}/reset-secret`,
    {}
  );
  if (isErrorObject(response)) {
    throw response;
  }
  return response;
}

/**
 * Deletes the access key with the given access key ID.
 *
 * @param accessKeyId - Access key ID to delete
 * @param session - Current signed-in user's session
 * @throws The data-provider error if the access key could not be deleted
 */
export async function deleteAccessKey(
  accessKeyId: string,
  session: SessionObject
): Promise<void> {
  const request = new FetchRequest({ session });
  const response = await request.patchObject<unknown>(
    `/access-keys/${accessKeyId}/?render=false`,
    { status: "deleted" }
  );
  if (isErrorObject(response)) {
    throw response;
  }
}
