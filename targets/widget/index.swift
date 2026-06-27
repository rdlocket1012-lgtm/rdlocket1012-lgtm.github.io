import WidgetKit
import SwiftUI
import AppIntents
import UIKit
import Security

let APP_GROUP = "group.com.siren96.locket"

// Auth tokens live in a shared Keychain access group (encrypted at rest), not
// the App Group's plaintext UserDefaults. These must match the JS side
// (lib/widget-bridge.ts) and the `keychain-access-groups` entitlement.
private let KEYCHAIN_ACCESS_GROUP = "6BSN47U3U2.com.siren96.locket"
// expo-secure-store stores non-authenticated items under "<service>:no-auth".
private let KEYCHAIN_SERVICE = "locket.widget:no-auth"

// Brand palette — explicit RGB so the widget never depends on an asset catalog.
extension Color {
  static let lkParch  = Color(red: 243/255, green: 233/255, blue: 210/255)  // Parchment #F3E9D2
  static let lkCream  = Color(red: 251/255, green: 245/255, blue: 232/255)  // Ivory #FBF5E8
  static let lkVellum = Color(red: 255/255, green: 253/255, blue: 247/255)  // Vellum #FFFDF7
  static let lkInk    = Color(red: 42/255,  green: 33/255,  blue: 26/255)   // Espresso
  static let lkCoral  = Color(red: 255/255, green: 122/255, blue: 107/255)  // Coral #FF7A6B
  static let lkBlush  = Color(red: 255/255, green: 158/255, blue: 196/255)  // Blush #FF9EC4
  static let lkSepia  = Color(red: 110/255, green: 98/255,  blue: 83/255)   // Sepia #6E6253
  static let lkFaded  = Color(red: 154/255, green: 138/255, blue: 99/255)   // Faded #9A8A63
  static let lkHair   = Color(red: 42/255,  green: 33/255,  blue: 26/255).opacity(0.10)
  static let lkBorder = Color(red: 42/255,  green: 33/255,  blue: 26/255).opacity(0.15)
}

// ─────────────────────────────────────────────────────────────
// MARK: - Keychain helpers
// ─────────────────────────────────────────────────────────────

/// Reads a string from the shared Keychain access group. Mirrors the attribute
/// shape expo-secure-store writes (generic password, raw-key account/generic).
private func keychainRead(_ key: String) -> String? {
  let account = Data(key.utf8)
  let query: [String: Any] = [
    kSecClass as String:           kSecClassGenericPassword,
    kSecAttrService as String:     KEYCHAIN_SERVICE,
    kSecAttrAccount as String:     account,
    kSecAttrAccessGroup as String: KEYCHAIN_ACCESS_GROUP,
    kSecMatchLimit as String:      kSecMatchLimitOne,
    kSecReturnData as String:      kCFBooleanTrue as Any,
  ]
  var item: CFTypeRef?
  guard SecItemCopyMatching(query as CFDictionary, &item) == errSecSuccess,
        let data = item as? Data,
        let str = String(data: data, encoding: .utf8)
  else { return nil }
  return str
}

