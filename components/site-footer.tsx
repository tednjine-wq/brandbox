"use client";

import { useEffect, useState } from "react";

const WHATSAPP_NUMBER = "254712345678"; // TODO: replace with your real WhatsApp business number

export default function SiteFooter() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <footer className="border-t border-line bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-display text-xl font-bold">Need a custom quote?</p>
            <p className="mt-1 text-sm text-white/60">
              Tell us your quantity and deadline — we reply on WhatsApp within the hour.
            </p>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              "Hello BrandBox! I'd like a custom quote."
            )}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white hover:brightness-110"
          >
            Chat on WhatsApp
          </a>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-display text-lg font-bold">
                Brand<span className="text-brand">Box</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Transparent bulk pricing on branded merchandise for Kenyan businesses.
                Order in minutes, brand in days.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Quick links
              </p>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>
                  <a href="/" className="hover:text-white">Catalogue</a>
                </li>
                <li>
                  <a href="/admin" className="hover:text-white">Admin</a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Contact
              </p>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>WhatsApp: +254 712 345 678</li>
                <li>hello@brandbox.co.ke</li>
                <li>Nairobi, Kenya</li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                We accept
              </p>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>M-Pesa (Lipa na M-Pesa)</li>
                <li>Bank transfer (on request)</li>
              </ul>
              <p className="mt-4 text-xs text-white/50">3–7 day turnaround on standard orders.</p>
              <p className="mt-1 text-xs text-white/50">
                Prices exclude 16% VAT — VAT is added at checkout.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-white/50">
            © {new Date().getFullYear()} BrandBox Kenya — brandbox.co.ke
          </p>
        </div>
      </footer>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-5 right-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white shadow-lg transition hover:bg-brand"
        >
          ↑
        </button>
      )}
    </>
  );
}