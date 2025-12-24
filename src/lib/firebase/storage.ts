import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  StorageReference,
  UploadTask,
  UploadTaskSnapshot,
} from "firebase/storage";
import { storage } from "./config";

/**
 * Firebase Storage Service
 * บริการสำหรับจัดการไฟล์และรูปภาพใน Firebase Storage
 */

// Storage paths
const STORAGE_PATHS = {
  EXPENSE_RECEIPTS: "expenses/receipts",
  EXPENSE_FUEL_IMAGES: "expenses/fuel",
  JOB_PHOTOS: "jobs/photos",
  WORKFLOW_PHOTOS: "workflows/photos",
  PROFILE_PHOTOS: "profiles/photos",
} as const;

type StoragePath = typeof STORAGE_PATHS[keyof typeof STORAGE_PATHS];

/**
 * Generate storage path for a file
 */
const getStoragePath = (
  basePath: StoragePath,
  userId: string,
  fileName: string,
  subFolder?: string
): string => {
  if (subFolder) {
    return `${basePath}/${userId}/${subFolder}/${fileName}`;
  }
  return `${basePath}/${userId}/${fileName}`;
};

/**
 * Upload a file to Firebase Storage
 */
export const uploadFile = async (
  file: File | Blob,
  path: string,
  metadata?: { [key: string]: string }
): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const uploadMetadata = metadata
      ? { customMetadata: metadata }
      : undefined;

    await uploadBytes(storageRef, file, uploadMetadata);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

/**
 * Upload a file with progress tracking
 */
export const uploadFileWithProgress = (
  file: File | Blob,
  path: string,
  onProgress?: (progress: number) => void,
  metadata?: { [key: string]: string }
): UploadTask => {
  try {
    const storageRef = ref(storage, path);
    const uploadMetadata = metadata
      ? { customMetadata: metadata }
      : undefined;

    const uploadTask = uploadBytesResumable(storageRef, file, uploadMetadata);

    uploadTask.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error("Upload error:", error);
        throw error;
      }
    );

    return uploadTask;
  } catch (error) {
    console.error("Error starting upload:", error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage
 */
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

/**
 * Get download URL for a file
 */
export const getFileURL = async (path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error getting file URL:", error);
    throw error;
  }
};

/**
 * List all files in a folder
 */
export const listFiles = async (path: string): Promise<string[]> => {
  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    const urls = await Promise.all(
      result.items.map((item) => getDownloadURL(item))
    );
    return urls;
  } catch (error) {
    console.error("Error listing files:", error);
    throw error;
  }
};

/**
 * Expense Receipts Operations
 */
export const expenseReceiptsService = {
  // Upload expense receipt image
  uploadReceipt: async (
    file: File | Blob,
    userId: string,
    expenseId: string,
    index?: number
  ): Promise<string> => {
    const fileName = index !== undefined ? `receipt_${index}.jpg` : "receipt.jpg";
    const path = getStoragePath(
      STORAGE_PATHS.EXPENSE_RECEIPTS,
      userId,
      fileName,
      expenseId
    );
    return await uploadFile(file, path, {
      expenseId,
      userId,
      type: "receipt",
    });
  },

  // Upload fuel-related images
  uploadFuelImage: async (
    file: File | Blob,
    userId: string,
    expenseId: string,
    imageType: "beforeFill" | "receipt"
  ): Promise<string> => {
    const fileName = `${imageType}.jpg`;
    const path = getStoragePath(
      STORAGE_PATHS.EXPENSE_FUEL_IMAGES,
      userId,
      fileName,
      expenseId
    );
    return await uploadFile(file, path, {
      expenseId,
      userId,
      type: "fuel",
      imageType,
    });
  },

  // Delete expense receipt
  deleteReceipt: async (
    userId: string,
    expenseId: string,
    fileName: string
  ): Promise<void> => {
    const path = getStoragePath(
      STORAGE_PATHS.EXPENSE_RECEIPTS,
      userId,
      fileName,
      expenseId
    );
    await deleteFile(path);
  },
};

/**
 * Job Photos Operations
 */
