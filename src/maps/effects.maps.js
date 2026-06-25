export const ANIMATE_MAP = {
  none: "animation: none;",
  spin: "animation: spin 1s linear infinite;",
  ping: "animation: ping 1s cubic-bezier(0,0,0.2,1) infinite;",
  pulse: "animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite;",
  bounce: "animation: bounce 1s infinite;",
};

export const INSET_SHADOW_SIZES = {
  none: "box-shadow: none;",
  xs: "box-shadow: inset 0 1px 1px 0 rgb(0 0 0 / 0.05);",
  sm: "box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.1);",
  DEFAULT: "box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.1);",
  md: "box-shadow: inset 0 2px 6px 0 rgb(0 0 0 / 0.1);",
  lg: "box-shadow: inset 0 4px 8px 0 rgb(0 0 0 / 0.15);",
};

export const PERSPECTIVE_MAP = {
  none: "perspective: none;",
  dramatic: "perspective: 100px;",
  near: "perspective: 300px;",
  normal: "perspective: 500px;",
  midrange: "perspective: 800px;",
  distant: "perspective: 1200px;",
};

export const MASK_LINEAR_MAP = {
  "mask-linear-to-t":  "mask-image: linear-gradient(to top, black, transparent); -webkit-mask-image: linear-gradient(to top, black, transparent);",
  "mask-linear-to-tr": "mask-image: linear-gradient(to top right, black, transparent); -webkit-mask-image: linear-gradient(to top right, black, transparent);",
  "mask-linear-to-r":  "mask-image: linear-gradient(to right, black, transparent); -webkit-mask-image: linear-gradient(to right, black, transparent);",
  "mask-linear-to-br": "mask-image: linear-gradient(to bottom right, black, transparent); -webkit-mask-image: linear-gradient(to bottom right, black, transparent);",
  "mask-linear-to-b":  "mask-image: linear-gradient(to bottom, black, transparent); -webkit-mask-image: linear-gradient(to bottom, black, transparent);",
  "mask-linear-to-bl": "mask-image: linear-gradient(to bottom left, black, transparent); -webkit-mask-image: linear-gradient(to bottom left, black, transparent);",
  "mask-linear-to-l":  "mask-image: linear-gradient(to left, black, transparent); -webkit-mask-image: linear-gradient(to left, black, transparent);",
  "mask-linear-to-tl": "mask-image: linear-gradient(to top left, black, transparent); -webkit-mask-image: linear-gradient(to top left, black, transparent);",
  "mask-none":         "mask-image: none; -webkit-mask-image: none;",
};

export const MASK_RADIAL_POSITIONS = {
  center: "center",
  top: "top",
  right: "right",
  bottom: "bottom",
  left: "left",
  "top-right": "top right",
  "bottom-right": "bottom right",
  "bottom-left": "bottom left",
  "top-left": "top left",
};

export const MASK_REPEAT_MAP = {
  "mask-repeat":       "mask-repeat: repeat; -webkit-mask-repeat: repeat;",
  "mask-no-repeat":    "mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;",
  "mask-repeat-x":     "mask-repeat: repeat-x; -webkit-mask-repeat: repeat-x;",
  "mask-repeat-y":     "mask-repeat: repeat-y; -webkit-mask-repeat: repeat-y;",
  "mask-repeat-round": "mask-repeat: round; -webkit-mask-repeat: round;",
  "mask-repeat-space": "mask-repeat: space; -webkit-mask-repeat: space;",
};

export const MASK_SIZE_MAP = {
  "mask-size-auto":    "mask-size: auto; -webkit-mask-size: auto;",
  "mask-size-cover":   "mask-size: cover; -webkit-mask-size: cover;",
  "mask-size-contain": "mask-size: contain; -webkit-mask-size: contain;",
};

export const BG_ATTACHMENT_MAP = {
  fixed:  "background-attachment: fixed;",
  local:  "background-attachment: local;",
  scroll: "background-attachment: scroll;",
};

export const BG_CLIP_MAP = {
  border:  "background-clip: border-box;",
  padding: "background-clip: padding-box;",
  content: "background-clip: content-box;",
  text:    "background-clip: text; -webkit-background-clip: text;",
};

