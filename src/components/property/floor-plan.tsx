import { cn } from "@/lib/utils";
import type { Property } from "@/types/property";

type FloorPlanProps = {
  plan: Property["plan"];
  className?: string;
};

const plans: Record<
  Property["plan"],
  { rooms: { x: number; y: number; w: number; h: number; label: string }[] }
> = {
  studio: {
    rooms: [
      { x: 8, y: 8, w: 200, h: 140, label: "Студія" },
      { x: 216, y: 8, w: 76, h: 70, label: "Кухня" },
      { x: 216, y: 86, w: 76, h: 62, label: "Ванна" },
      { x: 8, y: 156, w: 120, h: 36, label: "Передпокій" },
    ],
  },
  two: {
    rooms: [
      { x: 8, y: 8, w: 184, h: 118, label: "Вітальня" },
      { x: 200, y: 8, w: 92, h: 72, label: "Спальня" },
      { x: 200, y: 88, w: 92, h: 72, label: "Спальня" },
      { x: 8, y: 134, w: 92, h: 58, label: "Кухня" },
      { x: 108, y: 134, w: 84, h: 58, label: "Ванна" },
    ],
  },
  three: {
    rooms: [
      { x: 8, y: 8, w: 156, h: 118, label: "Вітальня" },
      { x: 172, y: 8, w: 120, h: 70, label: "Спальня" },
      { x: 172, y: 86, w: 58, h: 106, label: "Спальня" },
      { x: 238, y: 86, w: 54, h: 54, label: "Спальня" },
      { x: 8, y: 134, w: 76, h: 58, label: "Кухня" },
      { x: 92, y: 134, w: 72, h: 58, label: "Ванна" },
      { x: 238, y: 148, w: 54, h: 44, label: "Гардероб" },
    ],
  },
  four: {
    rooms: [
      { x: 8, y: 8, w: 148, h: 100, label: "Вітальня" },
      { x: 164, y: 8, w: 128, h: 52, label: "Тераса" },
      { x: 164, y: 68, w: 62, h: 64, label: "Спальня" },
      { x: 234, y: 68, w: 58, h: 64, label: "Спальня" },
      { x: 8, y: 116, w: 72, h: 76, label: "Спальня" },
      { x: 88, y: 116, w: 68, h: 76, label: "Спальня" },
      { x: 164, y: 140, w: 62, h: 52, label: "Ванна" },
      { x: 234, y: 140, w: 58, h: 52, label: "Ванна" },
    ],
  },
  house: {
    rooms: [
      { x: 8, y: 8, w: 140, h: 90, label: "Вітальня" },
      { x: 156, y: 8, w: 136, h: 50, label: "Кухня" },
      { x: 156, y: 66, w: 66, h: 56, label: "Кабінет" },
      { x: 230, y: 66, w: 62, h: 56, label: "Ванна" },
      { x: 8, y: 106, w: 68, h: 86, label: "Спальня" },
      { x: 84, y: 106, w: 64, h: 86, label: "Спальня" },
      { x: 156, y: 130, w: 66, h: 62, label: "Спальня" },
      { x: 230, y: 130, w: 62, h: 62, label: "Тераса" },
    ],
  },
};

export function FloorPlan({ plan, className }: FloorPlanProps) {
  const { rooms } = plans[plan];

  return (
    <figure className={cn("border border-warm bg-canvas", className)}>
      <svg
        viewBox="0 0 300 200"
        className="h-auto w-full text-foreground"
        role="img"
        aria-label="Схематичний план об'єкта"
      >
        <rect width="300" height="200" fill="var(--paper)" />
        {rooms.map((room) => (
          <g key={`${room.label}-${room.x}-${room.y}`}>
            <rect
              x={room.x}
              y={room.y}
              width={room.w}
              height={room.h}
              fill="var(--canvas)"
              stroke="currentColor"
              strokeWidth="1.1"
            />
            <text
              x={room.x + room.w / 2}
              y={room.y + room.h / 2 + 4}
              textAnchor="middle"
              fill="currentColor"
              fontSize="11"
              fontFamily="ui-serif, Georgia, serif"
            >
              {room.label}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="border-t border-warm px-4 py-3 text-[0.72rem] tracking-[0.12em] text-ink-soft uppercase">
        Схема плану, не технічний кресленик
      </figcaption>
    </figure>
  );
}
