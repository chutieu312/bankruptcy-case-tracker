import type { Preview, Decorator } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../src/context/AuthContext'
import { mockAuthAttorney } from '../src/stories/mockAuth'
import '../src/index.css'


// ── Global decorators: every story is wrapped with MemoryRouter + AuthContext ──
const withRouter: Decorator = (Story) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
)

const withAuth: Decorator = (Story, context) => {
  const authValue = context.parameters.mockAuth ?? mockAuthAttorney
  return (
    <AuthContext.Provider value={authValue}>
      <Story />
    </AuthContext.Provider>
  )
}

const preview: Preview = {
  decorators: [withAuth, withRouter],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'fullscreen',
  },
}

export default preview
