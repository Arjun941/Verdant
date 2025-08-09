export type Transaction = {
  id: string;
  date: string; // ISO 8601 format
  description: string;
  amount: number;
  category: string;
};

export type UserProfile = {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  balance?: number;
};

export type Insight = {
  id: string;
  createdAt: string; // ISO 8601 format
  summary: string;
  detailedAnalysis: string;
};
