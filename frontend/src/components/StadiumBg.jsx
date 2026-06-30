/**
 * Subtle stadium background — low opacity so it doesn't overpower content.
 */
export default function StadiumBg({ opacity = 0.35 }) {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none select-none overflow-hidden" style={{ opacity }}>
      <svg viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <defs>
          <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#020610"/>
            <stop offset="100%" stopColor="#0a1120"/>
          </linearGradient>
          <radialGradient id="fl1" cx="15%" cy="0%" r="55%">
            <stop offset="0%"   stopColor="#f2b705" stopOpacity="0.12"/>
            <stop offset="100%" stopColor="#f2b705" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="fl2" cx="85%" cy="0%" r="55%">
            <stop offset="0%"   stopColor="#f2b705" stopOpacity="0.12"/>
            <stop offset="100%" stopColor="#f2b705" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="vig" cx="50%" cy="50%" r="70%">
            <stop offset="0%"   stopColor="transparent"/>
            <stop offset="100%" stopColor="#020610" stopOpacity="0.8"/>
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#skyG)"/>
        <rect width="1440" height="900" fill="url(#fl1)"/>
        <rect width="1440" height="900" fill="url(#fl2)"/>
        {/* Stars */}
        {[[80,40],[230,30],[410,25],[590,40],[760,55],[940,65],[1110,50],[1300,72],[150,110],[450,90],[700,120],[1000,100],[1250,115]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="0.8" fill="white" opacity={0.2+((i*7)%5)*0.08}/>
        ))}
        {/* Stands */}
        <ellipse cx="720" cy="510" rx="620" ry="270" fill="#0d1828" opacity="0.9"/>
        <ellipse cx="720" cy="510" rx="580" ry="238" fill="#0a1120"/>
        {[0,1,2,3,4,5].map(i=>(
          <ellipse key={i} cx="720" cy={492-i*20} rx={540-i*28} ry={218-i*20}
            fill="none" stroke="#162032" strokeWidth="1.5" opacity="0.6"/>
        ))}
        {/* Field */}
        <ellipse cx="720" cy="630" rx="360" ry="150" fill="#142a1b"/>
        <ellipse cx="720" cy="628" rx="348" ry="142" fill="#183222"/>
        {/* Pitch */}
        <rect x="701" y="582" width="38" height="82" rx="1" fill="#7a6448" opacity="0.7"/>
        <line x1="701" y1="604" x2="739" y2="604" stroke="white" strokeWidth="1" opacity="0.5"/>
        <line x1="701" y1="642" x2="739" y2="642" stroke="white" strokeWidth="1" opacity="0.5"/>
        {/* Boundary */}
        <ellipse cx="720" cy="628" rx="352" ry="144"
          fill="none" stroke="#f2b705" strokeWidth="1.5" opacity="0.2" strokeDasharray="6 5"/>
        {/* Towers */}
        <rect x="142" y="100" width="8" height="240" fill="#162032"/>
        <rect x="108" y="98" width="60" height="8" fill="#162032"/>
        {[108,122,136,150,162].map((x,i)=>(
          <rect key={i} x={x} y="84" width="10" height="6" fill="#f2b705" opacity="0.6"/>
        ))}
        <rect x="1290" y="100" width="8" height="240" fill="#162032"/>
        <rect x="1272" y="98" width="60" height="8" fill="#162032"/>
        {[1272,1286,1300,1314,1326].map((x,i)=>(
          <rect key={i} x={x} y="84" width="10" height="6" fill="#f2b705" opacity="0.6"/>
        ))}
        <rect width="1440" height="900" fill="url(#vig)"/>
        {/* Bottom fade */}
        <linearGradient id="btm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="transparent"/>
          <stop offset="100%" stopColor="#0a1120"/>
        </linearGradient>
        <rect y="650" width="1440" height="250" fill="url(#btm)"/>
      </svg>
    </div>
  );
}
