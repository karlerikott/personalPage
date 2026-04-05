export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-[family-name:var(--font-geist-sans)]">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-10 px-8 py-5 flex justify-between items-center border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-sm">
        <span className="font-[family-name:var(--font-geist-mono)] text-sm text-white/40 tracking-widest uppercase">KEO</span>
        <div className="flex gap-8 text-sm text-white/50">
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#experience" className="hover:text-white transition-colors">Experience</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center px-8 md:px-20 pt-24">
        <div className="max-w-3xl">
          <p className="font-[family-name:var(--font-geist-mono)] text-emerald-400 text-sm tracking-widest uppercase mb-6">
            Available for new opportunities
          </p>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-none mb-6">
            Karl Erik<br />
            <span className="text-white/20">Ott</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/60 max-w-xl leading-relaxed mb-10">
            Backend Software Engineer at{" "}
            <span className="text-white">Wise</span>
            , building reliable transaction processing systems at scale.
          </p>
          <div className="flex gap-4 flex-wrap">
            <a
              href="#contact"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-full transition-colors text-sm"
            >
              Get in touch
            </a>
            <a
              href="#experience"
              className="px-6 py-3 border border-white/10 hover:border-white/30 text-white/60 hover:text-white rounded-full transition-colors text-sm"
            >
              See my work
            </a>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 text-xs tracking-widest uppercase">
          <span>Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-8 md:px-20 py-32 max-w-5xl mx-auto">
        <p className="font-[family-name:var(--font-geist-mono)] text-white/30 text-xs tracking-widest uppercase mb-12">01 — About</p>
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-snug">
              I build the systems that keep money moving.
            </h2>
            <p className="text-white/50 leading-relaxed mb-4">
              I&apos;m a 26-year-old backend engineer at Wise, where I work on transaction processing — the infrastructure behind millions of international transfers daily.
            </p>
            <p className="text-white/50 leading-relaxed">
              I hold a Bachelor&apos;s degree in Computer Science from the University of Tartu, Estonia.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-white/30 text-xs uppercase tracking-widest font-[family-name:var(--font-geist-mono)] mb-2">Tech I work with</p>
            {[
              { label: "Languages", value: "Java, SQL" },
              { label: "Frameworks", value: "Spring Boot, Spring Data JPA" },
              { label: "Databases", value: "PostgreSQL" },
              { label: "Tools", value: "Git, Maven, Docker" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-3 border-b border-white/5 text-sm">
                <span className="text-white/30">{label}</span>
                <span className="text-white/70">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="px-8 md:px-20 py-32 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <p className="font-[family-name:var(--font-geist-mono)] text-white/30 text-xs tracking-widest uppercase mb-12">02 — Experience</p>
          <div className="space-y-px">
            {[
              {
                role: "Software Engineer",
                company: "Wise",
                team: "Transaction Processing",
                period: "Present",
                description: "Building and maintaining high-throughput transaction processing systems handling international money transfers at scale.",
              },
              {
                role: "Bachelor of Computer Science",
                company: "University of Tartu",
                team: "Estonia",
                period: "Graduated",
                description: "Studied core computer science fundamentals including algorithms, data structures, software engineering, and distributed systems.",
              },
            ].map(({ role, company, team, period, description }) => (
              <div
                key={role}
                className="group grid md:grid-cols-[1fr_2fr] gap-6 p-8 hover:bg-white/[0.03] transition-colors rounded-2xl"
              >
                <div>
                  <p className="text-white/30 text-xs font-[family-name:var(--font-geist-mono)] uppercase tracking-widest mb-2">{period}</p>
                  <p className="font-semibold text-white">{company}</p>
                  <p className="text-white/40 text-sm">{team}</p>
                </div>
                <div>
                  <p className="font-semibold text-white mb-2">{role}</p>
                  <p className="text-white/50 text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="px-8 md:px-20 py-32 max-w-5xl mx-auto">
        <p className="font-[family-name:var(--font-geist-mono)] text-white/30 text-xs tracking-widest uppercase mb-12">03 — Contact</p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            Let&apos;s work<br />
            <span className="text-white/20">together.</span>
          </h2>
          <div className="flex flex-col gap-4">
            <a
              href="mailto:karl@example.com"
              className="group flex items-center gap-3 text-white/50 hover:text-white transition-colors text-sm"
            >
              <span className="w-8 h-px bg-white/20 group-hover:bg-white/60 transition-colors" />
              karl@example.com
            </a>
            <a
              href="https://github.com/karlerikott"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-white/50 hover:text-white transition-colors text-sm"
            >
              <span className="w-8 h-px bg-white/20 group-hover:bg-white/60 transition-colors" />
              github.com/karlerikott
            </a>
            <a
              href="https://www.linkedin.com/in/karl-erik-ott-9a8982203/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-white/50 hover:text-white transition-colors text-sm"
            >
              <span className="w-8 h-px bg-white/20 group-hover:bg-white/60 transition-colors" />
              linkedin.com/in/karlerikott
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 md:px-20 py-8 border-t border-white/5 flex justify-between items-center text-white/20 text-xs font-[family-name:var(--font-geist-mono)]">
        <span>Karl Erik Ott</span>
        <span>{new Date().getFullYear()}</span>
      </footer>

    </main>
  );
}
