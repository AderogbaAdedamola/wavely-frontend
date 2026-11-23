import {
  CalendarClockIcon,
  type LucideIcon,
  MegaphoneIcon,
  PowerIcon,
  QrCodeIcon,
  MessageCircleIcon,
  TerminalIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "./reveal";

interface Capability {
  icon: LucideIcon;
  tag: string;
  title: string;
  body: string;
}

const CAPABILITIES: Capability[] = [
  {
    icon: QrCodeIcon,
    tag: "connection",
    title: "Link your line",
    body: "Scan a QR to pair your WhatsApp number. Status streams live over the socket as the session connects.",
  },
  {
    icon: PowerIcon,
    tag: "control",
    title: "Arm the bot",
    body: "One switch decides whether incoming messages get automated replies. Disarm anytime and the line goes quiet.",
  },
  {
    icon: MegaphoneIcon,
    tag: "broadcast",
    title: "Broadcast in waves",
    body: "Build reusable lists from contacts, groups, or tags, then send one message out to every member at once.",
  },
  {
    icon: CalendarClockIcon,
    tag: "schedule",
    title: "Schedule sends",
    body: "Queue a single message or a whole broadcast for a future moment and let the dispatcher fire it on time.",
  },
  {
    icon: MessageCircleIcon,
    tag: "persona",
    title: "Shape your reply style",
    body: "Give the bot a name and a voice. Shape how it answers so automated replies still sound like you.",
  },
  {
    icon: TerminalIcon,
    tag: "commands",
    title: "Set command permissions",
    body: "Decide which commands run and who may run them, so the line only does what you've cleared it to do.",
  },
];

export function Capabilities() {
  return (
    <section id="capabilities" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal className="max-w-2xl">
        <p className="eyebrow">The console</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything the line needs, one desk
        </h2>
        <p className="mt-4 text-muted-foreground">
          Wavely covers the whole loop — from linking a number to dispatching
          the next wave — without leaving the console.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CAPABILITIES.map((c, i) => (
          <Reveal key={c.title} delay={(i % 3) * 80} className="h-full">
            <Card className="h-full transition duration-300 hover:ring-foreground/20">
              <CardContent className="flex h-full flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground">
                    <c.icon className="size-5" />
                  </span>
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                    {c.tag}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-medium tracking-tight">
                  {c.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {c.body}
                </p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
