import FetchRequest, { HTTP_STATUS_CODE } from "../../../lib/fetch-request";

/**
 * Given the schema name in the query parameters like ?profile=<schema_name>
 * return the collection associated with the <schema_name> with 0
 * items.
 */
const mapprofile = (req, res) => {
  if (req.method === "GET") {
    if (req.query.profile) {
      const request = new FetchRequest({ cookie: req.headers.cookie });
      return request
        .getObject(`/${req.query.profile}/?limit=0`)
        .then((response) => {
          if (FetchRequest.isResponseSuccess(response)) {
            return res.status(HTTP_STATUS_CODE.OK).json(response);
          } else {
            res
              .status(HTTP_STATUS_CODE.BAD_REQUEST)
              .json({ error: "Bad Request" });
          }
        });
    } else {
      res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: "Bad Request" });
    }
  } else {
    res.status(HTTP_STATUS_CODE.METHOD_NOT_ALLOWED).end();
  }
};

export default mapprofile;
