import WidgetKit
import SwiftUI
import AppIntents

let APP_GROUP = "group.com.siren96.locket"

// Brand palette — explicit RGB so the widget never depends on an asset catalog.
extension Color {
  static let lkCream  = Color(red: 251/255, green: 245/255, blue: 232/255)  // Ivory #FBF5E8
  static let lkInk    = Color(red: 42/255,  green: 33/255,  blue: 26/255)   // Espresso
  static let lkGold   = Color(red: 255/255, green: 201/255, blue: 77/255)   // Marigold
  static let lkBlush  = Color(red: 255/255, green: 158/255, blue: 196/255)  // Blush/nudge
  static let lkSepia  = Color(red: 110/255, green: 98/255,  blue: 83/255)   // Secondary text
  static let lkHair   = Color(red: 42/255,  green: 33/255,  blue: 26/255).opacity(0.10)
}

// MARK: - Shared data model

struct LocketEntry: TimelineEntry {
  let date: Date
  let dayCount: Int
  let nickname: String
  let partnerEmoji: String
  let partnerName: String
}

func readEntry() -> LocketEntry {
  let d = UserDefaults(suiteName: APP_GROUP)
  let dayCount    = Int(d?.string(forKey: "dayCount") ?? "0") ?? 0
  let nickname    = d?.string(forKey: "coupleNickname") ?? "Us"
  let emoji       = d?.string(forKey: "partnerStatusEmoji") ?? "💛"
  let partner     = d?.string(forKey: "partnerName") ?? "Partner"
  return LocketEntry(date: Date(), dayCount: dayCount, nickname: nickname,
                     partnerEmoji: emoji, partnerName: partner)
}

// MARK: - Timeline provider

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> LocketEntry {
    LocketEntry(date: Date(), dayCount: 47, nickname: "Us", partnerEmoji: "💛", partnerName: "Partner")
  }
  func getSnapshot(in context: Context, completion: @escaping (LocketEntry) -> Void) {
    completion(readEntry())
  }
  func getTimeline(in context: Context, completion: @escaping (Timeline<LocketEntry>) -> Void) {
    let entry = readEntry()
    let next = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date().addingTimeInterval(1800)
    completion(Timeline(entries: [entry], policy: .after(next)))
  }
}

// MARK: - Nudge App Intent (iOS 17+ — fires without launching the app)

struct SendNudgeIntent: AppIntent {
  static var title: LocalizedStringResource = "Send a love nudge"
  static var description = IntentDescription("Sends a quick love nudge to your partner without opening the app.")

  func perform() async throws -> some IntentResult {
    await NudgeSender.send()
    return .result()
  }
}

enum NudgeSender {
  /// Reads the auth credentials from the App Group and POSTs to the `notify`
  /// Edge Function so the partner gets a push — without launching the app.
  static func send() async {
    let d = UserDefaults(suiteName: APP_GROUP)
    guard
      let base  = d?.string(forKey: "supabaseUrl"),
      let anon  = d?.string(forKey: "anonKey"),
      let token = d?.string(forKey: "accessToken"),
      let url   = URL(string: "\(base)/functions/v1/notify")
    else { return }

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

    // Record the timestamp so the in-app UI can show a confirmation toast.
    d?.set(ISO8601DateFormatter().string(from: Date()), forKey: "lastWidgetNudgeAt")
    _ = try? await URLSession.shared.data(for: req)
  }
}

// MARK: - Reusable nudge button

/// The tappable nudge chip shared by small and medium views.
/// iOS 17+: fires the intent in the background (no app launch).
/// iOS 16:  opens the app at locket://nudge which the JS layer catches and
///          immediately pops open the nudge composer without any extra taps.
struct NudgeButton: View {
  var body: some View {
    Group {
      if #available(iOS 17, *) {
        Button(intent: SendNudgeIntent()) { chip }
          .buttonStyle(.plain)
      } else {
        // locket:// is the registered URL scheme in app.json.
        // The root layout catches this URL and calls nudgeLaunch.request()
        // so the nudge menu opens immediately.
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
    .padding(.vertical, 8)
    .background(Color.lkBlush)
    .clipShape(Capsule())
  }
}

// MARK: - Widget views

struct LocketWidgetView: View {
  var entry: Provider.Entry
  @Environment(\.widgetFamily) var family

  /// First name only, max 10 chars so it fits on narrow right columns.
  var partnerFirst: String {
    let first = entry.partnerName.components(separatedBy: " ").first ?? entry.partnerName
    return String(first.prefix(10))
  }

  var body: some View {
    switch family {
    case .systemSmall: smallView
    default:           mediumView
    }
  }

  // ── Small widget ────────────────────────────────────────────────────────────
  // Clean counter with status emoji in the top-right corner.
  var smallView: some View {
    ZStack(alignment: .topTrailing) {
      VStack(alignment: .leading, spacing: 0) {
        Text(entry.nickname.uppercased())
          .font(.system(size: 9, weight: .heavy))
          .tracking(1.5)
          .foregroundColor(Color.lkInk.opacity(0.40))
          .lineLimit(1)
          .padding(.bottom, 2)

        Spacer()

        Text("\(entry.dayCount)")
          .font(.system(size: 48, weight: .heavy, design: .rounded))
          .foregroundColor(Color.lkInk)
          .minimumScaleFactor(0.5)
          .lineLimit(1)

        Text("days together")
          .font(.system(size: 13, weight: .medium, design: .serif))
          .italic()
          .foregroundColor(Color.lkGold)
          .lineLimit(1)
          .minimumScaleFactor(0.8)

        Spacer()

        // Bottom nudge button so both sizes let you nudge from the widget
        NudgeButton()
      }

      // Status emoji floating top-right
      Text(entry.partnerEmoji)
        .font(.system(size: 22))
    }
    .padding(14)
    .containerBackground(Color.lkCream, for: .widget)
  }

  // ── Medium widget ───────────────────────────────────────────────────────────
  // Left: counter hero.  Hairline divider.  Right: partner presence + nudge.
  var mediumView: some View {
    HStack(spacing: 0) {

      // ── LEFT: day counter ─────────────────────────────────
      VStack(alignment: .leading, spacing: 0) {
        Text(entry.nickname.uppercased())
          .font(.system(size: 10, weight: .heavy))
          .tracking(1.5)
          .foregroundColor(Color.lkInk.opacity(0.40))
          .lineLimit(1)

        Spacer(minLength: 4)

        Text("\(entry.dayCount)")
          .font(.system(size: 54, weight: .heavy, design: .rounded))
          .foregroundColor(Color.lkInk)
          .minimumScaleFactor(0.5)
          .lineLimit(1)

        Text("days together")
          .font(.system(size: 14, weight: .medium, design: .serif))
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

      // ── RIGHT: partner presence + nudge ──────────────────
      VStack(spacing: 6) {
        // Partner emoji — represents their presence / status
        Text(entry.partnerEmoji)
          .font(.system(size: 30))

        // Partner first name
        Text(partnerFirst)
          .font(.system(size: 10, weight: .semibold))
          .foregroundColor(Color.lkSepia)
          .lineLimit(1)

        Spacer(minLength: 6)

        // Nudge button (interactive on iOS 17+, deep-links on iOS 16)
        NudgeButton()
      }
      .frame(width: 96)
    }
    .padding(.horizontal, 16)
    .padding(.vertical, 14)
    .containerBackground(Color.lkCream, for: .widget)
  }
}

// MARK: - Widget definition

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

@main
struct LocketWidgetBundle: WidgetBundle {
  var body: some Widget {
    LocketWidget()
  }
}
