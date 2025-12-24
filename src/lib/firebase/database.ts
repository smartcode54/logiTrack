import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";
import { Job, DeliveredJob, Expense } from "@/types";

/**
 * Firebase Firestore Database Service
 * บริการสำหรับจัดการข้อมูลใน Firestore Database
 */

// ==================== Jobs Collection ====================

const JOBS_COLLECTION = "jobs";
const DELIVERED_JOBS_COLLECTION = "deliveredJobs";
const EXPENSES_COLLECTION = "expenses";
const WORKFLOWS_COLLECTION = "workflows";

/**
 * Jobs Operations
 */
export const jobsService = {
  // Get all jobs for a user
  getJobs: async (userId: string): Promise<Job[]> => {
    try {
      const q = query(
        collection(db, JOBS_COLLECTION),
        where("userId", "==", userId),
        orderBy("scheduledTime", "asc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Job[];
    } catch (error) {
      console.error("Error getting jobs:", error);
      throw error;
    }
  },

  // Get a single job
  getJob: async (jobId: string): Promise<Job | null> => {
    try {
      const docRef = doc(db, JOBS_COLLECTION, jobId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Job;
      }
      return null;
    } catch (error) {
      console.error("Error getting job:", error);
      throw error;
    }
  },

  // Create a new job
  createJob: async (job: Omit<Job, "id">, userId: string): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, JOBS_COLLECTION), {
        ...job,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    }
  },

  // Update a job
  updateJob: async (jobId: string, updates: Partial<Job>): Promise<void> => {
    try {
      const docRef = doc(db, JOBS_COLLECTION, jobId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating job:", error);
      throw error;
    }
  },

  // Delete a job
  deleteJob: async (jobId: string): Promise<void> => {
    try {
      const docRef = doc(db, JOBS_COLLECTION, jobId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting job:", error);
      throw error;
    }
  },

  // Listen to jobs changes (real-time)
  subscribeToJobs: (
    userId: string,
    callback: (jobs: Job[]) => void
  ): (() => void) => {
    const q = query(
      collection(db, JOBS_COLLECTION),
      where("userId", "==", userId),
      orderBy("scheduledTime", "asc")
    );

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const jobs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Job[];
        callback(jobs);
      },
      (error) => {
        console.error("Error listening to jobs:", error);
      }
    );
  },
};

/**
 * Delivered Jobs Operations
 */
