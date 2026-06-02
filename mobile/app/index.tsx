import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { isLoggedIn } from "@/lib/auth";
import { colors } from "@/lib/theme";

export default function Index() {
  useEffect(() => {
    (async () => {
      if (await isLoggedIn()) router.replace("/(tabs)");
      else router.replace("/login");
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator color={colors.purple} />
    </View>
  );
}
