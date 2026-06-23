import WidgetKit
import SwiftUI
import AppIntents

let APP_GROUP = "group.com.siren96.locket"

// Brand palette — explicit RGB so the widget never depends on an asset catalog.
extension Color {
  static let lkCream  = Color(red: 251/255, green: 245/255, blue: 232/255)  // Ivory #FBF5E8
  static let lkParch  = Color(red: 243/255, green: 233/255, blue: 210/255)  // Parchment #F3E9D2
  static let lkInk    = Color(red: 42/255,  green: 33/255,  blue: 26/255)   // Espresso
  static let lkCoral  = Color(red: 255/255, green: 122/255, blue: 107/255)  // Coral #FF7A6B
  static let lkGold   = Color(red: 255/255, green: 201/255, blue: 77/255)   // Marigold
  static let lkBlush  = Color(red: 255/255, green: 158/255, blue: 196/255)  // Blush/nudge
  static let lkSepia  = Color(red: 110/255, green: 98/255,  blue: 83/255)   // Secondary text
  static let lkHair   = Color(red: 42/255,  green: 33/255,  blue: 26/255).opacity(0.10)
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

    d?.set(ISO8601DateFormatter().string(from: Date()), forKey: "lastWidgetNudgeAt")
    _ = try? await URLSession.shared.data(for: req)
  }
}

struct NudgeButton: View {
  var body: some View {
    Group {
      if #available(iOS 17, *) {
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
    .padding(.vertical, 8)
    .background(Color.lkBlush)
    .clipShape(Capsule())
  }
}

struct LocketWidgetView: View {
  var entry: Provider.Entry
  @Environment(\.widgetFamily) var family

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

        NudgeButton()
      }

      Text(entry.partnerEmoji)
        .font(.system(size: 22))
    }
    .padding(14)
    .containerBackground(Color.lkCream, for: .widget)
  }

  var mediumView: some View {
    HStack(spacing: 0) {
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

      Rectangle()
        .fill(Color.lkHair)
        .frame(width: 1)
        .padding(.vertical, 6)
        .padding(.horizontal, 14)

      VStack(spacing: 6) {
        Text(entry.partnerEmoji)
          .font(.system(size: 30))

        Text(partnerFirst)
          .font(.system(size: 10, weight: .semibold))
          .foregroundColor(Color.lkSepia)
          .lineLimit(1)

        Spacer(minLength: 6)

        NudgeButton()
      }
      .frame(width: 96)
    }
    .padding(.horizontal, 16)
    .padding(.vertical, 14)
    .containerBackground(Color.lkCream, for: .widget)
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
    // Refresh every 30 min; push reloads the widget sooner via reloadTimelines
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

  // Drawing or placeholder
  @ViewBuilder
  var canvasContent: some View {
    if let urlStr = entry.imageUrl, let url = URL(string: urlStr) {
      AsyncImage(url: url) { phase in
        switch phase {
        case .success(let image):
          image.resizable().scaledToFit()
        case .failure:
          emptyCanvas
        default:
          // Loading shimmer
          Color.lkParch.opacity(0.5)
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
        .foregroundColor(Color.lkSepia.opacity(0.45))
      Text("waiting for\na drawing…")
        .font(.system(size: 10, weight: .medium, design: .serif))
        .italic()
        .multilineTextAlignment(.center)
        .foregroundColor(Color.lkSepia.opacity(0.45))
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }

  var body: some View {
    switch family {
    case .systemSmall: smallView
    default:           mediumView
    }
  }

  // Small: drawing fills frame, partner name pill at bottom-leading
  var smallView: some View {
    ZStack(alignment: .bottomLeading) {
      canvasContent
        .frame(maxWidth: .infinity, maxHeight: .infinity)

      if entry.imageUrl != nil {
        Text(partnerFirst)
          .font(.system(size: 11, weight: .bold))
          .foregroundColor(Color.lkInk)
          .padding(.horizontal, 8)
          .padding(.vertical, 4)
          .background(Color.lkCream.opacity(0.88))
          .clipShape(Capsule())
          .padding(8)
      }
    }
    .containerBackground(Color.lkParch, for: .widget)
  }

  // Medium: drawing left 2/3 · partner name + tagline + "see it →" right 1/3
  var mediumView: some View {
    HStack(spacing: 0) {
      // Left: drawing
      canvasContent
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .clipped()

      // Hairline divider
      Rectangle()
        .fill(Color.lkHair)
        .frame(width: 1)
        .padding(.vertical, 8)
        .padding(.horizontal, 14)

      // Right: info
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
