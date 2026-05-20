import api from './client'
import type { Case, CaseRequest, CaseStatus, Page, StatusSummary } from '@/types'

export const casesApi = {
  search: (params: {
    status?: CaseStatus
    chapter?: number
    debtorName?: string
    fromDate?: string
    toDate?: string
    page?: number
    size?: number
  }) => api.get<Page<Case>>('/cases', { params }).then((r) => r.data),

  summary: () => api.get<StatusSummary>('/cases/summary').then((r) => r.data),

  getById: (id: number) => api.get<Case>(`/cases/${id}`).then((r) => r.data),

  create: (req: CaseRequest) => api.post<Case>('/cases', req).then((r) => r.data),

  update: (id: number, req: CaseRequest) =>
    api.put<Case>(`/cases/${id}`, req).then((r) => r.data),

  updateStatus: (id: number, status: CaseStatus) =>
    api.patch<Case>(`/cases/${id}/status`, null, { params: { status } }).then((r) => r.data),
}

export const documentsApi = {
  list: (caseId: number) =>
    api.get(`/cases/${caseId}/documents`).then((r) => r.data),

  upload: (caseId: number, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/cases/${caseId}/documents`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  downloadUrl: (caseId: number, documentId: number) =>
    api.get<{ url: string }>(`/cases/${caseId}/documents/${documentId}/download-url`)
       .then((r) => r.data.url),

  delete: (caseId: number, documentId: number) =>
    api.delete(`/cases/${caseId}/documents/${documentId}`),
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; fullName: string; role: string }>('/auth/login', { email, password })
       .then((r) => r.data),

  register: (email: string, password: string, fullName: string) =>
    api.post<{ token: string; fullName: string; role: string }>('/auth/register', {
      email, password, fullName,
    }).then((r) => r.data),
}
