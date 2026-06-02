import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";

const map: Record<string, { bg: string; fg: string; label: string }> = {
  HEALTHY: { bg: "rgba(52,211,153,0.2)", fg: colors.healthy, label: "健康" },
  SUBHEALTHY: { bg: "rgba(251,191,36,0.2)", fg: colors.subhealthy, label: "亚健康" },
  DANGEROUS: { bg: "rgba(251,113,133,0.2)", fg: colors.dangerous, label: "危险" },
};

export function StatusBadge({ status }: { status: string }) {
  const item = map[status] ?? { bg: colors.card, fg: colors.muted, label: status };
  return (
    <View style={[styles.badge, { backgroundColor: item.bg }]}>
      <Text style={[styles.text, { color: item.fg }]}>{item.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: { fontSize: 12, fontWeight: "600" },
});
