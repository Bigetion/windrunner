import rawTheme from "./theme.js";
import vars from "./vars.js";
import { createLazyTheme } from "./theme-proxy.js";

// Wrap theme with lazy resolution proxy to reduce initial bundle parse time
const theme = createLazyTheme(rawTheme);

const configOptions = {
  theme,
  vars,
};

export default configOptions;
