/** Reusable mock AuthContext values for Storybook stories. */

export const mockAuthAttorney = {
  token: 'mock-token',
  fullName: 'Jane Smith',
  role: 'ATTORNEY' as const,
  isAuthenticated: true,
  login: async () => {},
  logout: () => {},
}

export const mockAuthAdmin = {
  ...mockAuthAttorney,
  fullName: 'Admin User',
  role: 'ADMIN' as const,
}

export const mockAuthTrustee = {
  ...mockAuthAttorney,
  fullName: 'Bob Trustee',
  role: 'TRUSTEE' as const,
}
