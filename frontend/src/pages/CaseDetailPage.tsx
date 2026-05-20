import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { casesApi, documentsApi } from '@/api'
import type { Case, CaseStatus, Document } from '@/types'

const STATUS_OPTIONS: CaseStatus[] = ['OPEN', 'CLOSED', 'DISMISSED', 'CONVERTED']

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)

  useEffect(() => {
    if (!id) return
    const caseId = Number(id)
    casesApi.getById(caseId).then(setCaseData)
    documentsApi.list(caseId).then(setDocuments)
  }, [id])

  const handleStatusChange = async (newStatus: CaseStatus) => {
    if (!caseData) return
    setStatusUpdating(true)
    try {
      const updated = await casesApi.updateStatus(caseData.id, newStatus)
      setCaseData(updated)
    } finally {
      setStatusUpdating(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !caseData) return
    setUploading(true)
    try {
      const doc = await documentsApi.upload(caseData.id, file)
      setDocuments((prev) => [...prev, doc])
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDownload = async (doc: Document) => {
    if (!caseData) return
    const url = await documentsApi.downloadUrl(caseData.id, doc.id)
    window.open(url, '_blank')
  }

  const handleDeleteDoc = async (doc: Document) => {
    if (!caseData || !window.confirm(`Delete "${doc.fileName}"?`)) return
    await documentsApi.delete(caseData.id, doc.id)
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id))
  }

  if (!caseData) return <div className="p-8 text-center text-gray-400">Loading…</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline mb-4 block">
        ← Back to cases
      </button>

      {/* Case Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{caseData.caseNumber}</h1>
            <p className="text-gray-600">{caseData.debtorName}</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={caseData.status}
              disabled={statusUpdating}
              onChange={(e) => handleStatusChange(e.target.value as CaseStatus)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {[
            ['Chapter', caseData.chapter],
            ['Filing Date', caseData.filingDate],
            ['Court District', caseData.courtDistrict ?? '—'],
            ['Judge', caseData.judgeName ?? '—'],
            ['Trustee', caseData.trusteeName ?? '—'],
            ['Assigned To', caseData.assignedTo?.fullName ?? '—'],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <p className="text-gray-500 text-xs uppercase tracking-wide">{label}</p>
              <p className="text-gray-800 font-medium">{String(value)}</p>
            </div>
          ))}
        </div>

        {caseData.notes && (
          <div className="mt-4">
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Notes</p>
            <p className="text-gray-700 text-sm">{caseData.notes}</p>
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Documents</h2>
          <label className={`cursor-pointer bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {uploading ? 'Uploading…' : '+ Upload'}
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        {documents.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No documents uploaded yet</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{doc.fileName}</p>
                  <p className="text-xs text-gray-400">
                    {doc.contentType} · {doc.fileSizeBytes ? `${(doc.fileSizeBytes / 1024).toFixed(1)} KB` : ''} · {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="text-xs text-blue-600 hover:underline"
                  >Download</button>
                  <button
                    onClick={() => handleDeleteDoc(doc)}
                    className="text-xs text-red-500 hover:underline"
                  >Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
