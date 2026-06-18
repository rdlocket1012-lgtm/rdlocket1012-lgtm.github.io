/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: 'widget',
  name: 'LocketWidget',
  icon: '../../assets/icon.png',
  colors: {
    // Brand palette available to the widget as Color("...") asset references
    $cream: '#FBF3E0',
    $ink: '#2A211A',
    $pink: '#F48FB1',
    $gold: '#FFC94D',
  },
  entitlements: {
    'com.apple.security.application-groups': ['group.com.siren96.locket'],
  },
  // App Intents need network access to hit the Edge Function
  deploymentTarget: '17.0',
};
