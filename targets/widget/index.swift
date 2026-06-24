import WidgetKit
import SwiftUI
import AppIntents

let APP_GROUP = "group.com.siren96.locket"

// Brand palette — explicit RGB so the widget never depends on an asset catalog.
extension Color {
  static let lkParch  = Color(red: 243/255, green: 233/255, blue: 210/255)  // Parchment #F3E9D2
  static let lkCream  = Color(red: 251/255, green: 245/255, blue: 232/255)  // Ivory #FBF5E8
  static let lkInk    = Color(red: 42/255,  green: 33/255,  blue: 26/255)   // Espresso
  static let lkCoral  = Color(red: 255/255, green: 122/255, blue: 107/255)  // Coral #FF7A6B
  static let lkGold   = Color(red: 255/255, green: 201/255, blue: 77/255)   // Marigold
  static let lkBlush  = Color(red: 255/255, green: 158/255, blue: 196/255)  // Blush
  static let lkSepia  = Color(red: 110/255, green: 98/255,  blue: 83/255)   // Sepia
  static let lkFaded  = Color(red: 154/255, green: 138/255, blue: 99/255)   // Faded #9A8A63
  static let lkHair   = Color(red: 42/255,  green: 33/255,  blue: 26/255).opacity(0.10)
}

// ─────────────────────────────────────────────────────────────
// MARK: - Auth helpers
// ─────────────────────────────────────────────────────────────

