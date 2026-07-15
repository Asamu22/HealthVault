export interface PatientRecordItem {
  id: string;
  patient: {
    initials: string;
    name: string;
  };
  sensitivity: string;
  status: string;
  encryption: string;
  department: string;
  date: string;
  author: string;
  filePath: string;
  fileName: string;
  createdAt: string;
  reportUrl?: string;
}

export interface StaffMember {
  id: string;
  initials: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  status: 'Active' | 'Pending';
  lastActive: string;
  isAdmin?: boolean;
}