export const deliveredJobsService = {
  // Get all delivered jobs for a user
  getDeliveredJobs: async (userId: string): Promise<DeliveredJob[]> => {
    try {
      const q = query(
        collection(db, DELIVERED_JOBS_COLLECTION),
        where("userId", "==", userId),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DeliveredJob[];
    } catch (error) {
      console.error("Error getting delivered jobs:", error);
      throw error;
    }
  },

  // Create a delivered job
  createDeliveredJob: async (
    job: Omit<DeliveredJob, "id">,
    userId: string
  ): Promise<string> => {
    try {
      const docRef = await addDoc(
        collection(db, DELIVERED_JOBS_COLLECTION),
        {
          ...job,
          userId,
          timestamp: Timestamp.now(),
          createdAt: Timestamp.now(),
        }
      );
      return docRef.id;
    } catch (error) {
      console.error("Error creating delivered job:", error);
      throw error;
    }
  },

  // Update a delivered job
  updateDeliveredJob: async (
    jobId: string,
    updates: Partial<DeliveredJob>
  ): Promise<void> => {
    try {
      const docRef = doc(db, DELIVERED_JOBS_COLLECTION, jobId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating delivered job:", error);
      throw error;
    }
  },

  // Listen to delivered jobs changes (real-time)
  subscribeToDeliveredJobs: (
    userId: string,
    callback: (jobs: DeliveredJob[]) => void
  ): (() => void) => {
    const q = query(
      collection(db, DELIVERED_JOBS_COLLECTION),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const jobs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as DeliveredJob[];
        callback(jobs);
      },
      (error) => {
        console.error("Error listening to delivered jobs:", error);
      }
    );
  },
};

/**
 * Expenses Operations
 */
export const expensesService = {
  // Get all expenses for a user
  getExpenses: async (userId: string): Promise<Expense[]> => {
    try {
      const q = query(
        collection(db, EXPENSES_COLLECTION),
        where("userId", "==", userId),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Expense[];
    } catch (error) {
      console.error("Error getting expenses:", error);
      throw error;
    }
  },

  // Get expenses by category
  getExpensesByCategory: async (
    userId: string,
    category: Expense["category"]
  ): Promise<Expense[]> => {
    try {
      const q = query(
        collection(db, EXPENSES_COLLECTION),
        where("userId", "==", userId),
        where("category", "==", category),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Expense[];
    } catch (error) {
      console.error("Error getting expenses by category:", error);
      throw error;
    }
  },

  // Create a new expense
  createExpense: async (
    expense: Omit<Expense, "id">,
    userId: string
  ): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), {
        ...expense,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating expense:", error);
      throw error;
    }
  },

  // Update an expense
  updateExpense: async (
    expenseId: string,
    updates: Partial<Expense>
  ): Promise<void> => {
    try {
      const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  },

  // Delete an expense
  deleteExpense: async (expenseId: string): Promise<void> => {
    try {
      const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  },

  // Listen to expenses changes (real-time)
  subscribeToExpenses: (
    userId: string,
    callback: (expenses: Expense[]) => void
  ): (() => void) => {
    const q = query(
      collection(db, EXPENSES_COLLECTION),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const expenses = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Expense[];
        callback(expenses);
      },
      (error) => {
        console.error("Error listening to expenses:", error);
      }
    );
  },
};

/**
 * Workflow Operations
 */
export const workflowService = {
  // Save workflow state for a job
  saveWorkflowState: async (
    jobId: string,
    workflowData: any,
    userId: string
  ): Promise<void> => {
    try {
      const docRef = doc(db, WORKFLOWS_COLLECTION, `${userId}_${jobId}`);
      await setDoc(
        docRef,
        {
          jobId,
          userId,
          ...workflowData,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error saving workflow state:", error);
      throw error;
    }
  },

  // Get workflow state for a job
  getWorkflowState: async (
    jobId: string,
    userId: string
  ): Promise<any | null> => {
    try {
      const docRef = doc(db, WORKFLOWS_COLLECTION, `${userId}_${jobId}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error("Error getting workflow state:", error);
      throw error;
    }
  },

  // Delete workflow state
  deleteWorkflowState: async (
    jobId: string,
    userId: string
  ): Promise<void> => {
    try {
      const docRef = doc(db, WORKFLOWS_COLLECTION, `${userId}_${jobId}`);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting workflow state:", error);
      throw error;
    }
  },
};

/**
 * Batch Operations
 */
export const batchService = {
  // Execute multiple write operations atomically
  executeBatch: async (
    operations: Array<{
      type: "create" | "update" | "delete";
      collection: string;
      docId?: string;
      data?: any;
    }>
  ): Promise<void> => {
    try {
      const batch = writeBatch(db);

      operations.forEach((op) => {
        if (op.type === "create" && op.data) {
          const docRef = doc(collection(db, op.collection));
          batch.set(docRef, {
            ...op.data,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        } else if (op.type === "update" && op.docId && op.data) {
          const docRef = doc(db, op.collection, op.docId);
          batch.update(docRef, {
            ...op.data,
            updatedAt: Timestamp.now(),
          });
        } else if (op.type === "delete" && op.docId) {
          const docRef = doc(db, op.collection, op.docId);
          batch.delete(docRef);
        }
      });

      await batch.commit();
    } catch (error) {
      console.error("Error executing batch:", error);
      throw error;
    }
  },
};