/// Persists a refreshed token back into the shared Keychain so the JS side and
/// the next intent both read the up-to-date value.
private func keychainWrite(_ key: String, _ value: String) {
  let account = Data(key.utf8)
  let base: [String: Any] = [
    kSecClass as String:           kSecClassGenericPassword,
    kSecAttrService as String:     KEYCHAIN_SERVICE,
    kSecAttrAccount as String:     account,
    kSecAttrAccessGroup as String: KEYCHAIN_ACCESS_GROUP,
  ]
  let valueData = Data(value.utf8)
  let status = SecItemUpdate(base as CFDictionary, [kSecValueData as String: valueData] as CFDictionary)
  if status == errSecItemNotFound {
    var add = base
    add[kSecValueData as String]     = valueData
    add[kSecAttrGeneric as String]   = account
    add[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlock
    SecItemAdd(add as CFDictionary, nil)
  }
}

// ─────────────────────────────────────────────────────────────
// MARK: - Auth helpers
// ─────────────────────────────────────────────────────────────

/// Refreshes the Supabase access token using the stored refresh token.
/// Persists the new token pair back to the Keychain on success.
/// Returns a fresh access token, or nil if the refresh failed.
private func refreshAccessToken(base: String, anon: String, refreshToken: String) async -> String? {
  guard let url = URL(string: "\(base)/auth/v1/token?grant_type=refresh_token") else { return nil }
  var req = URLRequest(url: url)
  req.httpMethod = "POST"
  req.timeoutInterval = 10
  req.setValue("application/json", forHTTPHeaderField: "Content-Type")
  req.setValue(anon, forHTTPHeaderField: "apikey")
  req.httpBody = try? JSONSerialization.data(withJSONObject: ["refresh_token": refreshToken])
  guard
    let (data, _) = try? await URLSession.shared.data(for: req),
    let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
    let access = json["access_token"] as? String
  else { return nil }
  keychainWrite("widgetAccessToken", access)
  if let newRefresh = json["refresh_token"] as? String {
    keychainWrite("widgetRefreshToken", newRefresh)
  }
  return access
}

// ─────────────────────────────────────────────────────────────
// MARK: - Day Counter Widget
// ─────────────────────────────────────────────────────────────

struct LocketEntry: TimelineEntry {
  let date: Date
  let dayCount: Int
  let nickname: String
  let partnerEmoji: String
  let partnerName: String
  /// True for a few seconds right after a nudge fires, so the widget can flash
  /// a "sent" confirmation — the only sender-side feedback a widget can give.
  let justNudged: Bool
}

/// Computes the live day count from the stored relationship start date so the
/// number flips at local midnight without the app being opened.
///
/// This must match the app's value exactly (home screen shows it too). The app
/// uses date-fns `differenceInDays(now, new Date("YYYY-MM-DD")) + 1`, where the
/// bare date string is parsed as **UTC midnight** and `differenceInDays` is a
/// local calendar-day diff minus 1 when the final day isn't a full 24h. We
/// replicate that precisely (including its timezone quirks) for parity, and only
/// fall back to the last pushed value if no start date is available.
private func computeDayCount(_ d: UserDefaults?) -> Int {
  guard let raw = d?.string(forKey: "coupleStartDate"), !raw.isEmpty else {
    return Int(d?.string(forKey: "dayCount") ?? "0") ?? 0
  }
  let df = DateFormatter()
  df.calendar = Calendar(identifier: .gregorian)
  df.locale = Locale(identifier: "en_US_POSIX")
  df.timeZone = TimeZone(secondsFromGMT: 0)  // mirror JS `new Date("YYYY-MM-DD")`
  df.dateFormat = "yyyy-MM-dd"
  guard let start = df.date(from: String(raw.prefix(10))) else {
    return Int(d?.string(forKey: "dayCount") ?? "0") ?? 0
  }
  let cal = Calendar.current  // local time zone
  let now = Date()
  let calDays = cal.dateComponents([.day],
                                   from: cal.startOfDay(for: start),
                                   to: cal.startOfDay(for: now)).day ?? 0
  // "last day not full" adjustment from date-fns differenceInDays.
  let shifted = cal.date(byAdding: .day, value: -calDays, to: now) ?? now
  let notFull = shifted < start ? 1 : 0
  return (calDays - notFull) + 1
}

func readEntry() -> LocketEntry {
  let d = UserDefaults(suiteName: APP_GROUP)
  let nickname = d?.string(forKey: "coupleNickname") ?? "Us"
  let emoji    = d?.string(forKey: "partnerStatusEmoji") ?? "💛"
  let partner  = d?.string(forKey: "partnerName") ?? "Partner"

  // Show the "sent" state for 4s after a successful nudge stamped lastWidgetNudgeAt.
  var justNudged = false
  if let iso = d?.string(forKey: "lastWidgetNudgeAt"),
     let when = ISO8601DateFormatter().date(from: iso) {
    justNudged = Date().timeIntervalSince(when) < 4
  }
  return LocketEntry(date: Date(), dayCount: computeDayCount(d), nickname: nickname,
                     partnerEmoji: emoji, partnerName: partner, justNudged: justNudged)
}

/// Next local midnight (a few seconds past), so the counter refreshes exactly
/// when the day rolls over.
private func nextMidnight() -> Date {
  Calendar.current.nextDate(after: Date(),
                            matching: DateComponents(hour: 0, minute: 0, second: 5),
                            matchingPolicy: .nextTime) ?? Date().addingTimeInterval(1800)
}

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> LocketEntry {
    LocketEntry(date: Date(), dayCount: 47, nickname: "Us", partnerEmoji: "💛", partnerName: "Partner", justNudged: false)
  }
  func getSnapshot(in context: Context, completion: @escaping (LocketEntry) -> Void) {
    completion(readEntry())
  }
  func getTimeline(in context: Context, completion: @escaping (Timeline<LocketEntry>) -> Void) {
    let entry = readEntry()
    // While the "sent" confirmation is showing, refresh again shortly so it
    // clears back to the Nudge button; otherwise refresh at midnight so the
    // day count flips on time.
    let next = entry.justNudged ? Date().addingTimeInterval(4) : nextMidnight()
    completion(Timeline(entries: [entry], policy: .after(next)))
  }
}

