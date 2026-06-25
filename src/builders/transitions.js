import { TRANSITION_PROPERTY_MAP, TRANSITION_TIMING_MAP } from "../maps/interactivity.maps.js";
import { resolveTimeValue, resolveArbitraryValue } from "../resolvers.js";

export function buildTransitionDeclaration(baseToken) {
  if (baseToken === "transition") {
    return `transition-property: ${TRANSITION_PROPERTY_MAP.DEFAULT}; transition-timing-function: ${TRANSITION_TIMING_MAP["in-out"]}; transition-duration: 150ms;`;
  }

  if (baseToken.startsWith("transition-")) {
    const key = baseToken.slice(11);
    if (Object.prototype.hasOwnProperty.call(TRANSITION_PROPERTY_MAP, key)) {
      const propertyValue = TRANSITION_PROPERTY_MAP[key];
      if (propertyValue === "none") return "transition-property: none;";
      return `transition-property: ${propertyValue}; transition-timing-function: ${TRANSITION_TIMING_MAP["in-out"]}; transition-duration: 150ms;`;
    }
  }

  if (baseToken.startsWith("duration-")) {
    const value = resolveTimeValue(baseToken.slice(9));
    if (value !== undefined) return `transition-duration: ${value};`;
  }

  if (baseToken.startsWith("delay-")) {
    const value = resolveTimeValue(baseToken.slice(6));
    if (value !== undefined) return `transition-delay: ${value};`;
  }

  if (baseToken.startsWith("ease-")) {
    const valueKey = baseToken.slice(5);
    const value = TRANSITION_TIMING_MAP[valueKey] || resolveArbitraryValue(valueKey);
    if (value !== undefined) return `transition-timing-function: ${value};`;
  }

  return undefined;
}
