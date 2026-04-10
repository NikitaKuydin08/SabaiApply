export default function Home() {
  return (
    <>
      <nav className="flex justify-between items-center px-8 py-6 border-b border-[#f0f0f0]">
        <div className="text-[1.4rem] font-bold tracking-tight text-[#1a1a1a]">
          Sabai<span className="text-[#F4C430]">Apply</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="text-sm font-medium text-[#1a1a1a] hover:underline"
          >
            Log in
          </a>
          <a
            href="/signup"
            className="bg-[#F4C430] text-[#1a1a1a] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#e6b82a] transition-colors"
          >
            Sign up
          </a>
        </div>
      </nav>

      <section className="max-w-[720px] mx-auto px-8 pt-20 pb-16 text-center">
        <div className="inline-block bg-[#FFF8CC] text-[#8a6f00] text-[0.78rem] font-semibold px-3.5 py-1.5 rounded-full mb-6 tracking-wide">
          Thailand&apos;s First Unified University Application Platform
        </div>
        <h1 className="text-[clamp(2.2rem,5vw,3.2rem)] font-extrabold leading-[1.15] tracking-tight text-[#1a1a1a] mb-5">
          Apply once.<br />
          <span className="text-[#F4C430]">Go anywhere.</span>
        </h1>
        <p className="text-lg text-[#555] leading-relaxed max-w-[540px] mx-auto">
          One profile. One application form. Every Thai university.
          Built for Thai students and international applicants — in multiple languages.
        </p>
      </section>

      <section className="bg-[#fafafa] py-16 px-8 text-center">
        <p className="text-xs font-bold tracking-[1.5px] uppercase text-[#999] mb-3">
          How it works
        </p>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1a1a1a] mb-12">
          Applying to university got easier
        </h2>
        <div className="flex gap-8 max-w-[860px] mx-auto flex-wrap justify-center">
          <div className="bg-white border border-[#efefef] rounded-2xl p-8 flex-1 min-w-[220px] max-w-[260px] text-left">
            <div className="w-9 h-9 bg-[#F4C430] text-[#1a1a1a] font-extrabold text-sm rounded-full flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-[#1a1a1a] mb-2">Create your profile</h3>
            <p className="text-sm text-[#666] leading-relaxed">
              Fill in your information and upload your documents once. That&apos;s it.
            </p>
          </div>
          <div className="bg-white border border-[#efefef] rounded-2xl p-8 flex-1 min-w-[220px] max-w-[260px] text-left">
            <div className="w-9 h-9 bg-[#F4C430] text-[#1a1a1a] font-extrabold text-sm rounded-full flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-[#1a1a1a] mb-2">Browse universities</h3>
            <p className="text-sm text-[#666] leading-relaxed">
              Explore Thai universities, compare fees, scholarships, and requirements in one place.
            </p>
          </div>
          <div className="bg-white border border-[#efefef] rounded-2xl p-8 flex-1 min-w-[220px] max-w-[260px] text-left">
            <div className="w-9 h-9 bg-[#F4C430] text-[#1a1a1a] font-extrabold text-sm rounded-full flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-[#1a1a1a] mb-2">Apply everywhere</h3>
            <p className="text-sm text-[#666] leading-relaxed">
              Submit to multiple universities with one click. Add extra documents only if a specific university needs them.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-8 max-w-[860px] mx-auto text-center">
        <p className="text-xs font-bold tracking-[1.5px] uppercase text-[#999] mb-3">
          Who it is for
        </p>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1a1a1a] mb-10">
          Built for every student
        </h2>
        <div className="flex gap-6 justify-center flex-wrap">
          <div className="bg-white border border-[#efefef] rounded-2xl py-7 px-6 flex-1 min-w-[200px] max-w-[240px] text-left">
            <div className="text-3xl mb-3">&#x1F1F9;&#x1F1ED;</div>
            <h3 className="text-base font-bold text-[#1a1a1a] mb-1.5">Thai Students</h3>
            <p className="text-sm text-[#777] leading-relaxed">
              Stop filling out the same form for every university. Apply everywhere from one place.
            </p>
          </div>
          <div className="bg-white border border-[#efefef] rounded-2xl py-7 px-6 flex-1 min-w-[200px] max-w-[240px] text-left">
            <div className="text-3xl mb-3">&#x1F30D;</div>
            <h3 className="text-base font-bold text-[#1a1a1a] mb-1.5">International Students</h3>
            <p className="text-sm text-[#777] leading-relaxed">
              Applying to Thailand from abroad? We make it simple, clear, and available in your language.
            </p>
          </div>
          <div className="bg-white border border-[#efefef] rounded-2xl py-7 px-6 flex-1 min-w-[200px] max-w-[240px] text-left">
            <div className="text-3xl mb-3">&#x1F3EB;</div>
            <h3 className="text-base font-bold text-[#1a1a1a] mb-1.5">Universities</h3>
            <p className="text-sm text-[#777] leading-relaxed">
              Receive standardized applications from a wider pool of students — less admin, more applicants.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#1a1a1a] text-white py-16 px-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight mb-3">
          Choosing a university is hard.<br />
          <span className="text-[#F4C430]">Applying shouldn&apos;t be.</span>
        </h2>
        <p className="text-[#aaa] text-base">Make your experience sabai sabai.</p>
      </section>

      <footer className="py-8 text-center text-sm text-[#aaa] border-t border-[#f0f0f0]">
        <p>&copy; 2026 SabaiApply &middot; Bangkok, Thailand</p>
      </footer>
    </>
  );
}
