import type { Meta, StoryObj } from '@storybook/react'
import Layout from '../components/Layout'
import { mockAuthAdmin, mockAuthAttorney, mockAuthTrustee } from './mockAuth'

const meta: Meta<typeof Layout> = {
  title: 'Components/Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The main shell component — top navigation bar with user info and sign-out button. Wraps every authenticated page.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Layout>

const PageContent = () => (
  <div className="p-6 max-w-7xl mx-auto">
    <div className="bg-white rounded-lg shadow p-8 text-gray-600">
      Page content renders here (CasesPage, CaseDetailPage, etc.)
    </div>
  </div>
)

// ── Attorney (default role) ──────────────────────────────────────────────────
export const AsAttorney: Story = {
  parameters: { mockAuth: mockAuthAttorney },
  render: () => (
    <Layout>
      <PageContent />
    </Layout>
  ),
}

// ── Admin role ───────────────────────────────────────────────────────────────
export const AsAdmin: Story = {
  parameters: { mockAuth: mockAuthAdmin },
  render: () => (
    <Layout>
      <PageContent />
    </Layout>
  ),
}

// ── Trustee role ─────────────────────────────────────────────────────────────
export const AsTrustee: Story = {
  parameters: { mockAuth: mockAuthTrustee },
  render: () => (
    <Layout>
      <PageContent />
    </Layout>
  ),
}
