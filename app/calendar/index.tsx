import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Modal, TextInput, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { FadeSlideIn } from '@/components/ui/FadeSlideIn';
import { DateField } from '@/components/ui/DateField';
import { useConnectionCalendar, type CalEvent } from '@/hooks/useConnectionCalendar';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useAuthStore } from '@/stores/auth.store';
import { addEventToPhoneCalendar, addAllToPhoneCalendar } from '@/lib/calendar-sync';

const EVENT_EMOJIS = ['🎂', '🎉', '🎁', '💍', '✈️', '🏠', '🍾', '⭐', '❤️', '🌹', '🍰', '📅'];

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export default function CalendarScreen() {
  const { eventsByDay, upcoming } = useConnectionCalendar();
  const { addEvent, deleteEvent } = useCalendarEvents();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(ymd(today.getFullYear(), today.getMonth(), today.getDate()));

  // â”€â”€ Add-event sheet â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [addOpen, setAddOpen] = useState(false);
  const [evTitle, setEvTitle] = useState('');
  const [evKind, setEvKind] = useState<'birthday' | 'custom'>('birthday');
  const [evEmoji, setEvEmoji] = useState('🎂');
  const [evDate, setEvDate] = useState(ymd(today.getFullYear(), today.getMonth(), today.getDate()));
  const [evYearly, setEvYearly] = useState(true);
  const [saving, setSaving] = useState(false);

  function openAdd(forDay?: string) {
    setEvTitle('');
    setEvKind('birthday');
    setEvEmoji('🎂');
    setEvDate(forDay ?? selectedDay ?? ymd(today.getFullYear(), today.getMonth(), today.getDate()));
    setEvYearly(true);
    setAddOpen(true);
  }

  async function handleAddEvent() {
    const coupleId = useAuthStore.getState().profile?.couple_id;
    if (!coupleId) { Alert.alert('Setting up', 'Your shared space is still loading.'); return; }
    if (!evTitle.trim()) return;
    setSaving(true);
    try {
      await addEvent({
        couple_id: coupleId,
        title: evTitle.trim(),
        event_date: evDate,
        recurring: evYearly,
        emoji: evEmoji,
        kind: evKind,
      });
      setAddOpen(false);
    } catch (e: any) {
      Alert.alert('Could not add', e?.message ?? 'Try again.');
    } finally {
      setSaving(false);
    }
  }

  function confirmDeleteEvent(e: CalEvent) {
    if (!e.sourceId) return;
    Alert.alert(
      `Remove "${e.title}"?`,
      e.recurring ? 'This yearly event will be removed from your calendar.' : 'This event will be removed from your calendar.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deleteEvent(e.sourceId!) },
      ],
    );
  }

  // Build the month grid (Mon-first). Returns array of {day, dateStr} | null.
  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // JS getDay(): 0=Sun. Convert to Mon-first index (0=Mon â€¦ 6=Sun).
    const lead = (first.getDay() + 6) % 7;
    const arr: (null | { day: number; dateStr: string })[] = [];
    for (let i = 0; i < lead; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push({ day: d, dateStr: ymd(viewYear, viewMonth, d) });
    return arr;
  }, [viewYear, viewMonth]);

  const todayStr = ymd(today.getFullYear(), today.getMonth(), today.getDate());
  const selectedEvents = selectedDay ? (eventsByDay[selectedDay] ?? []) : [];

  function shiftMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewMonth(m);
    setViewYear(y);
  }

  function eventDate(e: CalEvent) {
    const d = new Date(e.date + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  function navigateToEvent(e: CalEvent) {
    if (e.kind === 'milestone' && e.sourceId) router.push(`/milestone/${e.sourceId}`);
    else if (e.kind === 'bucket') router.push('/bucket-list');
    else if (e.kind === 'birthday' || e.kind === 'custom') confirmDeleteEvent(e);
  }

  async function syncEvent(e: CalEvent) {
    const res = await addEventToPhoneCalendar(e);
    if (res === 'added') Alert.alert('Added to your calendar ðŸ’›', `"${e.title}" is now on your phone calendar with a reminder the day before.`);
    else if (res === 'denied') Alert.alert('Calendar access needed', 'Enable calendar access for Locket in Settings to add events.');
    else Alert.alert('Could not add', 'Something went wrong adding this event. Please try again.');
  }

  async function syncAll() {
    const res = await addAllToPhoneCalendar(upcoming);
    if (res.denied) Alert.alert('Calendar access needed', 'Enable calendar access for Locket in Settings to add events.');
    else Alert.alert('Synced ðŸ’›', `Added ${res.added} upcoming ${res.added === 1 ? 'event' : 'events'} to your phone calendar.`);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <ScreenHeader
          eyebrow="Our"
          title="Calendar"
          onBack={() => router.back()}
          right={
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <ScalePressable
                onPress={syncAll}
                scaleTo={0.92}
                accessibilityLabel="Add upcoming events to phone calendar"
                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: tint(LK.sky, 0.6), alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon name="calendar" size={20} color={shade(LK.sky, 0.5)} />
              </ScalePressable>
              <ScalePressable
                onPress={() => openAdd()}
                scaleTo={0.92}
                accessibilityLabel="Add an event"
                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: LK.espresso, alignItems: 'center', justifyContent: 'center', ...theme.shadow.sm }}
              >
                <Icon name="plus" size={22} color="#fff" />
              </ScalePressable>
            </View>
          }
        />

        {/* â”€â”€ Month card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <FadeSlideIn delay={60}>
          <View style={{ marginHorizontal: 20, marginTop: 14, backgroundColor: LK.ivory, borderRadius: theme.radii.lg, padding: 16, ...theme.shadow.card }}>
            {/* Month nav */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <ScalePressable onPress={() => shiftMonth(-1)} scaleTo={0.9} accessibilityLabel="Previous month" style={navBtn}>
                <Icon name="chevL" size={20} color={LK.espresso} />
              </ScalePressable>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 19, color: LK.espresso }}>
                {MONTHS[viewMonth]} {viewYear}
              </Text>
              <ScalePressable onPress={() => shiftMonth(1)} scaleTo={0.9} accessibilityLabel="Next month" style={navBtn}>
                <Icon name="chevR" size={20} color={LK.espresso} />
              </ScalePressable>
            </View>

            {/* Weekday header */}
            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
              {WEEKDAYS.map((w, i) => (
                <Text key={i} style={{ flex: 1, textAlign: 'center', fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 11.5, color: LK.ink70 }}>{w}</Text>
              ))}
            </View>

            {/* Day grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {cells.map((cell, i) => {
                if (!cell) return <View key={`e${i}`} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;
                const dayEvents = eventsByDay[cell.dateStr] ?? [];
                const isToday = cell.dateStr === todayStr;
                const isSelected = cell.dateStr === selectedDay;
                return (
                  <ScalePressable
                    key={cell.dateStr}
                    onPress={() => setSelectedDay(cell.dateStr)}
                    scaleTo={0.9}
                    haptic={false}
                    containerStyle={{ width: `${100 / 7}%`, aspectRatio: 1 }}
                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <View style={{
                      width: 36, height: 36, borderRadius: 18,
                      alignItems: 'center', justifyContent: 'center',
                      backgroundColor: isSelected ? LK.espresso : isToday ? LK.coral : 'transparent',
                    }}>
                      <Text style={{
                        fontFamily: theme.fonts.body,
                        fontWeight: isToday || isSelected ? '800' : '600',
                        fontSize: 14.5,
                        color: isSelected ? '#fff' : isToday ? '#fff' : LK.espresso,
                      }}>
                        {cell.day}
                      </Text>
                    </View>
                    {/* Event dots */}
                    <View style={{ flexDirection: 'row', gap: 2, marginTop: 1, height: 5 }}>
                      {dayEvents.slice(0, 3).map((e, j) => (
                        <View key={j} style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: isSelected ? '#fff' : e.color }} />
                      ))}
                    </View>
                  </ScalePressable>
                );
              })}
            </View>
          </View>
        </FadeSlideIn>

        {/* â”€â”€ Selected-day events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {selectedDay && (
          <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 17, color: LK.espresso }}>
                {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Text>
              <ScalePressable
                onPress={() => openAdd(selectedDay)}
                scaleTo={0.94}
                accessibilityLabel="Add event on this day"
                hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(42,33,26,0.06)', borderRadius: 9999, paddingHorizontal: 11, paddingVertical: 7 }}
              >
                <Icon name="plus" size={14} color={LK.ink70} />
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: LK.ink70 }}>Add</Text>
              </ScalePressable>
            </View>
            {selectedEvents.length > 0 ? (
              <View style={{ gap: 8 }}>
                {selectedEvents.map((e) => (
                  <EventRow key={e.id} event={e} dateLabel={null} onPress={() => navigateToEvent(e)} />
                ))}
              </View>
            ) : (
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 13.5, color: LK.ink70, lineHeight: 20 }}>
                Nothing on this day. Tap "Add" to add a birthday or special date.
              </Text>
            )}
          </View>
        )}

        {/* â”€â”€ Upcoming list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 19, color: LK.espresso, marginBottom: 12 }}>Coming up</Text>
          {upcoming.length === 0 ? (
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, color: LK.ink70, lineHeight: 21 }}>
              No upcoming dates yet. Add a milestone or set a target date on a bucket-list item.
            </Text>
          ) : (
            <View style={{ gap: 8 }}>
              {upcoming.map((e) => (
                <EventRow key={e.id} event={e} dateLabel={eventDate(e)} onPress={() => navigateToEvent(e)} onSync={() => syncEvent(e)} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* â”€â”€ Add-event sheet â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {addOpen && (
        <Modal animationType="slide" transparent onRequestClose={() => setAddOpen(false)}>
          <KeyboardAvoidingView behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
            <Pressable style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.4)' }} onPress={() => setAddOpen(false)} accessibilityLabel="Close" />
            <View style={{ backgroundColor: LK.parchment, borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '90%' }}>
              <View style={{ paddingTop: 14, alignItems: 'center' }}>
                <View style={{ width: 38, height: 5, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.15)' }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 12 }}>
                <ScalePressable onPress={() => setAddOpen(false)} haptic={false} accessibilityRole="button" accessibilityLabel="Cancel" style={{ minHeight: 44, justifyContent: 'center', paddingRight: 8 }}>
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15.5, color: LK.ink70 }}>Cancel</Text>
                </ScalePressable>
                <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 18, color: LK.espresso }}>Add an event</Text>
                <ScalePressable
                  onPress={handleAddEvent}
                  disabled={!evTitle.trim() || saving}
                  accessibilityLabel="Save event"
                  style={{ backgroundColor: evTitle.trim() ? LK.espresso : 'rgba(42,33,26,0.15)', borderRadius: 9999, paddingHorizontal: 18, minHeight: 44, justifyContent: 'center' }}
                >
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: evTitle.trim() ? '#fff' : LK.ink70 }}>Save</Text>
                </ScalePressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 40 }}>
                {/* Type toggle */}
                <View style={{ flexDirection: 'row', gap: 9, marginBottom: 16 }}>
                  {([
                    { k: 'birthday', label: 'Birthday',    icon: 'gift' },
                    { k: 'custom',   label: 'Special date', icon: 'star' },
                  ] as const).map(({ k, label, icon }) => {
                    const on = evKind === k;
                    const col = k === 'birthday' ? LK.lilac : LK.coral;
                    return (
                      <ScalePressable
                        key={k}
                        onPress={() => { setEvKind(k); }}
                        scaleTo={0.97}
                        accessibilityLabel={label}
                        containerStyle={{ flex: 1 }}
                        style={{ backgroundColor: on ? tint(col, 0.6) : LK.ivory, borderRadius: 14, borderCurve: 'continuous', paddingVertical: 13, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 7, borderWidth: on ? 2 : 0, borderColor: on ? col : 'transparent', ...theme.shadow.sm }}
                      >
                        <Icon name={icon} size={15} color={on ? shade(col, 0.5) : LK.sepia} />
                        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: on ? shade(col, 0.5) : LK.espresso }}>{label}</Text>
                      </ScalePressable>
                    );
                  })}
                </View>

                <Text style={labelStyle}>{evKind === 'birthday' ? 'Whose birthday?' : 'What is it?'}</Text>
                <TextInput
                  value={evTitle}
                  onChangeText={setEvTitle}
                  placeholder={evKind === 'birthday' ? "e.g. Mom's Birthday" : 'e.g. Our first kiss'}
                  placeholderTextColor={LK.ink70}
                  style={{ backgroundColor: LK.ivory, borderRadius: 16, padding: 14, fontFamily: theme.fonts.body, fontSize: 16, color: LK.espresso, marginBottom: 16, ...theme.shadow.sm }}
                />

                <Text style={labelStyle}>Date</Text>
                <View style={{ marginBottom: 16 }}>
                  <DateField value={evDate} onChange={setEvDate} />
                </View>

                <Text style={labelStyle}>Pick an emoji</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {EVENT_EMOJIS.map((em) => {
                    const on = evEmoji === em;
                    return (
                      <ScalePressable
                        key={em}
                        onPress={() => setEvEmoji(em)}
                        scaleTo={0.9}
                        accessibilityLabel={`Emoji ${em}`}
                        style={{ width: 46, height: 46, borderRadius: 14, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center', backgroundColor: on ? tint(LK.marigold, 0.6) : LK.ivory, borderWidth: on ? 2 : 0, borderColor: on ? LK.marigold : 'transparent', ...theme.shadow.sm }}
                      >
                        <Text style={{ fontSize: 22 }}>{em}</Text>
                      </ScalePressable>
                    );
                  })}
                </View>

                {/* Yearly toggle */}
                <ScalePressable
                  onPress={() => setEvYearly((y) => !y)}
                  scaleTo={0.98}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: evYearly }}
                  accessibilityLabel="Repeats every year"
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: LK.ivory, borderRadius: 16, borderCurve: 'continuous', padding: 16, ...theme.shadow.sm }}
                >
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: LK.espresso }}>Repeats every year</Text>
                    <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70, marginTop: 2 }}>
                      {evYearly ? 'Shows on this date every year (great for birthdays).' : 'A one-time event.'}
                    </Text>
                  </View>
                  <View style={{ width: 50, height: 30, borderRadius: 15, backgroundColor: evYearly ? LK.espresso : 'rgba(42,33,26,0.18)', padding: 3, justifyContent: 'center' }}>
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', alignSelf: evYearly ? 'flex-end' : 'flex-start' }} />
                  </View>
                </ScalePressable>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const labelStyle = {
  fontFamily: theme.fonts.body,
  fontSize: 12,
  fontWeight: '800' as const,
  letterSpacing: 0.8,
  textTransform: 'uppercase' as const,
  color: LK.ink70,
  marginBottom: 9,
};

