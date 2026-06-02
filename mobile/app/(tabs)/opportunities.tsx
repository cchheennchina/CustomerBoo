import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { fetchOpportunities } from "@/lib/api";
import { GlassCard } from "@/components/GlassCard";
import { StatusBadge } from "@/components/StatusBadge";
import { colors } from "@/lib/theme";

const filters = [
  { key: "", label: "全部" },
  { key: "HEALTHY", label: "健康" },
  { key: "SUBHEALTHY", label: "亚健康" },
  { key: "DANGEROUS", label: "危险" },
];

export default function OpportunitiesScreen() {
  const [status, setStatus] = useState("");
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchOpportunities(status || undefined);
      setItems(res.opportunities);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {filters.map((f) => (
          <Pressable
            key={f.label}
            style={[styles.chip, status === f.key && styles.chipActive]}
            onPress={() => setStatus(f.key)}
          >
            <Text style={[styles.chipText, status === f.key && styles.chipTextActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.purple} />}>
        {loading && items.length === 0 ? (
          <ActivityIndicator color={colors.purple} style={{ marginTop: 40 }} />
        ) : null}
        {items.map((opp) => (
          <Pressable key={String(opp.id)} onPress={() => router.push(`/opportunity/${opp.id}`)}>
            <GlassCard>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{String(opp.name)}</Text>
                  <Text style={styles.sub}>
                    {(opp.customer as { companyName?: string })?.companyName}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <StatusBadge status={String(opp.healthStatus)} />
                  <Text style={styles.score}>{String(opp.healthScore)} 分</Text>
                </View>
              </View>
            </GlassCard>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  filters: { maxHeight: 44, marginBottom: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipActive: { backgroundColor: "rgba(79,209,197,0.15)", borderColor: colors.cyan },
  chipText: { color: colors.muted, fontSize: 13 },
  chipTextActive: { color: colors.cyan },
  row: { flexDirection: "row" },
  title: { color: colors.text, fontWeight: "600" },
  sub: { color: colors.muted, fontSize: 12, marginTop: 4 },
  score: { color: colors.cyan, fontWeight: "700", marginTop: 6 },
});