export const jobPhotosService = {
  // Upload job photo
  uploadJobPhoto: async (
    file: File | Blob,
    userId: string,
    jobId: string,
    photoType: string
  ): Promise<string> => {
    const fileName = `${photoType}.jpg`;
    const path = getStoragePath(
      STORAGE_PATHS.JOB_PHOTOS,
      userId,
      fileName,
      jobId
    );
    return await uploadFile(file, path, {
      jobId,
      userId,
      type: "job",
      photoType,
    });
  },

  // Upload workflow photo (pickup, delivery, incident, etc.)
  uploadWorkflowPhoto: async (
    file: File | Blob,
    userId: string,
    jobId: string,
    workflowStep: string,
    photoType: string
  ): Promise<string> => {
    const fileName = `${photoType}.jpg`;
    const path = getStoragePath(
      STORAGE_PATHS.WORKFLOW_PHOTOS,
      userId,
      fileName,
      `${jobId}/${workflowStep}`
    );
    return await uploadFile(file, path, {
      jobId,
      userId,
      workflowStep,
      photoType,
    });
  },

  // Upload multiple workflow photos
  uploadWorkflowPhotos: async (
    files: Array<{ file: File | Blob; photoType: string }>,
    userId: string,
    jobId: string,
    workflowStep: string,
    onProgress?: (progress: number) => void
  ): Promise<string[]> => {
    const uploadPromises = files.map(({ file, photoType }) =>
      jobPhotosService.uploadWorkflowPhoto(
        file,
        userId,
        jobId,
        workflowStep,
        photoType
      )
    );

    const urls = await Promise.all(uploadPromises);
    return urls;
  },

  // Delete job photo
  deleteJobPhoto: async (
    userId: string,
    jobId: string,
    photoType: string
  ): Promise<void> => {
    const fileName = `${photoType}.jpg`;
    const path = getStoragePath(
      STORAGE_PATHS.JOB_PHOTOS,
      userId,
      fileName,
      jobId
    );
    await deleteFile(path);
  },
};

/**
 * Profile Photos Operations
 */
export const profilePhotosService = {
  // Upload profile photo
  uploadProfilePhoto: async (
    file: File | Blob,
    userId: string
  ): Promise<string> => {
    const fileName = `profile_${Date.now()}.jpg`;
    const path = getStoragePath(
      STORAGE_PATHS.PROFILE_PHOTOS,
      userId,
      fileName
    );
    return await uploadFile(file, path, {
      userId,
      type: "profile",
    });
  },

  // Delete profile photo
  deleteProfilePhoto: async (userId: string, fileName: string): Promise<void> => {
    const path = getStoragePath(
      STORAGE_PATHS.PROFILE_PHOTOS,
      userId,
      fileName
    );
    await deleteFile(path);
  },
};

/**
 * Convert base64 image to blob and upload
 */
export const uploadBase64Image = async (
  base64String: string,
  path: string,
  metadata?: { [key: string]: string }
): Promise<string> => {
  try {
    // Convert base64 to blob
    const response = await fetch(base64String);
    const blob = await response.blob();
    return await uploadFile(blob, path, metadata);
  } catch (error) {
    console.error("Error uploading base64 image:", error);
    throw error;
  }
};

/**
 * Upload multiple files with progress tracking
 */
export const uploadMultipleFiles = async (
  files: Array<{ file: File | Blob; path: string }>,
  onProgress?: (progress: number) => void
): Promise<string[]> => {
  try {
    const totalFiles = files.length;
    let completedFiles = 0;
    const urls: string[] = [];

    const uploadPromises = files.map(({ file, path }, index) => {
      return new Promise<string>((resolve, reject) => {
        const uploadTask = uploadFileWithProgress(
          file,
          path,
          (fileProgress) => {
            // Calculate overall progress
            const overallProgress =
              (completedFiles / totalFiles) * 100 +
              fileProgress / totalFiles;
            if (onProgress) {
              onProgress(overallProgress);
            }
          }
        );

        uploadTask.then(async (snapshot) => {
          const url = await getDownloadURL(snapshot.ref);
          completedFiles++;
          urls[index] = url;
          resolve(url);
        }).catch(reject);
      });
    });

    await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error("Error uploading multiple files:", error);
    throw error;
  }
};

