'use server';

import { db } from './firebase';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, where, Timestamp, doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Transaction, UserProfile, Insight } from './types';

export async function addTransaction(userId: string, transaction: Omit<Transaction, 'id'>) {
  try {
    const transactionsCol = collection(db, 'users', userId, 'transactions');
    await addDoc(transactionsCol, {
      ...transaction,
      date: new Date(transaction.date), // Store as Firestore Timestamp for correct sorting
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding transaction: ", error);
    throw error;
  }
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
  try {
    const transactionsCol = collection(db, 'users', userId, 'transactions');
    const q = query(transactionsCol, orderBy('date', 'desc')); 
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore Timestamp back to an ISO string for the client.
      const date = (data.date as Timestamp)?.toDate().toISOString() || new Date().toISOString();
      
      return {
        id: doc.id,
        description: data.description,
        amount: data.amount,
        category: data.category,
        date: date,
      } as Transaction;
    });
  } catch (error) {
    console.error("Error getting transactions: ", error);
    return [];
  }
}

export async function updateUserProfile(userId: string, profileData: Partial<UserProfile>) {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, profileData, { merge: true });
  } catch (error) {
    console.error("Error updating user profile: ", error);
    throw error;
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile: ", error);
    return null;
  }
}

export async function updateTransaction(userId: string, transactionId: string, transaction: Partial<Omit<Transaction, 'id'>>) {
  try {
    const transactionDocRef = doc(db, 'users', userId, 'transactions', transactionId);
    await updateDoc(transactionDocRef, {
      ...transaction,
      ...(transaction.date && { date: new Date(transaction.date) }),
    });
  } catch (error) {
    console.error("Error updating transaction: ", error);
    throw error;
  }
}

export async function deleteTransaction(userId: string, transactionId: string) {
  try {
    const transactionDocRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(transactionDocRef);
  } catch (error) {
    console.error("Error deleting transaction: ", error);
    throw error;
  }
}


// Functions for handling AI-generated insights.

export async function addInsight(userId: string, insight: Omit<Insight, 'id'>): Promise<string> {
  try {
    const insightsCol = collection(db, 'users', userId, 'insights');
    const docRef = await addDoc(insightsCol, {
      ...insight,
      createdAt: new Date(insight.createdAt), // Store as Firestore Timestamp
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding insight: ", error);
    throw error;
  }
}

export async function getInsights(userId: string): Promise<Insight[]> {
  try {
    const insightsCol = collection(db, 'users', userId, 'insights');
    const q = query(insightsCol, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();

      return {
        id: doc.id,
        summary: data.summary,
        detailedAnalysis: data.detailedAnalysis,
        createdAt: createdAt,
      } as Insight;
    });
  } catch (error) {
    console.error("Error getting insights: ", error);
    return [];
  }
}

export async function deleteInsight(userId: string, insightId: string) {
  try {
    const insightDocRef = doc(db, 'users', userId, 'insights', insightId);
    await deleteDoc(insightDocRef);
  } catch (error) {
    console.error("Error deleting insight: ", error);
    throw error;
  }
}
