import React from 'react';
import Svg, { Path, Circle, Rect, G, Polyline } from 'react-native-svg';

type IconProps = {
  name: string;
  size?: number;
  color?: string | import('react-native').ColorValue;
  strokeWidth?: number;
};

export function Icon({ name, size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) {
  const p = { fill: 'none' as const, stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  const icons: Record<string, React.ReactNode> = {
    heart: <Path {...p} d="M12 20c-1-.7-8-5.2-8-10.5C4 6.5 6 5 8 5c1.7 0 3.1 1 4 2.3C12.9 6 14.3 5 16 5c2 0 4 1.5 4 4.5C20 14.8 13 19.3 12 20z" />,
    plane: <Path {...p} d="M5.5 12.5L3 11l1-2 3 .6 4-4c.8-.8 2.2-1.2 2.8-.6.6.6.2 2-.6 2.8l-4 4 .6 3-2 1-1.5-2.5-1.4 2.2-1.8-.2.2-1.8 2.2-1.4z" />,
    house: <G {...p}><Path d="M4 11l8-6 8 6" /><Path d="M6 10v9h12v-9" /><Path d="M10 19v-5h4v5" /></G>,
    ring: <G {...p}><Circle cx="12" cy="14" r="6" /><Path d="M9 8l1.5-3h3L15 8" /></G>,
    wedding: <G {...p}><Circle cx="9" cy="14" r="5" /><Circle cx="15" cy="14" r="5" /></G>,
    paw: <G {...p}><Circle cx="7" cy="10" r="1.8" /><Circle cx="12" cy="8" r="1.8" /><Circle cx="17" cy="10" r="1.8" /><Path d="M8 16c0-2.5 1.8-4 4-4s4 1.5 4 4-1.8 3-4 3-4-.5-4-3z" /></G>,
    job: <G {...p}><Rect x="4" y="8" width="16" height="11" rx="2" /><Path d="M9 8V6a2 2 0 012-2h2a2 2 0 012 2v2" /><Path d="M4 13h16" /></G>,
    key: <G {...p}><Circle cx="8" cy="9" r="4" /><Path d="M11 12l7 7M16 17l2-2M14 15l2-2" /></G>,
    candle: <G {...p}><Path d="M10 10h4v9h-4z" /><Path d="M12 10c0-2-2-2.5-2-4 0 0 .8.5 2 .5S14 6 14 6c0 1.5-2 2-2 4z" /></G>,
    star: <Path {...p} d="M12 4l2.3 5.1 5.5.5-4.1 3.7 1.2 5.4L12 16.5 7.1 18.2l1.2-5.4L4.2 9.6l5.5-.5z" />,
    sparkle: <G {...p}><Path d="M12 4c.6 3.5 1.5 4.4 5 5-3.5.6-4.4 1.5-5 5-.6-3.5-1.5-4.4-5-5 3.5-.6 4.4-1.5 5-5z" /><Path d="M18 14c.3 1.6.7 2 2.3 2.3-1.6.3-2 .7-2.3 2.3-.3-1.6-.7-2-2.3-2.3 1.6-.3 2-.7 2.3-2.3z" /></G>,
    cake: <G {...p}><Path d="M5 12h14v7H5z" /><Path d="M5 15c1.5 0 1.5 1.5 3 1.5s1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5" /><Path d="M9 12V8M15 12V8M12 12V7" /><Circle cx="9" cy="5" r=".6" fill={color} stroke="none" /><Circle cx="12" cy="4" r=".6" fill={color} stroke="none" /><Circle cx="15" cy="5" r=".6" fill={color} stroke="none" /></G>,
    gem: <G {...p}><Path d="M6 5h12l3 5-9 10-9-10z" /><Path d="M3 10h18M9 5l-1.5 5L12 20M15 5l1.5 5L12 20" /></G>,
    fork: <G {...p}><Path d="M7 4v6c0 1 1 1.5 1 1.5L7.7 20M7 4v4M9 4v4M15 4c-1.5 0-2 2-2 4s.5 3 2 3v9" /></G>,
    leaf: <G {...p}><Path d="M5 19C5 11 11 5 19 5c0 8-6 14-14 14z" /><Path d="M5 19c4-5 7-7 11-9" /></G>,
    bell: <G {...p}><Path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" /><Path d="M10 20a2 2 0 004 0" /></G>,
    search: <G {...p}><Circle cx="11" cy="11" r="6" /><Path d="M16 16l4 4" /></G>,
    gear: <G {...p}><Circle cx="12" cy="12" r="3.2" /><Path d="M19.4 13a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" /></G>,
    plus: <Path {...p} d="M12 5v14M5 12h14" />,
    check: <Path {...p} d="M5 12.5l5 5 9-10" />,
    x: <Path {...p} d="M6 6l12 12M18 6L6 18" />,
    chevR: <Path {...p} d="M9 5l7 7-7 7" />,
    chevL: <Path {...p} d="M15 5l-7 7 7 7" />,
    chevD: <Path {...p} d="M5 9l7 7 7-7" />,
    arrowR: <Path {...p} d="M4 12h15M13 6l6 6-6 6" />,
    pen: <G {...p}><Path d="M16 4l4 4L8 20H4v-4z" /><Path d="M14 6l4 4" /></G>,
    feather: <G {...p}><Path d="M19 5c-4 0-9 2-11 9l-3 5M19 5c1 5-1 11-9 12M9 14h6" /></G>,
    envelope: <G {...p}><Rect x="3" y="6" width="18" height="13" rx="2.5" /><Path d="M4 8l8 5 8-5" /></G>,
    lock: <G {...p}><Rect x="5" y="11" width="14" height="9" rx="2.5" /><Path d="M8 11V8a4 4 0 018 0v3" /></G>,
    crown: <G {...p}><Path d="M4 8l3 8h10l3-8-5 4-3-6-3 6z" /></G>,
    camera: <G {...p}><Rect x="3" y="7" width="18" height="13" rx="3" /><Circle cx="12" cy="13.5" r="3.5" /><Path d="M8 7l1.5-2.5h5L16 7" /></G>,
    image: <G {...p}><Rect x="3" y="5" width="18" height="14" rx="2.5" /><Circle cx="8.5" cy="10" r="1.6" /><Path d="M5 18l4.5-4.5 3 3L16 12l3 3" /></G>,
    mapPin: <G {...p}><Path d="M12 21c4-5 7-8 7-11a7 7 0 10-14 0c0 3 3 6 7 11z" /><Circle cx="12" cy="10" r="2.5" /></G>,
    clockTab: <G {...p}><Circle cx="12" cy="12" r="8" /><Path d="M12 8v4l3 2" /></G>,
    homeTab: <G {...p}><Path d="M4 11l8-6 8 6v9H4z" /><Path d="M9 20v-6h6v6" /></G>,
    share: <G {...p}><Circle cx="18" cy="6" r="2.5" /><Circle cx="6" cy="12" r="2.5" /><Circle cx="18" cy="18" r="2.5" /><Path d="M8.2 11l7.6-3.7M8.2 13l7.6 3.7" /></G>,
    trash: <G {...p}><Path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" /></G>,
    apple: <G><Path fill={color} stroke="none" d="M16.4 12.3c0-2 1.6-3 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7c-1.3 0-2.6.8-3.2 2-1.4 2.4-.4 6 1 8 .7 1 1.4 2 2.5 2 1 0 1.3-.6 2.5-.6s1.5.6 2.5.6 1.7-.9 2.4-1.9c.7-1.1 1-2.1 1-2.2-.1 0-1.9-.7-1.9-2.6z" /><Path fill={color} stroke="none" d="M14.4 6.3c.5-.7.9-1.6.8-2.5-.8 0-1.7.5-2.3 1.2-.5.6-.9 1.5-.8 2.4.9.1 1.7-.4 2.3-1.1z" /></G>,
    sync: <G {...p}><Path d="M4 12a8 8 0 0114-5l2 2M20 12a8 8 0 01-14 5l-2-2" /><Path d="M20 4v5h-5M4 20v-5h5" /></G>,
    calendar: <G {...p}><Rect x="4" y="6" width="16" height="14" rx="2.5" /><Path d="M4 10h16M8 4v4M16 4v4" /></G>,
    palette: <G {...p}><Path d="M12 3a9 9 0 100 18c1.4 0 2-1 2-2 0-1.4 1-2 2-2h2a3 3 0 003-3c0-5-4-9-11-9z" /><Circle cx="7.5" cy="11" r="1" fill={color} stroke="none" /><Circle cx="10.5" cy="7.5" r="1" fill={color} stroke="none" /><Circle cx="15" cy="8" r="1" fill={color} stroke="none" /></G>,
    flower: <G {...p}><Circle cx="12" cy="9" r="2.4" /><Path d="M12 6.6c0-2 1-3 2.6-2.6C16 4.4 15.4 6 13.8 7M12 6.6c0-2-1-3-2.6-2.6C8 4.4 8.6 6 10.2 7M14.4 9c2 0 3 1 2.6 2.6C16.6 13 15 12.4 14 10.8M9.6 9c-2 0-3 1-2.6 2.6C7.4 13 9 12.4 10 10.8" /><Path d="M12 11.4V21M12 21c-2 0-4-1-5-3M12 21c2 0 4-1 5-3" /></G>,
    music: <G {...p}><Path d="M9 18V6l10-2v12" /><Circle cx="6.5" cy="18" r="2.5" /><Circle cx="16.5" cy="16" r="2.5" /></G>,
    mug: <G {...p}><Path d="M5 8h12v6a4 4 0 01-4 4H9a4 4 0 01-4-4z" /><Path d="M17 9h2a2.5 2.5 0 010 5h-2" /><Path d="M8 4.5c0 1-1 1.5-1 2.5M11 4.5c0 1-1 1.5-1 2.5" /></G>,
    ruler: <G {...p}><Rect x="3" y="8" width="18" height="8" rx="2" /><Path d="M7 8v3M11 8v4M15 8v3M19 8v4" /></G>,
    alert: <G {...p}><Path d="M12 4l9 15H3z" /><Path d="M12 10v4M12 17h.01" /></G>,
    mountain: <G {...p}><Path d="M3 19l6-11 4 7 2-3 6 7z" /><Path d="M8 10l1-1.6" /></G>,
    moon: <Path {...p} d="M20 13.5A8 8 0 119.5 4 6.5 6.5 0 0020 13.5z" />,
    gift: <G {...p}><Rect x="4" y="9" width="16" height="11" rx="1.5" /><Path d="M4 13h16M12 9v11" /><Path d="M12 9C12 6 10 5 8.5 5.5S7 9 12 9c5 0 4-3 3.5-3.5S12 6 12 9z" /></G>,
    list: <G {...p}><Path d="M8 7h12M8 12h12M8 17h12" /><Circle cx="4" cy="7" r="1" fill={color} stroke="none" /><Circle cx="4" cy="12" r="1" fill={color} stroke="none" /><Circle cx="4" cy="17" r="1" fill={color} stroke="none" /></G>,
    card: <G {...p}><Rect x="3" y="6" width="18" height="12" rx="2.5" /><Path d="M3 10h18M6.5 14.5h4" /></G>,
    receipt: <G {...p}><Path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21z" /><Path d="M9 8h6M9 12h6" /></G>,
    shield: <G {...p}><Path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" /><Path d="M9 12l2 2 4-4" /></G>,
    download: <G {...p}><Path d="M12 4v11M8 11l4 4 4-4" /><Path d="M5 19h14" /></G>,
    chat: <G {...p}><Path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H9l-4 4v-4H6a2 2 0 01-2-2z" /></G>,
    help: <G {...p}><Circle cx="12" cy="12" r="9" /><Path d="M9.2 9.5a2.8 2.8 0 015.4 1c0 2-2.6 2-2.6 3.5" /><Circle cx="12" cy="17.5" r=".6" fill={color} stroke="none" /></G>,
    contrast: <G {...p}><Circle cx="12" cy="12" r="9" /><Path d="M12 3a9 9 0 010 18z" fill={color} stroke="none" /></G>,
    grid: <G {...p}><Rect x="4" y="4" width="7" height="7" rx="2" /><Rect x="13" y="4" width="7" height="7" rx="2" /><Rect x="4" y="13" width="7" height="7" rx="2" /><Rect x="13" y="13" width="7" height="7" rx="2" /></G>,
    door: <G {...p}><Path d="M14 4h3a1 1 0 011 1v14a1 1 0 01-1 1h-3" /><Path d="M14 12H4M7 9l-3 3 3 3" /></G>,
    info: <G {...p}><Circle cx="12" cy="12" r="9" /><Path d="M12 11v5" /><Circle cx="12" cy="8" r=".7" fill={color} stroke="none" /></G>,
    sort: <G {...p}><Path d="M7 4v16M7 4l-3 3M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3" /></G>,
    sun: <G {...p}><Circle cx="12" cy="12" r="4" /><Path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></G>,
    user: <G {...p}><Circle cx="12" cy="8" r="4" /><Path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></G>,
    dots: <G><Circle cx="6" cy="12" r="1.6" fill={color} stroke="none" /><Circle cx="12" cy="12" r="1.6" fill={color} stroke="none" /><Circle cx="18" cy="12" r="1.6" fill={color} stroke="none" /></G>,
    wifi: <G {...p}><Path d="M5 12.55a11 11 0 0114 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0" /><Circle cx="12" cy="20" r="1" fill={color} stroke="none" /></G>,
    wifiOff: <G {...p}><Path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0" /><Circle cx="12" cy="20" r="1" fill={color} stroke="none" /></G>,
    plane2: <Path {...p} d="M5.5 12.5L3 11l1-2 3 .6 4-4c.8-.8 2.2-1.2 2.8-.6.6.6.2 2-.6 2.8l-4 4 .6 3-2 1-1.5-2.5-1.4 2.2-1.8-.2.2-1.8 2.2-1.4z" />,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {icons[name] ?? icons['star']}
    </Svg>
  );
}