// MARK: - Nudge App Intent

struct SendNudgeIntent: AppIntent {
  static var title: LocalizedStringResource = "Send a love nudge"
  static var description = IntentDescription("Sends a quick love nudge to your partner without opening the app.")

  func perform() async throws -> some IntentResult {
    await NudgeSender.send()
    return .result()
  }
}

enum NudgeSender {
  static func send() async {
    let d = UserDefaults(suiteName: APP_GROUP)

    // Cooldown — ignore repeated taps within 30s so we never spam the partner.
    if let iso = d?.string(forKey: "lastWidgetNudgeAt"),
       let when = ISO8601DateFormatter().date(from: iso),
       Date().timeIntervalSince(when) < 30 {
      return
    }

    guard
      let base = d?.string(forKey: "supabaseUrl"),
      let anon = d?.string(forKey: "anonKey")
    else { return }

    // Always try to refresh — access tokens expire after ~1 hour.
    // Fall back to the stored access token if refresh fails (e.g. offline).
    let freshToken: String?
    if let refresh = keychainRead("widgetRefreshToken") {
      freshToken = await refreshAccessToken(base: base, anon: anon, refreshToken: refresh)
    } else {
      freshToken = nil
    }
    let token = freshToken ?? keychainRead("widgetAccessToken") ?? ""
    guard !token.isEmpty, let url = URL(string: "\(base)/functions/v1/notify") else { return }

    var req = URLRequest(url: url)
    req.httpMethod = "POST"
    req.timeoutInterval = 10
    req.setValue("application/json", forHTTPHeaderField: "Content-Type")
    req.setValue(anon,              forHTTPHeaderField: "apikey")
    req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    req.httpBody = try? JSONSerialization.data(withJSONObject: [
      "type":  "nudge_hug",
      "title": "💛 Thinking of you",
      "body":  "A little love from the home screen.",
    ])
    // Only stamp "sent" on a real 2xx so the widget never shows a false confirm.
    if let (_, resp) = try? await URLSession.shared.data(for: req),
       let http = resp as? HTTPURLResponse, (200..<300).contains(http.statusCode) {
      d?.set(ISO8601DateFormatter().string(from: Date()), forKey: "lastWidgetNudgeAt")
    }
  }
}

// MARK: - Nudge button (shared)

