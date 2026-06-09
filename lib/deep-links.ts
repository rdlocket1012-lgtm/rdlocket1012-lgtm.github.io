import * as Linking from 'expo-linking';

export function buildInviteLink(token: string): string {
  return `locket://invite?token=${token}`;
}

export function parseInviteToken(url: string): string | null {
  try {
    const parsed = Linking.parse(url);
    return (parsed.queryParams?.token as string) ?? null;
  } catch {
    return null;
  }
}
