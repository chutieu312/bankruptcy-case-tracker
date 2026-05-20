// TypeScript interfaces matching the Spring Boot API models

export type CaseStatus = 'OPEN' | 'CLOSED' | 'DISMISSED' | 'CONVERTED'

export interface User {
  id: number
  email: string
  fullName: string
  role: 'ADMIN' | 'ATTORNEY' | 'TRUSTEE'
}

export interface Case {
  id: number
  caseNumber: string
  debtorName: string
  chapter: number
  status: CaseStatus
  filingDate: string
  courtDistrict?: string
  judgeName?: string
  trusteeName?: string
  notes?: string
  assignedTo?: User
  createdBy?: User
  createdAt: string
  updatedAt: string
}

export interface Document {
  id: number
  fileName: string
  s3Key: string
  contentType?: string
  fileSizeBytes?: number
  uploadedAt: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface StatusSummary {
  [status: string]: number
}

export interface CaseRequest {
  caseNumber: string
  debtorName: string
  chapter: number
  filingDate: string
  courtDistrict?: string
  judgeName?: string
  trusteeName?: string
  notes?: string
  assignedToId?: number
}

export interface AuthState {
  token: string | null
  fullName: string | null
  role: string | null
}
