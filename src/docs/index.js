import header from "./header.js";
import servers from "./servers.js";
import pathsAndComponents from "./pathsAndComponents.js";

const apiDocs = {
  ...header,
  ...servers,
  ...pathsAndComponents,
}

export default apiDocs;
