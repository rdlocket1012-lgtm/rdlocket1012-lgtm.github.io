/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: 'widget',
  name: 'LocketWidget',
  icon: '../../assets/icon.png',
  entitlements: {
    'com.apple.security.application-groups': ['group.com.siren96.locket'],
    // Shared with the main app so the nudge App Intent can read the auth tokens
    // out of the Keychain (not plaintext UserDefaults). Must match the app's
    // keychain-access-groups entitlement exactly.
    'keychain-access-groups': ['$(AppIdentifierPrefix)com.siren96.locket'],
  },
  // 17.0: interactive widget buttons (Button(intent:)) and containerBackground
  // are iOS 17+. Lock-screen accessory families still render on 17+, so there's
  // no reason to support 16 — the old iOS-16 deep-link fallback is removed.
  deploymentTarget: '17.0',
};
