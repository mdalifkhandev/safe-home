import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useMemo, useState } from "react";
import { TIME_ZONE_OPTIONS, type TimeZoneOption } from "@/lib/timezone-utils";

type Props = {
  title: string;
  value: string | null;
  onChange: (timeZone: string) => void;
  exclude?: string[];
  helperText?: string;
};

export function TimezoneSelector({
  title,
  value,
  onChange,
  exclude = [],
  helperText,
}: Props) {
  const [query, setQuery] = useState("");

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return TIME_ZONE_OPTIONS.filter((option) => {
      if (exclude.includes(option.id) && option.id !== value) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return option.searchText.includes(normalizedQuery);
    }).slice(0, 120);
  }, [exclude, query, value]);

  return (
    <View className="gap-3 rounded-3xl border border-white/10 bg-white/5 p-4">
      <View className="gap-1">
        <Text className="text-base font-semibold text-white">{title}</Text>
        {helperText ? (
          <Text className="text-sm text-slate-400">{helperText}</Text>
        ) : null}
      </View>

      <TextInput
        className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-base text-white"
        placeholder="Search city or timezone"
        placeholderTextColor="#64748b"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <ScrollView className="max-h-72" nestedScrollEnabled>
        <View className="gap-2">
          {filteredOptions.map((option) => (
            <TimezoneRow
              key={option.id}
              option={option}
              selected={option.id === value}
              onPress={() => onChange(option.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

type RowProps = {
  option: TimeZoneOption;
  selected: boolean;
  onPress: () => void;
};

function TimezoneRow({ option, selected, onPress }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-2xl border px-4 py-3 ${
        selected
          ? "border-cyan-400 bg-cyan-400/10"
          : "border-white/10 bg-slate-950/60"
      }`}
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-medium text-white">
            {option.label}
          </Text>
          <Text className="mt-1 text-xs text-slate-400">{option.id}</Text>
        </View>
        <Text className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
          {selected ? "Selected" : "Tap"}
        </Text>
      </View>
    </Pressable>
  );
}

