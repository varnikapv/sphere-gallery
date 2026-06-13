import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />

      <section id="works" className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg-secondary)" }}>
        <p className="text-sm tracking-widest uppercase" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-sans)" }}>
          Works — coming next
        </p>
      </section>

      <section id="about" className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg-primary)" }}>
        <p className="text-sm tracking-widest uppercase" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-sans)" }}>
          About — coming soon
        </p>
      </section>

      <section id="services" className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg-secondary)" }}>
        <p className="text-sm tracking-widest uppercase" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-sans)" }}>
          Services — coming soon
        </p>
      </section>

      <section id="testimonials" className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg-primary)" }}>
        <p className="text-sm tracking-widest uppercase" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-sans)" }}>
          Testimonials — coming soon
        </p>
      </section>

      <section id="contact" className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg-tertiary)" }}>
        <p className="text-sm tracking-widest uppercase" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-sans)" }}>
          Contact — coming soon
        </p>
      </section>
    </main>
  );
}
