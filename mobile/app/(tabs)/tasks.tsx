import { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { fetchFollowUps } from "@/lib/api";
import { GlassCard } from "@/components/GlassCard";
import { colors } from "@/lib/theme";

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchFollowUps();
      setTasks(res.tasks);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.purple} />}
    >
      {loading && tasks.length === 0 ? <ActivityIndicator color={colors.purple} /> : null}
      {tasks.map((task) => (
        <GlassCard key={String(task.id)}>
          <Text style={[styles.title, task.completed ? styles.done : null]}>
            {String(task.title)}
          </Text>
          <Text style={styles.sub}>
            {(task.opportunity as { name?: string })?.name ?? "未关联"} · {String(task.source)} ·{" "}
            {String(task.assignee)}
          </Text>
        </GlassCard>
      ))}
      {!loading && tasks.length === 0 ? (
        <Text style={styles.empty}>暂无任务，可在「跟进」页创建风险应对计划</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  title: { color: colors.text, fontWeight: "600" },
  done: { textDecorationLine: "line-through", color: colors.muted },
  sub: { color: colors.muted, fontSize: 12, marginTop: 6 },
  empty: { color: colors.muted, textAlign: "center", marginTop: 40 },
});