struct NudgeButton: View {
  var sent: Bool = false

  var body: some View {
    Group {
      if sent {
        // Confirmation state — not tappable, auto-reverts on next refresh.
        sentChip
      } else {
        // Interactive App Intent — fires the nudge without launching the app.
        Button(intent: SendNudgeIntent()) { chip }
          .buttonStyle(.plain)
      }
    }
  }

  var chip: some View {
    HStack(spacing: 5) {
      Text("💋").font(.system(size: 13))
      Text("Nudge")
        .font(.system(size: 12, weight: .bold))
        .foregroundColor(Color.lkInk)
    }
    .padding(.horizontal, 12)
    .padding(.vertical, 7)
    .background(Color.lkBlush)
    .clipShape(Capsule())
  }

  var sentChip: some View {
    HStack(spacing: 5) {
      Image(systemName: "heart.fill").font(.system(size: 11)).foregroundColor(Color.lkInk)
      Text("Sent")
        .font(.system(size: 12, weight: .bold))
        .foregroundColor(Color.lkInk)
    }
    .padding(.horizontal, 12)
    .padding(.vertical, 7)
    .background(Color.lkBlush.opacity(0.55))
    .clipShape(Capsule())
  }
}

// MARK: - Widget views

struct LocketWidgetView: View {
  var entry: Provider.Entry
  @Environment(\.widgetFamily) var family

  var partnerFirst: String {
    let first = entry.partnerName.components(separatedBy: " ").first ?? entry.partnerName
    return String(first.prefix(12))
  }

  var body: some View {
    switch family {
    case .systemSmall:        smallView
    case .accessoryInline:    accessoryInlineView
    case .accessoryCircular:  accessoryCircularView
    case .accessoryRectangular: accessoryRectangularView
    default:                  mediumView
    }
  }

  // Hand-drawn ivory card on a parchment margin — the Cozy Scrapbook frame.
  private var cardShape: RoundedRectangle { RoundedRectangle(cornerRadius: 18, style: .continuous) }

  // ── Small ──────────────────────────────────────────────────
  var smallView: some View {
    VStack(alignment: .leading, spacing: 0) {

      // Top row: nickname + heart accent
      HStack(alignment: .center) {
        Text(entry.nickname.uppercased())
          .font(.system(size: 9, weight: .heavy))
          .tracking(1.8)
          .foregroundColor(Color.lkInk.opacity(0.40))
          .lineLimit(1)
        Spacer()
        Image(systemName: "heart.fill")
          .font(.system(size: 9))
          .foregroundColor(Color.lkCoral.opacity(0.70))
      }

      Spacer(minLength: 4)

      // Status emoji — partner's current mood
      Text(entry.partnerEmoji)
        .font(.system(size: 20))

      Spacer(minLength: 2)

      // Day number — hero
      Text("\(entry.dayCount)")
        .font(.system(size: 46, weight: .heavy, design: .rounded))
        .foregroundColor(Color.lkInk)
        .minimumScaleFactor(0.5)
        .lineLimit(1)

      // "days together" warm line — Sepia for legibility on parchment/ivory.
      Text("days together")
        .font(.system(size: 12, weight: .semibold, design: .serif))
        .italic()
        .foregroundColor(Color.lkSepia)
        .lineLimit(1)
        .minimumScaleFactor(0.8)
        .padding(.top, 1)

      Spacer(minLength: 6)

      NudgeButton(sent: entry.justNudged)
    }
    .padding(12)
    .background(cardShape.fill(Color.lkCream).overlay(cardShape.stroke(Color.lkBorder, lineWidth: 1.5)))
    .padding(8)
    .widgetURL(URL(string: "locket://home"))
    .containerBackground(Color.lkParch, for: .widget)
  }

