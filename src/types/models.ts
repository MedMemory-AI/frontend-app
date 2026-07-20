export type User = {
  id: string;
  email: string;
  fullName: string;
  createdAt?: string;
};

export type MedicalRecord = {
  id: string;
  title: string;
  recordType: string;
  createdAt: string;
  updatedAt: string;
};

export type MemoryEntry = {
  id: string;
  content: string;
  sourceRecordId?: string;
  createdAt: string;
};