/// Refreshes the Supabase access token using the stored refresh token.
/// Persists the new token pair back to UserDefaults on success.
/// Returns a fresh access token, or nil if the refresh failed.
private func refreshAccessToken(
  base: String,
  anon: String,
  refreshToken: String,
  defaults: UserDefaults?
) async -> String? {
  guard let url = URL(string: "\(base)/auth/v1/token?grant_type=refresh_token") else { return nil }
  var req = URLRequest(url: url)
  req.httpMethod = "POST"
  req.setValue("application/json", forHTTPHeaderField: "Content-Type")
  req.setValue(anon, forHTTPHeaderField: "apikey")
  req.httpBody = try? JSONSerialization.data(withJSONObject: ["refresh_token": refreshToken])
  guard
    let (data, _) = try? await URLSession.shared.data(for: req),
    let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
    let access = json["access_token"] as? String
  else { return nil }
  // Persist updated tokens so the next intent call is also fresh.
  defaults?.set(access, forKey: "accessToken")
  if let newRefresh = json["refresh_token"] as? String {
    defaults?.set(newRefresh, forKey: "refreshToken")
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

func readEntry() -> LocketEntry {
  let d = UserDefaults(suiteName: APP_GROUP)
  let dayCount = Int(d?.string(forKey: "dayCount") ?? "0") ?? 0
  let nickname = d?.string(forKey: "coupleNickname") ?? "Us"
  let emoji    = d?.string(forKey: "partnerStatusEmoji") ?? "💛"
  let partner  = d?.string(forKey: "partnerName") ?? "Partner"

  // Show the "sent" state for 4s after the nudge intent stamped lastWidgetNudgeAt.
  var justNudged = false
  if let iso = d?.string(forKey: "lastWidgetNudgeAt"),
     let when = ISO8601DateFormatter().date(from: iso) {
    justNudged = Date().timeIntervalSince(when) < 4
  }
  return LocketEntry(date: Date(), dayCount: dayCount, nickname: nickname,
                     partnerEmoji: emoji, partnerName: partner, justNudged: justNudged)
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
    // clears back to the Nudge button; otherwise the usual 30-minute cadence.
    let next = entry.justNudged
      ? Date().addingTimeInterval(4)
      : (Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date().addingTimeInterval(1800))
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
    guard
      let base  = d?.string(forKey: "supabaseUrl"),
      let anon  = d?.string(forKey: "anonKey")
    else { return }

    // Always try to refresh — access tokens expire after ~1 hour.
    // Fall back to the stored access token if refresh fails (e.g. offline).
    let freshToken: String?
    if let refresh = d?.string(forKey: "refreshToken") {
      freshToken = await refreshAccessToken(base: base, anon: anon, refreshToken: refresh, defaults: d)
    } else {
      freshToken = nil
    }
    let token = freshToken ?? d?.string(forKey: "accessToken") ?? ""
    guard !token.isEmpty, let url = URL(string: "\(base)/functions/v1/notify") else { return }

    var req = URLRequest(url: url)
    req.httpMethod = "POST"
    req.setValue("application/json",    forHTTPHeaderField: "Content-Type")
    req.setValue(anon,                  forHTTPHeaderField: "apikey")
    req.setValue("Bearer \(token)",     forHTTPHeaderField: "Authorization")
    req.httpBody = try? JSONSerialization.data(withJSONObject: [
      "type":  "nudge_hug",
      "title": "💛 Thinking of you",
      "body":  "A little love from the home screen.",
    ])
    d?.set(ISO8601DateFormatter().string(from: Date()), forKey: "lastWidgetNudgeAt")
    _ = try? await URLSession.shared.data(for: req)
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
      } else if #available(iOS 17, *) {
        Button(intent: SendNudgeIntent()) { chip }
          .buttonStyle(.plain)
      } else {
        if let url = URL(string: "locket://nudge") {
          Link(destination: url) { chip }
        }
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
    case .systemSmall: smallView
    default:           mediumView
    }
  }

  // ── Small ──────────────────────────────────────────────────
  var smallView: some View {
    VStack(alignment: .leading, spacing: 0) {

      // Top row: nickname + heart accent
      HStack(alignment: .center) {
        Text(entry.nickname.uppercased())
          .font(.system(size: 9, weight: .heavy))
          .tracking(1.8)
          .foregroundColor(Color.lkInk.opacity(0.35))
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

      // "days together" warm line
      Text("days together")
        .font(.system(size: 12, weight: .medium, design: .serif))
        .italic()
        .foregroundColor(Color.lkGold)
        .lineLimit(1)
        .minimumScaleFactor(0.8)
        .padding(.top, 1)

      Spacer(minLength: 6)

      NudgeButton(sent: entry.justNudged)
    }
    .padding(14)
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
            .foregroundColor(Color.lkInk.opacity(0.35))
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
          .font(.system(size: 13, weight: .medium, design: .serif))
          .italic()
          .foregroundColor(Color.lkGold)
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
    .containerBackground(Color.lkParch, for: .widget)
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
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}

// ─────────────────────────────────────────────────────────────
// MARK: - Partner Draw Widget
// ─────────────────────────────────────────────────────────────

struct DrawWidgetEntry: TimelineEntry {
  let date: Date
  let imageUrl: String?
  let partnerName: String
}

func readDrawEntry() -> DrawWidgetEntry {
  let d = UserDefaults(suiteName: APP_GROUP)
  return DrawWidgetEntry(
    date: Date(),
    imageUrl: d?.string(forKey: "drawImageUrl"),
    partnerName: d?.string(forKey: "drawPartnerName") ?? "Partner"
  )
}

struct DrawProvider: TimelineProvider {
  func placeholder(in context: Context) -> DrawWidgetEntry {
    DrawWidgetEntry(date: Date(), imageUrl: nil, partnerName: "Partner")
  }
  func getSnapshot(in context: Context, completion: @escaping (DrawWidgetEntry) -> Void) {
    completion(readDrawEntry())
  }
  func getTimeline(in context: Context, completion: @escaping (Timeline<DrawWidgetEntry>) -> Void) {
    let entry = readDrawEntry()
    let next = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date().addingTimeInterval(1800)
    completion(Timeline(entries: [entry], policy: .after(next)))
  }
}

struct LocketDrawWidgetView: View {
  var entry: DrawWidgetEntry
  @Environment(\.widgetFamily) var family

  var partnerFirst: String {
    let first = entry.partnerName.components(separatedBy: " ").first ?? entry.partnerName
    return String(first.prefix(10))
  }

  @ViewBuilder
  var canvasContent: some View {
    if let urlStr = entry.imageUrl, let url = URL(string: urlStr) {
      AsyncImage(url: url) { phase in
        switch phase {
        case .success(let image): image.resizable().scaledToFit()
        case .failure:            emptyCanvas
        default:                  Color.lkParch.opacity(0.5)
        }
      }
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

  var smallView: some View {
    ZStack(alignment: .bottomLeading) {
      canvasContent.frame(maxWidth: .infinity, maxHeight: .infinity)
      if entry.imageUrl != nil {
        Text(partnerFirst)
          .font(.system(size: 11, weight: .bold))
          .foregroundColor(Color.lkInk)
          .padding(.horizontal, 8)
          .padding(.vertical, 4)
          .background(Color.lkParch.opacity(0.88))
          .clipShape(Capsule())
          .padding(8)
      }
    }
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
        if entry.imageUrl != nil, let url = URL(string: "locket://draw") {
          Link(destination: url) {
            Text("see it →")
              .font(.system(size: 11, weight: .semibold))
              .foregroundColor(Color.lkCoral)
          }
        }
      }
      .frame(width: 90)
    }
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