  // ── Medium ─────────────────────────────────────────────────
  var mediumView: some View {
    HStack(spacing: 0) {

      // LEFT: day counter
      VStack(alignment: .leading, spacing: 0) {
        HStack {
          Text(entry.nickname.uppercased())
            .font(.system(size: 10, weight: .heavy))
            .tracking(1.8)
            .foregroundColor(Color.lkInk.opacity(0.40))
            .lineLimit(1)
          Spacer()
          Image(systemName: "heart.fill")
            .font(.system(size: 9))
            .foregroundColor(Color.lkCoral.opacity(0.70))
        }

        Spacer(minLength: 4)

        Text("\(entry.dayCount)")
          .font(.system(size: 52, weight: .heavy, design: .rounded))
          .foregroundColor(Color.lkInk)
          .minimumScaleFactor(0.5)
          .lineLimit(1)

        Text("days together")
          .font(.system(size: 13, weight: .semibold, design: .serif))
          .italic()
          .foregroundColor(Color.lkSepia)
          .lineLimit(1)
          .minimumScaleFactor(0.8)
          .padding(.top, 1)

        Spacer(minLength: 4)
      }
      .frame(maxWidth: .infinity, alignment: .leading)

      // Hairline divider
      Rectangle()
        .fill(Color.lkHair)
        .frame(width: 1)
        .padding(.vertical, 6)
        .padding(.horizontal, 14)

      // RIGHT: partner presence + nudge
      VStack(alignment: .center, spacing: 6) {
        Text(entry.partnerEmoji)
          .font(.system(size: 28))

        Text(partnerFirst)
          .font(.system(size: 11, weight: .semibold))
          .foregroundColor(Color.lkSepia)
          .lineLimit(1)

        Spacer(minLength: 4)

        NudgeButton(sent: entry.justNudged)
      }
      .frame(width: 96)
    }
    .padding(.horizontal, 16)
    .padding(.vertical, 14)
    .background(cardShape.fill(Color.lkCream).overlay(cardShape.stroke(Color.lkBorder, lineWidth: 1.5)))
    .padding(8)
    .widgetURL(URL(string: "locket://home"))
    .containerBackground(Color.lkParch, for: .widget)
  }

  // ── Lock-screen accessories (iOS 16+) ───────────────────────
  var accessoryInlineView: some View {
    Text("💛 \(entry.dayCount) days together")
      .widgetURL(URL(string: "locket://home"))
  }

  var accessoryCircularView: some View {
    ZStack {
      AccessoryWidgetBackground()
      VStack(spacing: -2) {
        Text("\(entry.dayCount)")
          .font(.system(size: 22, weight: .heavy, design: .rounded))
          .minimumScaleFactor(0.5)
          .lineLimit(1)
        Text("days")
          .font(.system(size: 9, weight: .semibold))
      }
    }
    .widgetURL(URL(string: "locket://home"))
    .containerBackground(for: .widget) { Color.clear }
  }

  var accessoryRectangularView: some View {
    VStack(alignment: .leading, spacing: 2) {
      Text(entry.nickname.uppercased())
        .font(.system(size: 11, weight: .semibold))
        .tracking(1)
        .lineLimit(1)
      HStack(alignment: .firstTextBaseline, spacing: 4) {
        Text("\(entry.dayCount)")
          .font(.system(size: 24, weight: .heavy, design: .rounded))
        Text("days together")
          .font(.system(size: 12, weight: .medium))
          .lineLimit(1)
          .minimumScaleFactor(0.8)
      }
      Text("\(entry.partnerEmoji) \(partnerFirst)")
        .font(.system(size: 11))
        .lineLimit(1)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .widgetURL(URL(string: "locket://home"))
    .containerBackground(for: .widget) { Color.clear }
  }
}

struct LocketWidget: Widget {
  let kind: String = "LocketWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: Provider()) { entry in
      LocketWidgetView(entry: entry)
    }
    .configurationDisplayName("Locket")
    .description("Your day counter and a one-tap nudge for your partner.")
    .supportedFamilies([.systemSmall, .systemMedium,
                        .accessoryRectangular, .accessoryCircular, .accessoryInline])
    .contentMarginsDisabled()
  }
}

