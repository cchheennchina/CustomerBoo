import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { clearToken, getApiBaseUrl, setApiBaseUrl } from "@/lib/auth";
import { GlassCard } from "@/components/GlassCard";
import { colors } from "@/lib/theme";

export default function SettingsScreen() {
  const [apiUrl, setApiUrl] = useState("http://127.0.0.1:3000");

  useEffect(() => {
    getApiBaseUrl().then(setApiUrl);
  }, []);

  async function saveUrl() {
    await setApiBaseUrl(apiUrl.trim());
    Alert.alert("已保存", "服务器地址已更新");
  }

  async function logout() {
    await clearToken();
    router.replace("/login");
  }

  return (
    <View style={styles.container}>
      <GlassCard>
        <Text style={styles.title}>服务器地址</Text>
        <Text style={styles.sub}>
          模拟器可用 127.0.0.1；真机请填电脑局域网 IP 或正式域名，如 http://192.168.0.111:3000
        </Text>
        <TextInput
          value={apiUrl}
          onChangeText={setApiUrl}
          autoCapitalize="none"
          style={styles.input}
          placeholderTextColor={colors.muted}
        />
        <Pressable style={styles.btn} onPress={saveUrl}>
          <Text style={styles.btnText}>保存</Text>
        </Pressable>
      </GlassCard>

      <GlassCard>
        <Text style={styles.title}>AI 大模型</Text>
        <Text style={styles.sub}>请在 Web 管理端「设置 → AI 大模型」中配置（admin 账号）</Text>
      </GlassCard>

      <Pressable style={[styles.btn, styles.logout]} onPress={logout}>
        <Text style={styles.btnText}>退出登录</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  title: { color: colors.text, fontWeight: "600", marginBottom: 6 },
  sub: { color: colors.muted, fontSize: 13, lineHeight: 20, marginBottom: 10 },
  input: {
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    color: colors.text,
  },
  btn: {
    marginTop: 12,
    backgroundColor: colors.purple,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  logout: { backgroundColor: "rgba(251,113,133,0.25)", marginTop: 24 },
  btnText: { color: "#fff", fontWeight: "600" },
});
