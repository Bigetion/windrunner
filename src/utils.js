import defaultConfigOptions from "./config.js";

function isFunction(fn) {
  return fn && {}.toString.call(fn) === "[object Function]";
}

export function getConfigOptions(options = {}, pluginKeys = []) {
  const { theme = {} } = options;
  const { extend: themeExtend = {} } = theme;

  const newTheme = {};
  const themeKeys = Object.keys(defaultConfigOptions.theme);

  themeKeys.forEach((key) => {
    newTheme[key] = theme[key] || defaultConfigOptions.theme[key];
    if (isFunction(newTheme[key])) {
      newTheme[key] = newTheme[key]({
        theme: (keyRef) => defaultConfigOptions.theme[keyRef],
      });
    }
  });

  themeKeys.forEach((key) => {
    if (isFunction(newTheme[key])) {
      newTheme[key] = newTheme[key]({
        theme: (keyRef) => newTheme[keyRef],
      });
    }
    if (themeExtend[key]) {
      newTheme[key] = Object.assign({}, newTheme[key], themeExtend[key]);
    }
  });

  return {
    ...defaultConfigOptions,
    ...options,
    theme: newTheme,
  };
}