// ─────────────────────────────────────────────────────────────
// MARK: - Partner Draw Widget
// ─────────────────────────────────────────────────────────────

struct DrawWidgetEntry: TimelineEntry {
  let date: Date
  /// Local path inside the shared container (pre-downloaded — AsyncImage is
  /// unreliable in WidgetKit). Nil means nothing to render yet.
  let imagePath: String?
  /// True when a drawing URL exists even if the image isn't cached yet.
  let hasDrawing: Bool
  let partnerName: String
}

/// Pre-downloads the latest drawing into the shared container and returns its
/// local path. Re-downloads only when the URL changed; falls back to any cached
/// file on failure so the widget degrades gracefully offline.
private func buildDrawEntry() async -> DrawWidgetEntry {
  let d = UserDefaults(suiteName: APP_GROUP)
  let name = d?.string(forKey: "drawPartnerName") ?? "Partner"
  let urlStr = d?.string(forKey: "drawImageUrl")

  guard
    let urlStr, !urlStr.isEmpty, let url = URL(string: urlStr),
    let container = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: APP_GROUP)
  else {
    return DrawWidgetEntry(date: Date(), imagePath: nil, hasDrawing: false, partnerName: name)
  }

  let dest = container.appendingPathComponent("partner_drawing.png")
  let alreadyCached = d?.string(forKey: "drawCachedUrl") == urlStr
                      && FileManager.default.fileExists(atPath: dest.path)
  if alreadyCached {
    return DrawWidgetEntry(date: Date(), imagePath: dest.path, hasDrawing: true, partnerName: name)
  }

  var req = URLRequest(url: url)
  req.timeoutInterval = 12
  if let (data, resp) = try? await URLSession.shared.data(for: req),
     (resp as? HTTPURLResponse).map({ (200..<300).contains($0.statusCode) }) ?? true,
     !data.isEmpty,
     (try? data.write(to: dest, options: .atomic)) != nil {
    d?.set(urlStr, forKey: "drawCachedUrl")
    return DrawWidgetEntry(date: Date(), imagePath: dest.path, hasDrawing: true, partnerName: name)
  }

  // Download failed — show the last cached drawing if we have one.
  let fallback = FileManager.default.fileExists(atPath: dest.path) ? dest.path : nil
  return DrawWidgetEntry(date: Date(), imagePath: fallback, hasDrawing: true, partnerName: name)
}

struct DrawProvider: TimelineProvider {
  func placeholder(in context: Context) -> DrawWidgetEntry {
    DrawWidgetEntry(date: Date(), imagePath: nil, hasDrawing: false, partnerName: "Partner")
  }
  func getSnapshot(in context: Context, completion: @escaping (DrawWidgetEntry) -> Void) {
    let d = UserDefaults(suiteName: APP_GROUP)
    let name = d?.string(forKey: "drawPartnerName") ?? "Partner"
    var path: String? = nil
    if let container = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: APP_GROUP) {
      let dest = container.appendingPathComponent("partner_drawing.png")
      if FileManager.default.fileExists(atPath: dest.path) { path = dest.path }
    }
    completion(DrawWidgetEntry(date: Date(), imagePath: path,
                               hasDrawing: d?.string(forKey: "drawImageUrl") != nil, partnerName: name))
  }
  func getTimeline(in context: Context, completion: @escaping (Timeline<DrawWidgetEntry>) -> Void) {
    Task {
      let entry = await buildDrawEntry()
      let next = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date().addingTimeInterval(1800)
      completion(Timeline(entries: [entry], policy: .after(next)))
    }
  }
}

struct LocketDrawWidgetView: View {
  var entry: DrawWidgetEntry
  @Environment(\.widgetFamily) var family

