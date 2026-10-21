// @ts-check
/** @module engines */
import { register } from "./registry.js";
import { classic } from "./classic/index.js";
import { accent } from "./accent/index.js";
import { offset } from "./offset/index.js";
import { handWriting, migrateLegacy } from "./hand-writing/index.js";
import { sticker } from "./sticker/index.js";

register(classic);
register(accent);
register(offset);
register(handWriting);
register(sticker);
export { accent, classic, offset, handWriting, migrateLegacy, sticker };
export * from "./registry.js";
