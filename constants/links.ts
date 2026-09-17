// Public web URLs, hosted on GitHub Pages from the rdlocket1012-lgtm/locketfortwo.com repo.
// The old rdlocket1012-lgtm.github.io host stays live (and in associatedDomains) so
// Universal Links keep working in builds shipped before the domain moved.
export const SITE_URL = 'https://locketfortwo.com';

export const SUPPORT_EMAIL = 'hello@locketfortwo.com';

export const LINKS = {
  privacyPolicy: `${SITE_URL}/privacy-policy/`,
  termsOfService: `${SITE_URL}/terms-of-service/`,
  resetPassword: `${SITE_URL}/reset-password`,
  confirmEmail: `${SITE_URL}/confirm-email`,
  invite: (token: string) => `${SITE_URL}/invite?token=${encodeURIComponent(token)}`,
} as const;
