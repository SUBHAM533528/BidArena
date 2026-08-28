// The same faint "cricket-paint.svg" wash used behind every section on the
// landing page (Highlights, Teams, Celebrate, etc). Pulled out into one
// component so every new section — FAQ, Gallery, Terms, Contact — picks up
// the identical background treatment instead of re-pasting the div.
export default function PaintBg() {
  return (
    <div className="absolute inset-0 bg-[url('/cricket-paint.svg')] bg-cover bg-center opacity-[0.3] pointer-events-none" />
  );
}
