import { config } from "@remotion/eslint-config-flat";

// src/lib is the synced kit (generated copy, never edited in a project), so it is not linted here
export default [{ignores: ['src/lib/**']}, ...config];
