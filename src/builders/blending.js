import { MIX_BLEND_MAP, BG_BLEND_MAP } from "../maps/effects.maps.js";

export function buildBlendingDeclaration(baseToken) {
  if (MIX_BLEND_MAP[baseToken]) return MIX_BLEND_MAP[baseToken];
  if (BG_BLEND_MAP[baseToken])  return BG_BLEND_MAP[baseToken];
  return undefined;
}
