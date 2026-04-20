export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFF9EC]">
      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-4 py-3 md:px-8 md:py-5">
        <div className="flex items-center">
          <img src="/logo-lotus.png" alt="" className="mr-1.5 h-7 w-7 object-contain md:mr-2 md:h-9 md:w-9" />
          <span className="text-lg font-bold tracking-tight text-[#1a1a1a] md:text-2xl">
            Sabai<span className="text-[#F4C430]">Apply</span>
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-5">
          <a
            href="/admin/login"
            className="hidden text-sm text-[#999] transition-colors hover:text-[#666] sm:inline"
          >
            Admin Portal
          </a>
          <a
            href="/login"
            className="text-sm font-medium text-[#1a1a1a] hover:underline"
          >
            Log in
          </a>
          <a
            href="/signup"
            className="rounded-lg bg-[#F4C430] px-4 py-2 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a] md:px-5 md:py-2.5"
          >
            Sign up
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-[440px] overflow-hidden py-14 md:h-[85vh] md:min-h-[500px] md:py-0">
        {/* Background image */}
        <img
          src="/hero-students.jpg"
          alt="Thai university students"
          className="absolute inset-0 h-full w-full object-cover brightness-90 blur-[5px]"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/30 md:from-black/65 md:via-black/45 md:to-black/25" />

        {/* Content */}
        <div className="relative z-10 flex h-full items-center px-5 md:px-8">
          <div className="mx-auto w-full max-w-[1100px]">
            <div className="mb-4 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm md:mb-5 md:px-4 md:py-1.5 md:text-sm">
              Thailand&apos;s University Application Platform
            </div>
            <h1 className="mb-4 max-w-[600px] text-3xl font-extrabold leading-[1.1] tracking-tight text-white md:mb-5 md:text-5xl">
              Apply once.<br />
              <span className="text-[#F4C430]">Go anywhere.</span>
            </h1>
            <p className="mb-6 max-w-[460px] text-base leading-relaxed text-white/80 md:mb-8 md:text-lg">
              One profile. One application form. Every Thai university.
              Built for Thai students and international applicants.
            </p>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
              <a
                href="/signup"
                className="rounded-lg bg-[#F4C430] px-6 py-3 text-center text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a] md:px-7 md:py-3.5"
              >
                Start your application
              </a>
              <a
                href="/login"
                className="rounded-lg border-2 border-white px-6 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-white/10 md:px-7 md:py-3.5"
              >
                Log in
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white px-5 py-12 md:px-8 md:py-20">
        <div className="mx-auto max-w-[900px] text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[1.5px] text-[#999]">
            How it works
          </p>
          <h2 className="mb-8 text-2xl font-extrabold tracking-tight text-[#1a1a1a] md:mb-14 md:text-3xl">
            Applying to university got easier
          </h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <StepCard
              number="1"
              title="Create your profile"
              description="Fill in your information and upload your documents once. That's it."
            />
            <StepCard
              number="2"
              title="Choose universities"
              description="Browse Thai universities, compare programs, and add them to your list."
            />
            <StepCard
              number="3"
              title="Apply everywhere"
              description="Submit to multiple universities with one click. Track every application in one place."
            />
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="px-5 py-12 md:px-8 md:py-20">
        <div className="mx-auto max-w-[900px] text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[1.5px] text-[#999]">
            Who it is for
          </p>
          <h2 className="mb-8 text-2xl font-extrabold tracking-tight text-[#1a1a1a] md:mb-14 md:text-3xl">
            Built for every student
          </h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <AudienceCard
              emoji="&#x1F1F9;&#x1F1ED;"
              title="Thai Students"
              description="Stop filling out the same form for every university. Apply everywhere from one place."
            />
            <AudienceCard
              emoji="&#x1F30D;"
              title="International Students"
              description="Applying to Thailand from abroad? We make it simple, clear, and available in your language."
            />
            <AudienceCard
              emoji="&#x1F3EB;"
              title="Universities"
              description="Receive standardized applications from a wider pool of students — less admin, more applicants."
            />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-[900px] px-5 pb-12 md:px-8 md:pb-20">
        <div className="rounded-2xl bg-[#E8A317] px-6 py-10 text-center md:px-12 md:py-14">
          <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-[#1a1a1a] md:text-3xl">
            Choosing a university is hard.<br />
            <span className="text-white">Applying shouldn&apos;t be.</span>
          </h2>
          <p className="mb-6 text-sm text-[#4a3a08] md:mb-8 md:text-base">Make your experience sabai sabai.</p>
          <a
            href="/signup"
            className="inline-block rounded-lg bg-[#1a1a1a] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#333] md:px-8 md:py-3.5"
          >
            Get started for free
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#e8e8e8] bg-white px-5 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-[1100px]">
          <div className="flex flex-col items-center gap-5 md:flex-row md:justify-between">
            {/* Left - Logo */}
            <div className="flex items-center gap-2">
              <img src="/logo-lotus.png" alt="" className="h-8 w-8 object-contain md:h-10 md:w-10" />
              <span className="text-2xl font-bold text-[#1a1a1a] md:text-3xl">
                Sabai<span className="text-[#F4C430]">Apply</span>
              </span>
            </div>

            {/* Center - Links */}
            <div className="flex items-center gap-5 md:gap-6">
              <button className="text-sm text-[#888] transition-colors hover:text-[#444]">
                Privacy Policy
              </button>
              <button className="text-sm text-[#888] transition-colors hover:text-[#444]">
                Terms of Use
              </button>
            </div>

            {/* Right - Chat */}
            <button className="flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#333]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              24/7 Support Chat
            </button>
          </div>

          <p className="mt-5 text-center text-xs text-[#bbb] md:text-sm">
            &copy; 2026 SabaiApply &middot; Bangkok, Thailand
          </p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="w-full flex-1 rounded-2xl border border-[#e8e8e8] bg-[#FFF9EC] p-6 text-left md:max-w-[260px] md:p-8">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#F4C430] text-sm font-extrabold text-[#1a1a1a] md:mb-4 md:h-10 md:w-10">
        {number}
      </div>
      <h3 className="mb-1.5 text-base font-bold text-[#1a1a1a] md:mb-2">{title}</h3>
      <p className="text-sm leading-relaxed text-[#666]">{description}</p>
    </div>
  );
}

function AudienceCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="w-full flex-1 rounded-2xl border border-[#e8e8e8] bg-white p-5 text-left shadow-sm md:max-w-[260px] md:p-7">
      <div className="mb-2.5 text-2xl md:mb-3 md:text-3xl" dangerouslySetInnerHTML={{ __html: emoji }} />
      <h3 className="mb-1.5 text-base font-bold text-[#1a1a1a]">{title}</h3>
      <p className="text-sm leading-relaxed text-[#777]">{description}</p>
    </div>
  );
}
