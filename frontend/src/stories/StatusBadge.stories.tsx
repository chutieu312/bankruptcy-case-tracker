/**
 * StatusBadge stories — visual reference for all four case status variants.
 *
 * STATUS_COLORS lives inline in CasesPage; these stories reproduce the exact
 * className mapping so reviewers can verify colours at a glance without running
 * the full application.
 *
 * JD skill demonstrated: component-level documentation, design-system thinking
 */
import type { Meta, StoryObj } from '@storybook/react'
import type { CaseStatus } from '../types'

const STATUS_COLORS: Record<CaseStatus, string> = {
  OPEN: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-700',
  DISMISSED: 'bg-red-100 text-red-700',
  CONVERTED: 'bg-yellow-100 text-yellow-800',
}

const STATUSES: CaseStatus[] = ['OPEN', 'CLOSED', 'DISMISSED', 'CONVERTED']

/** Renders the badge exactly as CasesPage does. */
function StatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status]}`}
    >
      {status}
    </span>
  )
}

const meta: Meta<typeof StatusBadge> = {
  title: 'Components/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Inline badge used on every case row in CasesPage. Colour is driven by `STATUS_COLORS` — a simple Record mapping each `CaseStatus` to Tailwind utility classes.',
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: STATUSES,
    },
  },
}

export default meta
type Story = StoryObj<typeof StatusBadge>

export const Open: Story = { args: { status: 'OPEN' } }
export const Closed: Story = { args: { status: 'CLOSED' } }
export const Dismissed: Story = { args: { status: 'DISMISSED' } }
export const Converted: Story = { args: { status: 'CONVERTED' } }

// ── All four at once ──────────────────────────────────────────────────────────
export const AllStatuses: Story = {
  name: 'All Statuses',
  render: () => (
    <div className="flex gap-3 flex-wrap p-4">
      {STATUSES.map((s) => (
        <StatusBadge key={s} status={s} />
      ))}
    </div>
  ),
}
