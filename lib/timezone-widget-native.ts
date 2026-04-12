import { NativeModules, Platform } from "react-native";
import { normalizeWidgetSettings, type WidgetSettings } from "./timezone-utils";

type NativeTimezoneWidgetModule = {
  loadSettings: () => Promise<{
    firstTimezone?: string;
    secondTimezone?: string | null;
    use24Hour?: boolean;
    widgetEnabled?: boolean;
  }>;
  saveSettings: (
    firstTimezone: string,
    secondTimezone: string | null,
    use24Hour: boolean,
    widgetEnabled: boolean,
  ) => Promise<void>;
};

const nativeModule =
  NativeModules.TimezoneWidgetModule as NativeTimezoneWidgetModule | undefined;

export async function loadWidgetSettings(): Promise<WidgetSettings> {
  if (!nativeModule || Platform.OS === "web") {
    return normalizeWidgetSettings({});
  }

  const data = await nativeModule.loadSettings();
  return normalizeWidgetSettings({
    firstTimezone: data.firstTimezone,
    secondTimezone: data.secondTimezone ?? null,
    use24Hour: data.use24Hour,
    widgetEnabled: data.widgetEnabled,
  });
}

export async function saveWidgetSettings(settings: WidgetSettings) {
  if (!nativeModule || Platform.OS === "web") {
    return;
  }

  await nativeModule.saveSettings(
    settings.firstTimezone,
    settings.secondTimezone,
    settings.use24Hour,
    settings.widgetEnabled,
  );
}
