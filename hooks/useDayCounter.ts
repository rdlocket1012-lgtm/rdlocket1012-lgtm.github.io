import { useState, useEffect } from 'react';
import { daysTogether } from '@/utils/date';

export function useDayCounter(startDate: string | null): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startDate) return;
    setCount(daysTogether(new Date(startDate)));
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const ms = midnight.getTime() - Date.now();
    const t = setTimeout(() => setCount(daysTogether(new Date(startDate))), ms);
    return () => clearTimeout(t);
  }, [startDate]);

  return count;
}
