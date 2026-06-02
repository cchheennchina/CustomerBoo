import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { fetchDashboard } from "@/lib/api";
import { GlassCard } from "@/components/GlassCard";
import { StatusBadge } from "@/components/StatusBadge";
import { colors } from "@/lib/theme";

export default function DashboardScreen() {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchDashboard>> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchDashboard());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.purple} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.purple} />}
    >
      <GlassCard>
        <Text style={styles.cardTitle}>机会健康度</Text>
        <Text style={styles.score}>{data?.avgScore ?? 0}</Text>
        <Text style={styles.sub}>平均健康分</Text>
        <View style={styles.row}>
          <Text style={styles.statHealthy}>健康 {data?.distribution.healthy ?? 0}</Text>
          <Text style={styles.statSub}>亚健康 {data?.distribution.subhealthy ?? 0}</Text>
          <Text style={styles.statDanger}>危险 {data?.distribution.dangerous ?? 0}</Text>
        </View>
      </GlassCard>

      <GlassCard>
        <Text style={styles.cardTitle}>晨间机会体温图</Text>
        <Text style={styles.body}>{data?.brief.summary}</Text>
      </GlassCard>

      {(data?.brief.priority ?? []).map((item: Record<string, unknown>) => (
        <Pressable
          key={String(item.id)}
          onPress={() => router.push(`/opportunity/${item.id}`)}
        >
          <GlassCard>
            <View style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{String(item.name)}</Text>
                <Text style={styles.sub}>
                  {(item.customer as { companyName?: string })?.companyName}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <StatusBadge status={String(item.healthStatus)} />
                <Text style={styles.scoreSmall}>{String(item.healthScore)} 分</Text>
              </View>
            </View>
          </GlassCard>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  center: { flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "600", marginBottom: 8 },
  score: { color: colors.purple, fontSize: 42, fontWeight: "700" },
  scoreSmall: { color: colors.cyan, marginTop: 6, fontWeight: "600" },
  sub: { color: colors.muted, fontSize: 13, marginTop: 4 },
  body: { color: colors.text, lineHeight: 22, fontSize: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  statHealthy: { color: colors.healthy },
  statSub: { color: colors.subhealthy },
  statDanger: { color: colors.dangerous },
  itemRow: { flexDirection: "row", alignItems: "center" },
  itemTitle: { color: colors.text, fontWeight: "600", fontSize: 15 },
});
