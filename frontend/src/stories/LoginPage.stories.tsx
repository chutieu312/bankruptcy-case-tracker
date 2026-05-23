import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, within } from '@storybook/test'
import LoginPage from '../pages/LoginPage'

const meta: Meta<typeof LoginPage> = {
  title: 'Pages/LoginPage',
  component: LoginPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Login page with email/password form. Manages loading and error state internally. Uses the `login()` method from AuthContext.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof LoginPage>

// ── Idle (empty form) ─────────────────────────────────────────────────────────
export const Idle: Story = {
  parameters: {
    mockAuth: {
      token: null,
      fullName: null,
      role: null,
      isAuthenticated: false,
      login: async () => {},
      logout: () => {},
    },
  },
}

// ── Error state — login() throws → red banner appears ─────────────────────────
export const WithError: Story = {
  parameters: {
    mockAuth: {
      token: null,
      fullName: null,
      role: null,
      isAuthenticated: false,
      login: async () => {
        throw new Error('Invalid credentials')
      },
      logout: () => {},
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(
      canvas.getByPlaceholderText('attorney@strettodemo.com'),
      'bad@example.com',
    )
    await userEvent.type(canvas.getByPlaceholderText('demo1234'), 'wrongpassword')
    await userEvent.click(canvas.getByRole('button', { name: /sign in/i }))
    await expect(canvas.getByText(/invalid email or password/i)).toBeInTheDocument()
  },
}

// ── Loading state — login() never resolves → button stays disabled ────────────
export const Loading: Story = {
  parameters: {
    mockAuth: {
      token: null,
      fullName: null,
      role: null,
      isAuthenticated: false,
      login: () => new Promise<void>(() => {}), // never resolves
      logout: () => {},
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(
      canvas.getByPlaceholderText('attorney@strettodemo.com'),
      'attorney@strettodemo.com',
    )
    await userEvent.type(canvas.getByPlaceholderText('demo1234'), 'demo1234')
    await userEvent.click(canvas.getByRole('button', { name: /sign in/i }))
    await expect(canvas.getByRole('button', { name: /signing in/i })).toBeDisabled()
  },
}
