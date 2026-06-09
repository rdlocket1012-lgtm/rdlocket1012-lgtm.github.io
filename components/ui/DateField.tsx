import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LK, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** Controlled date field. `value`/`onChange` use ISO "YYYY-MM-DD". */
export function DateField({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const [open, setOpen] = useState(false);
  const d = new Date(`${value}T00:00:00`);
  const month = d.getMonth();
  const day = d.getDate();
  const year = d.getFullYear();

  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => thisYear + 5 - i); // future-ish to past
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function emit(y: number, m: number, day0: number) {
    const maxDay = new Date(y, m + 1, 0).getDate();
    const safeDay = Math.min(day0, maxDay);
    onChange(`${y}-${pad(m + 1)}-${pad(safeDay)}`);
  }

  function Stepper({ label, onUp, onDown }: { label: string; onUp: () => void; onDown: () => void }) {
    return (
      <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
        <TouchableOpacity
          onPress={onUp}
          hitSlop={{ top: 10, bottom: 10, left: 14, right: 14 }}
          style={{ width: 40, height: 30, borderRadius: 9, backgroundColor: 'rgba(42,33,26,0.06)', alignItems: 'center', justifyContent: 'center' }}
        >
          <View style={{ transform: [{ rotate: '180deg' }] }}><Icon name="chevD" size={16} color={LK.ink70} /></View>
        </TouchableOpacity>
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 16, color: LK.ink, paddingVertical: 4 }}>{label}</Text>
        <TouchableOpacity
          onPress={onDown}
          hitSlop={{ top: 10, bottom: 10, left: 14, right: 14 }}
          style={{ width: 40, height: 30, borderRadius: 9, backgroundColor: 'rgba(42,33,26,0.06)', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="chevD" size={16} color={LK.ink70} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <TouchableOpacity
        onPress={() => setOpen((o) => !o)}
        style={{ backgroundColor: LK.ivory, borderRadius: 16, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...theme.shadow.sm }}
      >
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 16, color: LK.ink }}>
          {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
        <Icon name="calendar" size={18} color={LK.ink70} />
      </TouchableOpacity>

      {open && (
        <View style={{ backgroundColor: LK.ivory, borderRadius: 16, padding: 14, marginTop: 8, flexDirection: 'row', ...theme.shadow.sm }}>
          <Stepper
            label={MONTHS[month].slice(0, 3)}
            onUp={() => emit(year, (month + 11) % 12, day)}
            onDown={() => emit(year, (month + 1) % 12, day)}
          />
          <Stepper
            label={String(day)}
            onUp={() => emit(year, month, day === 1 ? daysInMonth : day - 1)}
            onDown={() => emit(year, month, day >= daysInMonth ? 1 : day + 1)}
          />
          <Stepper
            label={String(year)}
            onUp={() => emit(year + 1, month, day)}
            onDown={() => emit(year - 1, month, day)}
          />
        </View>
      )}
    </View>
  );
}
