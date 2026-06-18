# Expo SDK 54 — Locket App

This project runs **Expo SDK ~54.0.35** with expo-router ~6.0.24.

Before writing any Expo or React Native code:
1. Check `CLAUDE.md` for project rules, design tokens, and library preferences
2. Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/
3. Do NOT assume API shapes from memory — Expo APIs change between SDK versions

Key facts:
- `@bacons/apple-targets` is installed — this requires **custom dev builds**, not Expo Go
- Use `eas build --profile development` for iOS builds on Windows (no Xcode needed)
- Supabase is the backend — client in `lib/supabase.ts`, auth in `stores/auth.store.ts`
- All design decisions are in `docs/DESIGN.md`
