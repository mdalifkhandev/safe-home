import { TimezoneSelector } from "@/components/timezone-selector";
import {
  formatTimeForZone,
  getDeviceTimeZone,
  getPreviewRows,
  normalizeWidgetSettings,
  type WidgetSettings,
} from "@/lib/timezone-utils";
import {
  loadWidgetSettings,
  saveWidgetSettings,
} from "@/lib/timezone-widget-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DEFAULT_SETTINGS = normalizeWidgetSettings({
  firstTimezone: getDeviceTimeZone(),
  secondTimezone: null,
  use24Hour: false,
  widgetEnabled: true,
});

export default function Index() {
  const [settings, setSettings] = useState<WidgetSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const stored = await loadWidgetSettings();
        if (mounted) {
          setSettings(stored);
        }
      } finally {
        if (mounted) {
          setHydrated(true);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const previewRows = useMemo(() => getPreviewRows(settings), [settings]);

  const persist = async (next: WidgetSettings) => {
    const normalized = normalizeWidgetSettings(next);
    setSettings(normalized);
    setSaving(true);

    try {
      await saveWidgetSettings(normalized);
    } finally {
      setSaving(false);
    }
  };

  const updateFirstTimezone = async (timeZone: string) => {
    await persist({
      ...settings,
      firstTimezone: timeZone,
      secondTimezone:
        settings.secondTimezone === timeZone ? null : settings.secondTimezone,
    });
  };

  const updateSecondTimezone = async (timeZone: string) => {
    await persist({
      ...settings,
      secondTimezone: timeZone === settings.firstTimezone ? null : timeZone,
    });
  };

  const removeSecondTimezone = async () => {
    await persist({
      ...settings,
      secondTimezone: null,
    });
  };

  const toggleFormat = async (use24Hour: boolean) => {
    await persist({
      ...settings,
      use24Hour,
    });
  };

  const addSecondTimezone = async () => {
    const fallbackSecond = "Asia/Tokyo";
    await persist({
      ...settings,
      secondTimezone:
        fallbackSecond === settings.firstTimezone
          ? "Europe/London"
          : fallbackSecond,
    });
  };

  const toggleWidgetEnabled = async () => {
    await persist({
      ...settings,
      widgetEnabled: !settings.widgetEnabled,
    });
  };

  const currentPreviewTime = formatTimeForZone(
    new Date(),
    settings.firstTimezone,
    settings.use24Hour,
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-4 pb-12 pt-4"
      >
        <View className="gap-3 rounded-[32px] border border-white/10 bg-white/5 p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
                Android Widget
              </Text>
              <Text className="mt-2 text-3xl font-bold leading-tight text-white">
                Timezone widget settings
              </Text>
              <Text className="mt-3 text-base leading-6 text-slate-300">
                Choose 1 or 2 timezones. The widget stays minimal and only shows
                the selected rows.
              </Text>
            </View>

            {saving ? (
              <ActivityIndicator color="#67e8f9" />
            ) : (
              <Pressable
                onPress={toggleWidgetEnabled}
                className={`rounded-full border px-3 py-1 ${
                  settings.widgetEnabled
                    ? "border-cyan-400/30 bg-cyan-400/10"
                    : "border-white/15 bg-slate-950/60"
                }`}
              >
                <Text
                  className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                    settings.widgetEnabled ? "text-cyan-200" : "text-slate-300"
                  }`}
                >
                  {settings.widgetEnabled ? "Live" : "Off"}
                </Text>
              </Pressable>
            )}
          </View>

          <View
            className={`rounded-3xl border p-4 ${
              settings.widgetEnabled
                ? "border-emerald-400/20 bg-emerald-400/10"
                : "border-amber-400/20 bg-amber-400/10"
            }`}
          >
            <Text
              className={`text-xs uppercase tracking-[0.3em] ${
                settings.widgetEnabled ? "text-emerald-200" : "text-amber-200"
              }`}
            >
              Widget visibility
            </Text>
            <Text className="mt-2 text-sm leading-6 text-slate-200">
              {settings.widgetEnabled
                ? "Widget is visible on the home screen and will show your selected times."
                : "Widget is hidden from showing times. Turn it back on to display the clock rows again."}
            </Text>
          </View>

          <View className="mt-2 rounded-3xl border border-white/10 bg-slate-950/70 p-4">
            <Text className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Preview data
            </Text>
            {settings.widgetEnabled ? (
              <View className="mt-3 gap-3">
                {previewRows.map((row) => (
                  <View
                    key={row.id}
                    className="flex-row items-center justify-between gap-3"
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-white">
                        {row.label}
                      </Text>
                      <Text className="mt-1 text-xs text-slate-500">
                        {row.id}
                      </Text>
                    </View>
                    <Text className="text-2xl font-semibold tracking-tight text-white">
                      {row.time}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <Text className="text-sm font-semibold text-white">
                  Widget off
                </Text>
                <Text className="mt-1 text-sm text-slate-400">
                  No timezone times will be shown on the home screen until you
                  turn it back on.
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <Text className="text-sm font-semibold text-white">Time format</Text>
          <Text className="mt-1 text-sm text-slate-400">
            Widget time matches the selected format.
          </Text>

          <View className="mt-4 flex-row gap-3">
            <Pressable
              onPress={() => toggleFormat(false)}
              className={`flex-1 rounded-2xl border px-4 py-3 ${
                settings.use24Hour
                  ? "border-white/10 bg-slate-950/60"
                  : "border-cyan-400 bg-cyan-400/10"
              }`}
            >
              <Text className="text-center font-semibold text-white">
                12 hour
              </Text>
            </Pressable>
            <Pressable
              onPress={() => toggleFormat(true)}
              className={`flex-1 rounded-2xl border px-4 py-3 ${
                settings.use24Hour
                  ? "border-cyan-400 bg-cyan-400/10"
                  : "border-white/10 bg-slate-950/60"
              }`}
            >
              <Text className="text-center font-semibold text-white">
                24 hour
              </Text>
            </Pressable>
          </View>
        </View>

        <TimezoneSelector
          title="First timezone"
          helperText={`Required. Current preview time: ${currentPreviewTime}`}
          value={settings.firstTimezone}
          onChange={updateFirstTimezone}
          exclude={settings.secondTimezone ? [settings.secondTimezone] : []}
        />

        {settings.secondTimezone ? (
          <View className="gap-3">
            <TimezoneSelector
              title="Second timezone"
              helperText="Optional. The widget never shows more than 2 rows."
              value={settings.secondTimezone}
              onChange={updateSecondTimezone}
              exclude={[settings.firstTimezone]}
            />

            <Pressable
              onPress={removeSecondTimezone}
              className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3"
            >
              <Text className="text-center font-semibold text-rose-100">
                Remove second timezone
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={addSecondTimezone}
            className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-4"
          >
            <Text className="text-center font-semibold text-cyan-100">
              Add second timezone
            </Text>
            <Text className="mt-1 text-center text-sm text-cyan-200/80">
              Optional companion row for the widget.
            </Text>
          </Pressable>
        )}

        <View className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <Text className="text-sm font-semibold text-white">Widget note</Text>
          <Text className="mt-2 text-sm leading-6 text-slate-300">
            The Android home screen widget reads the saved preferences directly
            from native storage. When you change a timezone here, the widget
            updates automatically. The toggle at the top controls whether the
            widget shows the time rows at all.
          </Text>
          <Text className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-500">
            {hydrated ? "Settings loaded" : "Loading settings"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