export const BG_ORIGIN_MAP = {
  border:  "background-origin: border-box;",
  padding: "background-origin: padding-box;",
  content: "background-origin: content-box;",
};

export const BG_REPEAT_MAP = {
  repeat:         "background-repeat: repeat;",
  "no-repeat":    "background-repeat: no-repeat;",
  "repeat-x":     "background-repeat: repeat-x;",
  "repeat-y":     "background-repeat: repeat-y;",
  "repeat-round": "background-repeat: round;",
  "repeat-space": "background-repeat: space;",
};

export const MIX_BLEND_MAP = {
  "mix-blend-normal":       "mix-blend-mode: normal;",
  "mix-blend-multiply":     "mix-blend-mode: multiply;",
  "mix-blend-screen":       "mix-blend-mode: screen;",
  "mix-blend-overlay":      "mix-blend-mode: overlay;",
  "mix-blend-darken":       "mix-blend-mode: darken;",
  "mix-blend-lighten":      "mix-blend-mode: lighten;",
  "mix-blend-color-dodge":  "mix-blend-mode: color-dodge;",
  "mix-blend-color-burn":   "mix-blend-mode: color-burn;",
  "mix-blend-hard-light":   "mix-blend-mode: hard-light;",
  "mix-blend-soft-light":   "mix-blend-mode: soft-light;",
  "mix-blend-difference":   "mix-blend-mode: difference;",
  "mix-blend-exclusion":    "mix-blend-mode: exclusion;",
  "mix-blend-hue":          "mix-blend-mode: hue;",
  "mix-blend-saturation":   "mix-blend-mode: saturation;",
  "mix-blend-color":        "mix-blend-mode: color;",
  "mix-blend-luminosity":   "mix-blend-mode: luminosity;",
  "mix-blend-plus-darker":  "mix-blend-mode: plus-darker;",
  "mix-blend-plus-lighter": "mix-blend-mode: plus-lighter;",
};

export const BG_BLEND_MAP = {
  "bg-blend-normal":       "background-blend-mode: normal;",
  "bg-blend-multiply":     "background-blend-mode: multiply;",
  "bg-blend-screen":       "background-blend-mode: screen;",
  "bg-blend-overlay":      "background-blend-mode: overlay;",
  "bg-blend-darken":       "background-blend-mode: darken;",
  "bg-blend-lighten":      "background-blend-mode: lighten;",
  "bg-blend-color-dodge":  "background-blend-mode: color-dodge;",
  "bg-blend-color-burn":   "background-blend-mode: color-burn;",
  "bg-blend-hard-light":   "background-blend-mode: hard-light;",
  "bg-blend-soft-light":   "background-blend-mode: soft-light;",
  "bg-blend-difference":   "background-blend-mode: difference;",
  "bg-blend-exclusion":    "background-blend-mode: exclusion;",
  "bg-blend-hue":          "background-blend-mode: hue;",
  "bg-blend-saturation":   "background-blend-mode: saturation;",
  "bg-blend-color":        "background-blend-mode: color;",
  "bg-blend-luminosity":   "background-blend-mode: luminosity;",
};

export const TEXT_SHADOW_SIZES = {
  "2xs":  "0 1px 2px rgb(0 0 0 / 0.10)",
  xs:     "0 1px 2px rgb(0 0 0 / 0.20)",
  sm:     "0 1px 3px rgb(0 0 0 / 0.25)",
  DEFAULT:"0 1px 3px rgb(0 0 0 / 0.30)",
  md:     "0 2px 4px rgb(0 0 0 / 0.30)",
  lg:     "0 4px 6px rgb(0 0 0 / 0.25)",
  xl:     "0 8px 12px rgb(0 0 0 / 0.20)",
  "2xl":  "0 16px 24px rgb(0 0 0 / 0.15)",
  none:   "none",
};

export const FORCED_COLOR_MAP = {
  "forced-color-adjust-auto": "forced-color-adjust: auto;",
  "forced-color-adjust-none": "forced-color-adjust: none;",
};
