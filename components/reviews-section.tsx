"use client"

const reviews = [
  {
    name: "Laura M.",
    date: "Vor 2 Monaten",
    text: "Der Hundewagen ist perfekt für meine ältere Hündin! Sie kann keine langen Strecken mehr laufen und kann jetzt überall mit uns hin. Die Qualität ist ausgezeichnet und der Preis sehr gut. 🐾",
    stars: 5,
  },
  {
    name: "Carlos R.",
    date: "Vor 1 Monat",
    text: "Ich habe genau das gefunden, was ich für meinen Golden Retriever gesucht habe. Der Wagen ist sehr robust und lässt sich leicht falten. Der Service war schnell und alles gut verpackt.",
    stars: 5,
  },
  {
    name: "Sophie K.",
    date: "Vor 3 Monaten",
    text: "Wir haben den Wagen auf unserer Europareise mitgenommen und er war ein voller Erfolg. Mein Hund reiste bequem und sicher. Sehr gute Produktauswahl, ich würde es jederzeit wieder kaufen.",
    stars: 5,
  },
  {
    name: "Miguel A.",
    date: "Vor 2 Wochen",
    text: "Nach langer Suche habe ich diesen Shop gefunden. Sie haben die besten Wagen für grosse Hunde, die ich je gesehen habe. Mein 35 kg schwerer Schäferhund passt perfekt hinein. Sehr empfehlenswert.",
    stars: 5,
  },
  {
    name: "Anna B.",
    date: "Vor 4 Monaten",
    text: "Wir haben den Geländewagen für Spaziergänge auf dem Land gekauft. Die 4 Räder funktionieren hervorragend auf Schotterwegen. Mein Hund liebt ihn. Danke für die Empfehlung!",
    stars: 5,
  },
  {
    name: "Thomas W.",
    date: "Vor 1 Woche",
    text: "Hervorragende Auswahl an Hundeprodukten. Ich habe das perfekte Zubehör für meinen kleinen Begleiter gefunden. Die Lieferung war sehr schnell und das Produkt von grosser Qualität. 👍",
    stars: 5,
  },
  {
    name: "Isabel F.",
    date: "Vor 5 Monaten",
    text: "Meine Hündin hat Mobilitätsprobleme und dieser Wagen hat ihr Leben verändert. Sie kommt jetzt zum Markt, in den Park und sogar in den Urlaub. Ich bin diesem Shop sehr dankbar.",
    stars: 5,
  },
]

const avatarGradients = [
  "from-[#4F7CFF] to-[#818cf8]",
  "from-[#FF6B9D] to-[#f9a8d4]",
  "from-[#22C55E] to-[#86efac]",
  "from-[#F59E0B] to-[#fcd34d]",
  "from-[#8B5CF6] to-[#c4b5fd]",
  "from-[#06B6D4] to-[#67e8f9]",
  "from-[#EC4899] to-[#fbcfe8]",
]

const GoogleLogo = ({ size = 5 }: { size?: number }) => (
  <svg className={`w-${size} h-${size} flex-shrink-0`} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 text-[#FBBC04] fill-[#FBBC04]" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  )
}

export function ReviewsSection() {
  return (
    <section className="py-16" style={{ background: "white", borderTop: "1px solid #e8eeff" }}>
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-5">
          <div>
            <span
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
              style={{ background: "#FFFBEE", color: "#92650A", border: "1px solid #fde68a" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#F59E0B" }} />
              Verifizierte Bewertungen
            </span>
            <h2 className="text-2xl font-black tracking-tight" style={{ color: "var(--ap-dark)" }}>
              Was unsere Kunden sagen
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--ap-muted)" }}>
              Echte Erfahrungen glücklicher Hundebesitzer 🐾
            </p>
          </div>

          {/* Google rating badge */}
          <div
            className="flex items-center gap-4 rounded-2xl px-6 py-4 shadow-sm self-start sm:self-auto"
            style={{ background: "var(--ap-blue-pale)", border: "1.5px solid #c3d4ff" }}
          >
            <GoogleLogo size={8} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-3xl leading-none" style={{ color: "var(--ap-dark)" }}>4.8</span>
                <div className="flex flex-col gap-0.5">
                  <Stars count={5} />
                  <span className="text-xs" style={{ color: "var(--ap-muted)" }}>41 Bewertungen</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews carousel */}
        <div className="relative">
          <div
            className="absolute right-0 top-0 bottom-4 w-20 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, white, transparent)" }}
          />

          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
            {reviews.map((review, i) => {
              const gradient = avatarGradients[i % avatarGradients.length]
              return (
                <div
                  key={i}
                  className="flex-shrink-0 rounded-3xl p-5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                  style={{
                    width: "296px",
                    background: i % 2 === 0 ? "var(--ap-blue-pale)" : "var(--ap-pink-pale)",
                    border: `1.5px solid ${i % 2 === 0 ? "#c3d4ff" : "#ffd0e5"}`,
                  }}
                >
                  {/* Quote */}
                  <div
                    className="text-5xl font-serif leading-none select-none mb-1"
                    style={{ color: i % 2 === 0 ? "#c3d4ff" : "#ffd0e5" }}
                  >&ldquo;</div>

                  {/* Text */}
                  <p className="text-sm leading-relaxed line-clamp-4 flex-1 -mt-2" style={{ color: "#374151" }}>
                    {review.text}
                  </p>

                  {/* Footer */}
                  <div className="mt-4 pt-4 flex items-center justify-between gap-2" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <span className="text-white font-bold text-sm">{review.name.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm leading-tight truncate" style={{ color: "var(--ap-dark)" }}>{review.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Stars count={review.stars} />
                          <span className="text-xs" style={{ color: "#CBD5E0" }}>· {review.date}</span>
                        </div>
                      </div>
                    </div>
                    <GoogleLogo size={4} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}
