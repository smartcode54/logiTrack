/**
 * Firebase Services Export
 * ส่งออกบริการ Firebase ทั้งหมดเพื่อใช้งานในแอปพลิเคชัน
 */

// Configuration
export { app, auth, db, storage, functions, analytics, appCheck } from "./config";
export { default as firebaseApp } from "./config";

// Authentication
export * from "./auth";

// App Check
export {
  initializeAppCheckV3,
  initializeAppCheckEnterprise,
  initializeAppCheckAuto,
  getAppCheck,
  isAppCheckInitialized,
  // Debug utilities
  getAppCheckDebugInfo,
  logAppCheckDebugInfo,
  verifyRecaptchaScript,
  testRecaptchaToken,
  debugAppCheck,
} from "./appCheck";

// Database (Firestore)
export {
  jobsService,
  deliveredJobsService,
  expensesService,
  workflowService,
  batchService,
} from "./database";

// Storage
export {
  uploadFile,
  uploadFileWithProgress,
  deleteFile,
  getFileURL,
  listFiles,
  uploadBase64Image,
  uploadMultipleFiles,
  expenseReceiptsService,
  jobPhotosService,
  profilePhotosService,
} from "./storage";

// Cloud Functions
export {
  geocodingFunctions,
  callCloudFunction,
} from "./functions";

// Workflow Database
export * from "./workflowDatabase";
export * from "./workflowActivities";
export * from "./workflowDatabaseHelpers";

