// Crisis detection for the server. The implementation is shared with the client
// (shared/crisis.js) so both use identical rules.
export { detectCrisis, crisisResponse, CRISIS_PATTERNS, CRISIS_RESOURCES } from "../shared/crisis.js";
