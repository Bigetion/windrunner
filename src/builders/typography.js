import {
  TEXT_ALIGN_MAP,
  TEXT_DECORATION_MAP,
  TEXT_DECORATION_STYLE_MAP,
  TEXT_TRANSFORM_MAP,
  TEXT_OVERFLOW_MAP,
  WHITESPACE_MAP,
  WORD_BREAK_MAP,
  FONT_STYLE_MAP,
  FONT_SMOOTHING_MAP,
  FONT_STRETCH_MAP,
  FONT_VARIANT_NUMERIC_MAP,
  LIST_STYLE_IMAGE_MAP,
  HYPHENS_MAP,
  LIST_STYLE_POSITION_MAP,
  VERTICAL_ALIGN_MAP,
} from "../maps/typography.maps.js";
import { resolveThemeValue, resolveColorWithOpacity, resolveArbitraryValue, isArbitraryColor } from "../resolvers.js";

export function buildTypographyDeclaration(baseToken, theme) {
  // static keyword maps
  if (TEXT_DECORATION_MAP[baseToken])  return TEXT_DECORATION_MAP[baseToken];
  if (TEXT_TRANSFORM_MAP[baseToken])   return TEXT_TRANSFORM_MAP[baseToken];
  if (TEXT_OVERFLOW_MAP[baseToken])    return TEXT_OVERFLOW_MAP[baseToken];
  if (WORD_BREAK_MAP[baseToken])       return WORD_BREAK_MAP[baseToken];
  if (FONT_STYLE_MAP[baseToken])       return FONT_STYLE_MAP[baseToken];
  if (FONT_SMOOTHING_MAP[baseToken])   return FONT_SMOOTHING_MAP[baseToken];

  // text-*
  if (baseToken.startsWith("text-")) {
    const valueKey = baseToken.slice(5);
    if (TEXT_ALIGN_MAP[valueKey]) return TEXT_ALIGN_MAP[valueKey];

    // Guard: skip fontSize lookup for arbitrary values that are clearly colors.
    // e.g. text-[#fff] or text-[red] must route to color, not font-size.
    const fontSize = isArbitraryColor(resolveArbitraryValue(valueKey) ?? valueKey)
      ? undefined
      : resolveThemeValue(theme.fontSize || {}, valueKey);
    if (fontSize !== undefined) {
      if (Array.isArray(fontSize)) return `font-size: ${fontSize[0]};`;
      return `font-size: ${fontSize};`;
    }

    const color = resolveColorWithOpacity(theme.colors || {}, valueKey);
    if (color !== undefined) return `color: ${color};`;
  }

  // font-*
  if (baseToken.startsWith("font-")) {
    const valueKey = baseToken.slice(5);

    // Check named theme values first (non-arbitrary)
    if (!valueKey.startsWith("[")) {
      const fontWeight = resolveThemeValue(theme.fontWeight || {}, valueKey);
      if (fontWeight !== undefined) return `font-weight: ${fontWeight};`;
      const fontFamily = resolveThemeValue(theme.fontFamily || {}, valueKey);
      if (fontFamily !== undefined) {
        if (Array.isArray(fontFamily)) return `font-family: ${fontFamily.join(", ")};`;
        return `font-family: ${fontFamily};`;
      }
    } else {
      // Arbitrary value: disambiguate between font-weight and font-family
      const resolved = resolveArbitraryValue(valueKey);
      if (resolved !== undefined) {
        // font-weight if numeric or a CSS font-weight keyword
        const FONT_WEIGHT_KEYWORDS = new Set([
          "normal", "bold", "lighter", "bolder",
          "inherit", "initial", "revert", "unset",
        ]);
        const trimmed = resolved.trim();
        if (/^\d+$/.test(trimmed) || FONT_WEIGHT_KEYWORDS.has(trimmed)) {
          return `font-weight: ${trimmed};`;
        }
        // Otherwise treat as font-family
        return `font-family: ${trimmed};`;
      }
    }
  }

  if (baseToken.startsWith("font-stretch-")) {
    return FONT_STRETCH_MAP[baseToken.slice(13)] ?? undefined;
  }

  if (baseToken.startsWith("font-variant-numeric-")) {
    return FONT_VARIANT_NUMERIC_MAP[baseToken.slice(21)] ?? undefined;
  }

  // leading-* (line-height)
  if (baseToken.startsWith("leading-")) {
    const val = resolveThemeValue(theme.lineHeight || {}, baseToken.slice(8));
    if (val !== undefined) return `line-height: ${val};`;
  }

  // tracking-* (letter-spacing)
  if (baseToken.startsWith("tracking-")) {
    const val = resolveThemeValue(theme.letterSpacing || {}, baseToken.slice(9));
    if (val !== undefined) return `letter-spacing: ${val};`;
  }

  // decoration-* (style / thickness / color)
  if (baseToken.startsWith("decoration-")) {
    const key = baseToken.slice(11);
    if (TEXT_DECORATION_STYLE_MAP[key]) return TEXT_DECORATION_STYLE_MAP[key];
    // Guard: skip thickness lookup for arbitrary values that are clearly colors.
    const arbResolved = resolveArbitraryValue(key);
    const thicknessVal = (arbResolved !== undefined && isArbitraryColor(arbResolved))
      ? undefined
      : resolveThemeValue(theme.textDecorationThickness || {}, key);
    if (thicknessVal !== undefined) return `text-decoration-thickness: ${thicknessVal};`;
    const color = resolveColorWithOpacity(theme.colors || {}, key);
    if (color !== undefined) return `text-decoration-color: ${color};`;
  }

  // underline-offset
  if (baseToken.startsWith("underline-offset-")) {
    const val = resolveThemeValue(theme.textUnderlineOffset || {}, baseToken.slice(17));
    if (val !== undefined) return `text-underline-offset: ${val};`;
  }

  // indent
  if (baseToken.startsWith("indent-")) {
    const val = resolveThemeValue(theme.textIndent || theme.spacing || {}, baseToken.slice(7));
    if (val !== undefined) return `text-indent: ${val};`;
  }

  // list-*
  if (baseToken.startsWith("list-")) {
    const key = baseToken.slice(5);
    if (baseToken === "list-none") return "list-style-type: none;";
    if (baseToken === "list-disc") return "list-style-type: disc;";
    if (baseToken === "list-decimal") return "list-style-type: decimal;";
    if (LIST_STYLE_POSITION_MAP[key]) return LIST_STYLE_POSITION_MAP[key];
    if (LIST_STYLE_IMAGE_MAP[key]) return LIST_STYLE_IMAGE_MAP[key];
    const val = resolveThemeValue(theme.listStyleType || {}, key);
    if (val !== undefined) return `list-style-type: ${val};`;
  }

  if (baseToken.startsWith("list-style-image-")) {
    return LIST_STYLE_IMAGE_MAP[baseToken.slice(17)] ?? undefined;
  }

  // whitespace-*
  if (baseToken.startsWith("whitespace-")) {
    const key = baseToken.slice(11);
    if (WHITESPACE_MAP[key]) return WHITESPACE_MAP[key];
  }

  // hyphens
  if (baseToken.startsWith("hyphens-")) return HYPHENS_MAP[baseToken.slice(8)] ?? undefined;

  // text-wrap-*
  if (baseToken === "text-wrap")    return "text-wrap: wrap;";
  if (baseToken === "text-nowrap")  return "text-wrap: nowrap;";
  if (baseToken === "text-balance") return "text-wrap: balance;";
  if (baseToken === "text-pretty")  return "text-wrap: pretty;";
  if (baseToken === "text-wrap-break") return "overflow-wrap: break-word;";
  if (baseToken === "text-wrap-normal") return "text-wrap: wrap;";

  // align-* (vertical-align)
  if (baseToken.startsWith("align-")) {
    const key = baseToken.slice(6);
    if (VERTICAL_ALIGN_MAP[key]) return VERTICAL_ALIGN_MAP[key];
  }

  // line-clamp-*
  if (baseToken === "line-clamp-none") {
    return "overflow: visible; display: block; -webkit-box-orient: horizontal; -webkit-line-clamp: unset;";
  }
  if (baseToken.startsWith("line-clamp-")) {
    const val = resolveThemeValue(theme.lineClamp || {}, baseToken.slice(11));
    if (val !== undefined) {
      return `overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: ${val};`;
    }
    // numeric fallback
    const num = baseToken.slice(11);
    if (/^\d+$/.test(num)) {
      return `overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: ${num};`;
    }
  }

  return undefined;
}
