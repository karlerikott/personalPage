import Navbar from "@/components/Navbar";
import BackToTop from "@/components/BackToTop";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#250902] text-white font-[family-name:var(--font-geist-sans)]">

      <Navbar />

      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center px-8 md:px-20 pt-24">
        <div className="max-w-3xl">
          <p className="font-[family-name:var(--font-geist-mono)] text-[#ad2831] text-sm tracking-widest uppercase mb-6">
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
              className="px-6 py-3 bg-[#ad2831] hover:bg-[#ad2831]/80 text-white font-semibold rounded-full transition-colors text-sm"
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
      <section id="experience" className="px-8 md:px-20 py-32 bg-white/[0.03]">
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
              href="mailto:karlerik.ott@gmail.com"
              className="group flex items-center gap-3 text-white/50 hover:text-white transition-colors text-sm"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              karlerik.ott@gmail.com
            </a>
            <a
              href="https://github.com/karlerikott"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-white/50 hover:text-white transition-colors text-sm"
            >
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              github.com/karlerikott
            </a>
            <a
              href="https://www.linkedin.com/in/karl-erik-ott-9a8982203/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-white/50 hover:text-white transition-colors text-sm"
            >
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              linkedin.com/in/karl-erik-ott
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 md:px-20 py-8 border-t border-white/5 flex justify-between items-center text-white/20 text-xs font-[family-name:var(--font-geist-mono)]">
        <span>Karl Erik Ott</span>
        <span>{new Date().getFullYear()}</span>
      </footer>

      <BackToTop />

    </main>
  );
}
