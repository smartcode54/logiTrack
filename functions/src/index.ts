/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import { CONFIG_INFO, FUNCTION_CONFIG } from "./utils/config";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// Log configuration for debugging
console.log("Cloud Functions Configuration:", CONFIG_INFO);

// Set global options for all functions
// This includes App Check enforcement and other global settings
setGlobalOptions({
  maxInstances: 10, // For cost control - maximum concurrent containers
  ...FUNCTION_CONFIG, // Includes enforceAppCheck and other config
});

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.

// Export all Cloud Functions

// reCAPTCHA Functions
export { verifyRecaptcha } from "./recaptcha/verify";

// Geocoding Functions
export { reverse_geocode } from "./geocoding/reverseGeocode";

// Workflow Activities Functions
export {
  save_check_in_activity,
  save_pickup_activity,
  save_departure_activity,
  save_incident_selection_activity,
  save_incident_photos_activity,
  save_arrival_activity,
  save_delivery_activity,
  get_job_activities,
  get_driver_activities,
} from "./workflow/activities";

// Admin Functions
export { set_admin_role, check_admin, get_all_users, get_user_stats } from "./admin/admin";
