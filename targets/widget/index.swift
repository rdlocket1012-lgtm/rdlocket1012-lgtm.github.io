import WidgetKit
import SwiftUI
import AppIntents

let APP_GROUP = "group.com.siren96.locket"

// Brand palette as explicit RGB so the widget never depends on a generated
// asset catalog (named Color.lkCream was resolving to black in the extension).
extension Color {
  static let lkCream = Color(red: 251/255, green: 243/255, blue: 224/255)
  static let lkInk   = Color(red: 42/255,  green: 33/255,  blue: 26/255)
  static let lkGold  = Color(red: 255/255, green: 201/255, blue: 77/255)
  static let lkPink  = Color(red: 244/255, green: 143/255, blue: 177/255)
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
  let dayCount = Int(d?.string(forKey: "dayCount") ?? "0") ?? 0
  let nickname = d?.string(forKey: "coupleNickname") ?? "Us"
  let emoji = d?.string(forKey: "partnerStatusEmoji") ?? "💛"
  let partner = d?.string(forKey: "partnerName") ?? "Partner"
  return LocketEntry(date: Date(), dayCount: dayCount, nickname: nickname, partnerEmoji: emoji, partnerName: partner)
}

// MARK: - Timeline provider

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> LocketEntry {
    LocketEntry(date: Date(), dayCount: 0, nickname: "Us", partnerEmoji: "💛", partnerName: "Partner")
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

// MARK: - Nudge App Intent (fires without launching the app, iOS 17+)

struct SendNudgeIntent: AppIntent {
  static var title: LocalizedStringResource = "Send a Micro-Love nudge"
  static var description = IntentDescription("Sends a quick love nudge to your partner.")

  func perform() async throws -> some IntentResult {
    await NudgeSender.send()
    return .result()
  }
}

enum NudgeSender {
  /// Reads the shared Supabase credentials from the App Group and POSTs to the
  /// `notify` Edge Function so the partner gets a push — all without launching.
  static func send() async {
    let d = UserDefaults(suiteName: APP_GROUP)
    guard
      let base = d?.string(forKey: "supabaseUrl"),
      let anon = d?.string(forKey: "anonKey"),
      let token = d?.string(forKey: "accessToken"),
      let url = URL(string: "\(base)/functions/v1/notify")
    else { return }

    var req = URLRequest(url: url)
    req.httpMethod = "POST"
    req.setValue("application/json", forHTTPHeaderField: "Content-Type")
    req.setValue(anon, forHTTPHeaderField: "apikey")
    req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

    let body: [String: Any] = [
      "type": "nudge_hug",
      "title": "💛 Thinking of you",
      "body": "A little love tapped from the home screen.",
    ]
    req.httpBody = try? JSONSerialization.data(withJSONObject: body)

    // Mark a local timestamp so the app can show a confirmation later.
    d?.set(ISO8601DateFormatter().string(from: Date()), forKey: "lastWidgetNudgeAt")

    _ = try? await URLSession.shared.data(for: req)
  }
}

// MARK: - Views

struct LocketWidgetView: View {
  var entry: Provider.Entry
  @Environment(\.widgetFamily) var family

  var body: some View {
    switch family {
    case .systemSmall: smallView
    default: mediumView
    }
  }

  var smallView: some View {
    VStack(alignment: .leading, spacing: 2) {
      Text("DAY")
        .font(.system(size: 11, weight: .heavy))
        .tracking(2)
        .foregroundColor(Color.lkInk.opacity(0.5))
      Text("\(entry.dayCount)")
        .font(.system(size: 44, weight: .heavy, design: .rounded))
        .foregroundColor(Color.lkInk)
        .minimumScaleFactor(0.5)
        .lineLimit(1)
      Text("together")
        .font(.system(size: 15, weight: .medium, design: .serif))
        .italic()
        .foregroundColor(Color.lkGold)
      Spacer()
      HStack {
        Spacer()
        Text(entry.partnerEmoji).font(.system(size: 26))
      }
    }
    .padding(14)
    .containerBackground(Color.lkCream, for: .widget)
  }

  var mediumView: some View {
    HStack(spacing: 16) {
      VStack(alignment: .leading, spacing: 2) {
        Text(entry.nickname.uppercased())
          .font(.system(size: 10, weight: .heavy))
          .tracking(1.5)
          .foregroundColor(Color.lkInk.opacity(0.5))
          .lineLimit(1)
        Text("\(entry.dayCount)")
          .font(.system(size: 46, weight: .heavy, design: .rounded))
          .foregroundColor(Color.lkInk)
          .minimumScaleFactor(0.5)
          .lineLimit(1)
        Text("days together")
          .font(.system(size: 15, weight: .medium, design: .serif))
          .italic()
          .foregroundColor(Color.lkGold)
      }
      Spacer()
      VStack(spacing: 10) {
        Text(entry.partnerEmoji).font(.system(size: 34))
        // iOS 17+ interactive button — fires the nudge intent directly.
        Button(intent: SendNudgeIntent()) {
          HStack(spacing: 5) {
            Text("💋").font(.system(size: 14))
            Text("Nudge").font(.system(size: 13, weight: .bold))
          }
          .padding(.horizontal, 14)
          .padding(.vertical, 9)
          .background(Color.lkPink)
          .foregroundColor(Color.lkInk)
          .clipShape(Capsule())
        }
        .buttonStyle(.plain)
      }
    }
    .padding(16)
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
    .description("Your day counter and a tap-to-nudge button.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}

@main
struct LocketWidgetBundle: WidgetBundle {
  var body: some Widget {
    LocketWidget()
  }
}