  var partnerFirst: String {
    let first = entry.partnerName.components(separatedBy: " ").first ?? entry.partnerName
    return String(first.prefix(10))
  }

  private var frameShape: RoundedRectangle { RoundedRectangle(cornerRadius: 16, style: .continuous) }

  @ViewBuilder
  var canvasContent: some View {
    if let path = entry.imagePath, let ui = UIImage(contentsOfFile: path) {
      Image(uiImage: ui).resizable().scaledToFit()
    } else {
      emptyCanvas
    }
  }

  var emptyCanvas: some View {
    VStack(spacing: 6) {
      Image(systemName: "pencil.and.outline")
        .font(.system(size: 22))
        .foregroundColor(Color.lkFaded.opacity(0.6))
      Text("waiting for\na drawing…")
        .font(.system(size: 10, weight: .medium, design: .serif))
        .italic()
        .multilineTextAlignment(.center)
        .foregroundColor(Color.lkFaded.opacity(0.6))
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }

  var body: some View {
    switch family {
    case .systemSmall: smallView
    default:           mediumView
    }
  }

  // Vellum picture-frame on a parchment margin — the Love Card treatment.
  var smallView: some View {
    ZStack(alignment: .bottomLeading) {
      canvasContent.frame(maxWidth: .infinity, maxHeight: .infinity)
      if entry.imagePath != nil {
        Text(partnerFirst)
          .font(.system(size: 11, weight: .bold))
          .foregroundColor(Color.lkInk)
          .padding(.horizontal, 8)
          .padding(.vertical, 4)
          .background(Color.lkParch.opacity(0.88))
          .clipShape(Capsule())
          .padding(6)
      }
    }
    .padding(8)
    .background(frameShape.fill(Color.lkVellum).overlay(frameShape.stroke(Color.lkInk.opacity(0.55), lineWidth: 1.5)))
    .padding(8)
    .widgetURL(URL(string: "locket://draw"))
    .containerBackground(Color.lkParch, for: .widget)
  }

  var mediumView: some View {
    HStack(spacing: 0) {
      canvasContent.frame(maxWidth: .infinity, maxHeight: .infinity).clipped()

      Rectangle()
        .fill(Color.lkHair)
        .frame(width: 1)
        .padding(.vertical, 8)
        .padding(.horizontal, 14)

      VStack(alignment: .leading, spacing: 4) {
        Text(partnerFirst)
          .font(.system(size: 14, weight: .bold))
          .foregroundColor(Color.lkInk)
          .lineLimit(1)
        Text("just for you")
          .font(.system(size: 12, weight: .medium, design: .serif))
          .italic()
          .foregroundColor(Color.lkSepia)
        Spacer()
        if entry.imagePath != nil {
          Text("see it →")
            .font(.system(size: 11, weight: .semibold))
            .foregroundColor(Color.lkCoral)
        }
      }
      .frame(width: 90)
    }
    .padding(10)
    .background(frameShape.fill(Color.lkVellum).overlay(frameShape.stroke(Color.lkInk.opacity(0.55), lineWidth: 1.5)))
    .padding(8)
    .widgetURL(URL(string: "locket://draw"))
    .containerBackground(Color.lkParch, for: .widget)
  }
}

struct LocketDrawWidget: Widget {
  let kind: String = "PartnerDrawWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: DrawProvider()) { entry in
      LocketDrawWidgetView(entry: entry)
    }
    .configurationDisplayName("Partner Draw")
    .description("See the latest drawing from your partner.")
    .supportedFamilies([.systemSmall, .systemMedium])
    .contentMarginsDisabled()
  }
}

// ─────────────────────────────────────────────────────────────
// MARK: - Bundle
// ─────────────────────────────────────────────────────────────

@main
struct LocketWidgetBundle: WidgetBundle {
  var body: some Widget {
    LocketWidget()
    LocketDrawWidget()
  }
}
