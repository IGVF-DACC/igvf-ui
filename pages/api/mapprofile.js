import FetchRequest, { HTTP_STATUS_CODE } from "../../lib/fetch-request";

const mapprofile = (req, res) => {
  if (req.method === "GET") {
    if (req.query.profile) {
      const request = new FetchRequest({ cookie: req.headers.cookie });
      request.getObject(`/${req.query.profile}/?limit=0`).then((response) => {
        if (FetchRequest.isResponseSuccess(response)) {
          const profileType = response.all.match(/\/(.+)\//)[1];
          res.status(HTTP_STATUS_CODE.OK).json({ profile_type: profileType });
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
