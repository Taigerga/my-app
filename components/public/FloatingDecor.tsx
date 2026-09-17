import { Armchair, Sofa, BedDouble, Table, LampFloor, DoorClosed } from "lucide-react";

type Decor = {
  Icon: typeof Armchair;
  position: string;
  size: number;
  duration: number;
  delay: number;
};

/** Sketsa ikon furniture samar yang melayang lambat di background hero.
 *  Murni dekorasi: disembunyikan dari AT, tidak menangkap klik,
 *  dan diam saat prefers-reduced-motion. */
const ITEMS: Decor[] = [
  { Icon: Armchair, position: "-left-6 top-8", size: 110, duration: 8, delay: 0 },
  { Icon: Table, position: "left-[12%] bottom-10", size: 84, duration: 10, delay: 1.5 },
  { Icon: BedDouble, position: "-right-8 top-16", size: 120, duration: 9, delay: 0.8 },
  { Icon: LampFloor, position: "right-[14%] top-6", size: 72, duration: 7.5, delay: 2.2 },
  { Icon: Sofa, position: "right-[6%] bottom-16", size: 96, duration: 11, delay: 1 },
  { Icon: DoorClosed, position: "left-[38%] -top-4", size: 68, duration: 9.5, delay: 3 },
];

export function FloatingDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {ITEMS.map(({ Icon, position, size, duration, delay }, i) => (
        <span
          key={i}
          style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
          className={`anim-drift absolute ${position} text-pine opacity-[0.08]`}
        >
          <Icon size={size} strokeWidth={1.25} />
        </span>
      ))}
    </div>
  );
}
