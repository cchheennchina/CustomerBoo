import { useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { fetchOpportunity } from "@/lib/api";
import { GlassCard } from "@/components/GlassCard";
import { StatusBadge } from "@/components/StatusBadge";
import { colors } from "@/lib/theme";

export default function OpportunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchOpportunity>> | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      setLoading(true);
      fetchOpportunity(id)
        .then(setData)
        .finally(() => setLoading(false));
    }, [id])
  );

  if (loading || !data) {
    return <ActivityIndicator color={colors.purple} style={{ flex: 1, marginTop: 80 }} />;
  }

  const opp = data.opportunity as Record<string, unknown>;
  const customer = opp.customer as { companyName?: string; contacts?: Array<{ name?: string }> };

  return (
    <ScrollView style={styles.container}>
      <GlassCard>
        <View style={styles.row}>
          <Text style={styles.title}>{String(opp.name)}</Text>
          <StatusBadge status={String(opp.healthStatus)} />
        </View>
        <Text style={styles.sub}>{customer?.companyName}</Text>
        <Text style={styles.score}>健康分 {String(opp.healthScore)}</Text>
      </GlassCard>

      <GlassCard>
        <Text style={styles.section}>丢分原因</Text>
        {(data.deductions as Array<{ dimension: string; reason: string }>).slice(0, 5).map((d, i) => (
          <Text key={i} style={styles.body}>
            · {d.dimension}：{d.reason}
          </Text>
        ))}
      </GlassCard>

      <GlassCard>
        <Text style={styles.section}>需求摘要</Text>
        <Text style={styles.body}>{String(opp.requirementText || "暂无")}</Text>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: colors.text, fontSize: 18, fontWeight: "700", flex: 1, marginRight: 8 },
  sub: { color: colors.muted, marginTop: 6 },
  score: { color: colors.cyan, fontWeight: "700", marginTop: 10, fontSize: 16 },
  section: { color: colors.text, fontWeight: "600", marginBottom: 8 },
  body: { color: colors.muted, lineHeight: 22, marginBottom: 4 },
});
