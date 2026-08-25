import { Reveal } from "./reveal";

const STEPS = [
  {
    n: "01",
    tag: "connect",
    title: "Link WhatsApp",
    body: "Scan the pairing code to connect your number. The console shows the line go live the moment the session is ready.",
  },
  {
    n: "02",
    tag: "activate",
    title: "Arm the bot",
    body: "Flip the switch and set the persona. Wavely starts answering incoming messages in the voice you gave it.",
  },
  {
    n: "03",
    tag: "dispatch",
    title: "Broadcast waves",
    body: "Build a list, write the message, then send now or schedule it. Your next dispatch surfaces on the console home.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      className="border-y border-border/60 bg-card/40"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Get on air</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Three moves to your first wave
          </h2>
        </Reveal>

        <div className="relative mt-14">
          {/* the signal wire the step nodes sit on */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
          />
          <ol className="grid gap-12 lg:grid-cols-3 lg:gap-8">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 90} className="relative">
                <div className="flex items-center gap-3">
                  <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full bg-card font-display text-lg font-semibold text-signal ring-1 ring-border">
                    {s.n}
                  </span>
                  <span className="eyebrow">{s.tag}</span>
                </div>
                <h3 className="mt-5 font-heading text-xl font-medium tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
