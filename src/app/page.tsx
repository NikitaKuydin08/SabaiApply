export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFF9EC]">
      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center">
          <img src="/logo-lotus.png" alt="" className="mr-2 h-9 w-9 object-contain" />
          <span className="text-2xl font-bold tracking-tight text-[#1a1a1a]">
            Sabai<span className="text-[#F4C430]">Apply</span>
          </span>
        </div>
        <div className="flex items-center gap-5">
          <a
            href="/admin/login"
            className="text-sm text-[#999] hover:text-[#666] transition-colors"
          >
            University Admin
          </a>
          <a
            href="/login"
            className="text-sm font-medium text-[#1a1a1a] hover:underline"
          >
            Log in
          </a>
          <a
            href="/signup"
            className="rounded-lg bg-[#F4C430] px-5 py-2.5 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a]"
          >
            Sign up
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative h-[85vh] min-h-[500px] overflow-hidden">
        {/* Background image */}
        <img
          src="/hero-students.jpg"
          alt="Thai university students"
          className="absolute inset-0 h-full w-full object-cover brightness-90 blur-[5px]"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/45 to-black/25" />

        {/* Content */}
        <div className="relative z-10 flex h-full items-center px-8">
          <div className="mx-auto w-full max-w-[1100px]">
            <div className="mb-5 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
              Thailand&apos;s University Application Platform
            </div>
            <h1 className="mb-5 max-w-[600px] text-5xl font-extrabold leading-[1.1] tracking-tight text-white">
              Apply once.<br />
              <span className="text-[#F4C430]">Go anywhere.</span>
            </h1>
            <p className="mb-8 max-w-[460px] text-lg leading-relaxed text-white/80">
              One profile. One application form. Every Thai university.
              Built for Thai students and international applicants.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="/signup"
                className="rounded-lg bg-[#F4C430] px-7 py-3.5 text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a]"
              >
                Start your application
              </a>
              <a
                href="/login"
                className="rounded-lg border-2 border-white px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                Log in
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white py-20 px-8">
        <div className="mx-auto max-w-[900px] text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[1.5px] text-[#999]">
            How it works
          </p>
          <h2 className="mb-14 text-3xl font-extrabold tracking-tight text-[#1a1a1a]">
            Applying to university got easier
          </h2>
          <div className="flex gap-8 flex-wrap justify-center">
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
      <section className="py-20 px-8">
        <div className="mx-auto max-w-[900px] text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[1.5px] text-[#999]">
            Who it is for
          </p>
          <h2 className="mb-14 text-3xl font-extrabold tracking-tight text-[#1a1a1a]">
            Built for every student
          </h2>
          <div className="flex gap-6 justify-center flex-wrap">
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
      <section className="mx-auto max-w-[900px] px-8 pb-20">
        <div className="rounded-2xl bg-[#1a1a1a] px-12 py-14 text-center">
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-white">
            Choosing a university is hard.<br />
            <span className="text-[#F4C430]">Applying shouldn&apos;t be.</span>
          </h2>
          <p className="mb-8 text-base text-[#888]">Make your experience sabai sabai.</p>
          <a
            href="/signup"
            className="inline-block rounded-lg bg-[#F4C430] px-8 py-3.5 text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a]"
          >
            Get started for free
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#e8e8e8] bg-white py-8 px-8">
        <div className="mx-auto max-w-[1100px]">
          <div className="flex items-center justify-between">
            {/* Left - Logo */}
            <div className="flex items-center gap-2">
              <img src="/logo-lotus.png" alt="" className="h-10 w-10 object-contain" />
              <span className="text-3xl font-bold text-[#1a1a1a]">
                Sabai<span className="text-[#F4C430]">Apply</span>
              </span>
            </div>

            {/* Center - Links */}
            <div className="flex items-center gap-6">
              <button className="text-sm text-[#888] hover:text-[#444] transition-colors">
                Privacy Policy
              </button>
              <button className="text-sm text-[#888] hover:text-[#444] transition-colors">
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

          <p className="mt-5 text-center text-sm text-[#bbb]">
            &copy; 2026 SabaiApply &middot; Bangkok, Thailand
          </p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-[#e8e8e8] bg-[#FFF9EC] p-8 flex-1 min-w-[220px] max-w-[260px] text-left">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#F4C430] text-sm font-extrabold text-[#1a1a1a]">
        {number}
      </div>
      <h3 className="mb-2 text-base font-bold text-[#1a1a1a]">{title}</h3>
      <p className="text-sm leading-relaxed text-[#666]">{description}</p>
    </div>
  );
}

function AudienceCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-[#e8e8e8] bg-white p-7 flex-1 min-w-[220px] max-w-[260px] text-left shadow-sm">
      <div className="mb-3 text-3xl" dangerouslySetInnerHTML={{ __html: emoji }} />
      <h3 className="mb-1.5 text-base font-bold text-[#1a1a1a]">{title}</h3>
      <p className="text-sm leading-relaxed text-[#777]">{description}</p>
    </div>
  );
}
