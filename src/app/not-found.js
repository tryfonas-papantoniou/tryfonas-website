import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import AuroraBackground from "@/components/AuroraBackground";
import ParticleBackground from "@/components/ParticleBackground";
import Navigation from "@/components/Navigation";

export const metadata = {
  title: "Signal Lost — 404",
  description: "The page you were looking for drifted into deep space.",
};

export default function NotFound() {
  return (
    <>
      <AuroraBackground />
      <ParticleBackground />
      <Navigation />

      <section className="not-found">
        <div className="not-found-inner">
          <span className="section-label">Error 404</span>
          <h1 className="not-found-title">
            Signal<span className="highlight"> Lost</span>.
          </h1>
          <p className="not-found-sub">
            The page you were looking for drifted off into deep space — or never
            existed in the first place. Let&apos;s get you back on course.
          </p>
          <div className="not-found-buttons">
            <Link href="/" className="btn-primary glow-border">
              <Home size={16} strokeWidth={2.2} aria-hidden="true" />
              Back to Home
            </Link>
            <Link href="/#projects" className="btn-secondary glow-border">
              <ArrowLeft size={16} strokeWidth={2.2} aria-hidden="true" />
              See My Projects
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
