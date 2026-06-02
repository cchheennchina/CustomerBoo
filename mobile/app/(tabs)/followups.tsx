import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { createRiskPlan, fetchFollowUps } from "@/lib/api";
import { GlassCard } from "@/components/GlassCard";
import { colors } from "@/lib/theme";

export default function FollowUpsScreen() {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchFollowUps>> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchFollowUps());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function handlePlan(riskId: string) {
    try {
      const res = await createRiskPlan(riskId);
      Alert.alert("已创建", res.message);
      load();
    } catch (e) {
      Alert.alert("失败", e instanceof Error ? e.message : "创建失败");
    }
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.purple} />}
    >
      <Text style={styles.section}>条件化提醒</Text>
      {(data?.reminders ?? []).map((r) => (
        <GlassCard key={String(r.id)}>
          <Text style={styles.title}>{String(r.title)}</Text>
          <Text style={styles.sub}>{String(r.message)}</Text>
        </GlassCard>
      ))}

      <Text style={styles.section}>风险预警</Text>
      {(data?.risks ?? []).map((risk) => (
        <GlassCard key={String(risk.id)}>
          <Text style={styles.title}>{String(risk.message)}</Text>
          <Text style={styles.sub}>{String(risk.recommendedAction)}</Text>
          <Pressable style={styles.btn} onPress={() => handlePlan(String(risk.id))}>
            <Text style={styles.btnText}>一键创建应对计划</Text>
          </Pressable>
        </GlassCard>
      ))}

      {loading && !data ? <ActivityIndicator color={colors.purple} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  section: { color: colors.text, fontWeight: "700", fontSize: 16, marginVertical: 8 },
  title: { color: colors.text, fontWeight: "600" },
  sub: { color: colors.muted, marginTop: 6, lineHeight: 20, fontSize: 13 },
  btn: {
    marginTop: 12,
    backgroundColor: "rgba(251,113,133,0.2)",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  btnText: { color: colors.dangerous, fontWeight: "600" },
});
