import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { casesApi } from '@/api'
import type { Case, CaseStatus, Page, StatusSummary } from '@/types'

const STATUS_COLORS: Record<CaseStatus, string> = {
  OPEN: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-700',
  DISMISSED: 'bg-red-100 text-red-700',
  CONVERTED: 'bg-yellow-100 text-yellow-800',
}

export default function CasesPage() {
  const [page, setPage] = useState<Page<Case> | null>(null)
  const [summary, setSummary] = useState<StatusSummary>({})
  const [filters, setFilters] = useState({
    debtorName: '', status: '' as CaseStatus | '', chapter: '' as number | '',
  })
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [pageData, summaryData] = await Promise.all([
        casesApi.search({
          debtorName: filters.debtorName || undefined,
          status: filters.status || undefined,
          chapter: filters.chapter || undefined,
          page: currentPage,
          size: 10,
        }),
        casesApi.summary(),
      ])
      setPage(pageData)
      setSummary(summaryData)
    } finally {
      setLoading(false)
    }
  }, [filters, currentPage])

  useEffect(() => { load() }, [load])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {['OPEN', 'CLOSED', 'DISMISSED', 'CONVERTED'].map((s) => (
          <div key={s} className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{s}</p>
            <p className="text-3xl font-bold text-gray-800">{summary[s] ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search debtor name…"
          value={filters.debtorName}
          onChange={(e) => { setFilters((f) => ({ ...f, debtorName: e.target.value })); setCurrentPage(0) }}
          className="border border-gray-300 rounded px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filters.status}
          onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value as CaseStatus | '' })); setCurrentPage(0) }}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {['OPEN', 'CLOSED', 'DISMISSED', 'CONVERTED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filters.chapter}
          onChange={(e) => { setFilters((f) => ({ ...f, chapter: e.target.value ? Number(e.target.value) : '' })); setCurrentPage(0) }}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Chapters</option>
          <option value="7">Chapter 7</option>
          <option value="11">Chapter 11</option>
          <option value="13">Chapter 13</option>
        </select>
        <Link
          to="/cases/new"
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors ml-auto"
        >
          + New Case
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Case #', 'Debtor', 'Ch.', 'Status', 'Filed', 'District', 'Assigned To'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {page?.content.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-blue-600 hover:underline">
                    <Link to={`/cases/${c.id}`}>{c.caseNumber}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">{c.debtorName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.chapter}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.filingDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.courtDistrict ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.assignedTo?.fullName ?? '—'}</td>
                </tr>
              ))}
              {page?.content.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No cases found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {page && page.totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm text-gray-600">
            <span>{page.totalElements} total cases</span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
              >Prev</button>
              <span className="px-3 py-1">{currentPage + 1} / {page.totalPages}</span>
              <button
                disabled={currentPage >= page.totalPages - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
              >Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
