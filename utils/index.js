// This is the way to interact with IPFS client to
// upload and download files to the IPFS network
import { create as ipfsHttpClient } from "ipfs-http-client";
import { projectId, projectSecret } from "../config";

const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

export const client = ipfsHttpClient({
  host: "infura-ipfs.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});
