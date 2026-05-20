import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import CasesPage from '@/pages/CasesPage'
import * as api from '@/api'
import type { Page, Case, StatusSummary } from '@/types'

// Mock the entire API module
vi.mock('@/api', () => ({
  casesApi: {
    search: vi.fn(),
    summary: vi.fn(),
  },
  documentsApi: {},
  authApi: {},
}))

const mockCase: Case = {
  id: 1,
  caseNumber: '2024-BK-00001',
  debtorName: 'Acme Corp',
  chapter: 11,
  status: 'OPEN',
  filingDate: '2024-01-15',
  createdAt: '2024-01-15T00:00:00',
  updatedAt: '2024-01-15T00:00:00',
}

const mockPage: Page<Case> = {
  content: [mockCase],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 10,
}

const mockSummary: StatusSummary = { OPEN: 3, CLOSED: 1, DISMISSED: 0, CONVERTED: 0 }

describe('CasesPage', () => {
  it('renders case list after loading', async () => {
    vi.mocked(api.casesApi.search).mockResolvedValue(mockPage)
    vi.mocked(api.casesApi.summary).mockResolvedValue(mockSummary)

    render(
      <MemoryRouter>
        <CasesPage />
      </MemoryRouter>
    )

    // Status summary cards
    expect(await screen.findByText('3')).toBeInTheDocument()

    // Case row
    expect(await screen.findByText('2024-BK-00001')).toBeInTheDocument()
    expect(await screen.findByText('Acme Corp')).toBeInTheDocument()
  })

  it('shows "No cases found" when page is empty', async () => {
    const emptyPage: Page<Case> = { ...mockPage, content: [], totalElements: 0 }
    vi.mocked(api.casesApi.search).mockResolvedValue(emptyPage)
    vi.mocked(api.casesApi.summary).mockResolvedValue({})

    render(
      <MemoryRouter>
        <CasesPage />
      </MemoryRouter>
    )

    expect(await screen.findByText('No cases found')).toBeInTheDocument()
  })
})
