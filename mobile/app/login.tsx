import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { login } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { GlassCard } from "@/components/GlassCard";
import { colors } from "@/lib/theme";

export default function LoginScreen() {
  const [username, setUsername] = useState("marketer");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      const res = await login(username.trim(), password);
      await setToken(res.token);
      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof Error ? e.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>客户关系跟进管家</Text>
        <Text style={styles.title}>iOS 移动端登录</Text>
        <GlassCard>
          <Text style={styles.label}>用户名</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={styles.input}
            placeholderTextColor={colors.muted}
          />
          <Text style={styles.label}>密码</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor={colors.muted}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "登录中..." : "登录"}</Text>
          </Pressable>
        </GlassCard>
        <Text style={styles.hint}>演示：marketer / demo123</Text>
        <Text style={styles.hint}>真机请先在本 App「设置」页填写服务器地址</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 24, paddingTop: 80 },
  kicker: { color: colors.muted, fontSize: 12, letterSpacing: 2, marginBottom: 8 },
  title: { color: colors.text, fontSize: 28, fontWeight: "700", marginBottom: 24 },
  label: { color: colors.muted, marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    color: colors.text,
  },
  button: {
    marginTop: 16,
    backgroundColor: colors.purple,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  error: { color: colors.dangerous, marginTop: 10 },
  hint: { color: colors.muted, fontSize: 12, marginTop: 8 },
});