const navBtn = {
  width: 38, height: 38, borderRadius: 19,
  backgroundColor: 'rgba(42,33,26,0.06)',
  alignItems: 'center' as const, justifyContent: 'center' as const,
};

function EventRow({ event, dateLabel, onPress, onSync }: { event: CalEvent; dateLabel: string | null; onPress: () => void; onSync?: () => void }) {
  return (
    <ScalePressable
      onPress={onPress}
      scaleTo={0.98}
      accessibilityLabel={event.title}
      style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: LK.ivory, borderRadius: theme.radii.sm, borderCurve: 'continuous', overflow: 'hidden', ...theme.shadow.sm }}
    >
      {/* 4px left accent bar per §13.24 spec */}
      <View style={{ width: 4, alignSelf: 'stretch', backgroundColor: event.color }} />
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: tint(event.color, 0.65), alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={event.icon} size={20} color={shade(event.color, 0.5)} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 15.5, color: LK.espresso }}>
            {event.title}
          </Text>
          {dateLabel && (
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.sepia, marginTop: 2 }}>{dateLabel}</Text>
          )}
        </View>
        {event.recurring && (
          <View style={{ backgroundColor: tint(LK.marigold, 0.6), borderRadius: 9999, paddingHorizontal: 9, paddingVertical: 4, flexShrink: 0 }}>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 10.5, color: shade(LK.marigold, 0.5) }}>Yearly</Text>
          </View>
        )}
        {onSync && (
          <ScalePressable
            onPress={onSync}
            scaleTo={0.9}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Add to phone calendar"
            containerStyle={{ flexShrink: 0 }}
            style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: tint(LK.sky, 0.6), alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="plus" size={17} color={shade(LK.sky, 0.5)} />
          </ScalePressable>
        )}
      </View>
    </ScalePressable>
  );
}
