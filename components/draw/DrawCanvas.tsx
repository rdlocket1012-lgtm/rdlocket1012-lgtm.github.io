import React, { forwardRef, useRef, useState } from 'react';
import { View, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import { LK } from '@/constants/theme';

export type Stroke = { color: string; width: number; d: string };

interface Props {
  mode: 'draw' | 'watch';
  strokes: Stroke[];
  color?: string;
  brushWidth?: number;
  onStroke?: (stroke: Stroke) => void;
  style?: ViewStyle;
}

function buildPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const { x, y } = points[0];
    return `M ${x.toFixed(1)} ${y.toFixed(1)} l 0.1 0.1`;
  }
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const mx = ((points[i].x + points[i + 1].x) / 2).toFixed(1);
    const my = ((points[i].y + points[i + 1].y) / 2).toFixed(1);
    d += ` Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)} ${mx} ${my}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  return d;
}

// forwardRef so compose screen can pass a ref for PNG capture via react-native-view-shot
export const DrawCanvas = forwardRef<View, Props>(function DrawCanvas(
  { mode, strokes, color = LK.espresso, brushWidth = 5, onStroke, style },
  ref,
) {
  const pts = useRef<Array<{ x: number; y: number }>>([]);
  const [liveStroke, setLiveStroke] = useState<Stroke | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(mode === 'draw')
    .minDistance(0)
    .onBegin((e) => {
      pts.current = [{ x: e.x, y: e.y }];
    })
    .onUpdate((e) => {
      pts.current.push({ x: e.x, y: e.y });
      setLiveStroke({ color, width: brushWidth, d: buildPath(pts.current) });
    })
    .onEnd(() => {
      const d = buildPath(pts.current);
      if (d) onStroke?.({ color, width: brushWidth, d });
      pts.current = [];
      setLiveStroke(null);
    });

  const allStrokes: Stroke[] = liveStroke ? [...strokes, liveStroke] : strokes;

  return (
    <GestureDetector gesture={pan}>
      <View
        ref={ref}
        style={[{ backgroundColor: LK.parchment }, style]}
        onLayout={({ nativeEvent: { layout } }) =>
          setSize({ w: layout.width, h: layout.height })
        }
      >
        {size.w > 0 && (
          <Svg
            width={size.w}
            height={size.h}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {allStrokes.map((s, i) => (
              <Path
                key={i}
                d={s.d}
                stroke={s.color}
                strokeWidth={s.width}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </Svg>
        )}
      </View>
    </GestureDetector>
  );
});
