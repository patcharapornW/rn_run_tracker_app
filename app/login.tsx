import { supabase } from "@/service/supabase";
import { makeRedirectUri } from "expo-auth-session";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as QueryString from "query-string";
import React, { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
const runing = require("@/assets/images/runing.png");

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ฟังก์ชันเข้าสู่ระบบด้วย Email ปกติ
  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    // ตัวอย่างการข้ามไปหน้า run (คุณสามารถเพิ่มโค้ด Login ของ Supabase แบบ Email ได้ที่นี่)
    router.replace("/run");
  };

  // ฟังก์ชันเข้าสู่ระบบด้วย Google + Supabase
  const handleGoogleSignIn = async () => {
    try {
      const redirectUri = makeRedirectUri({
        scheme: "rnruntrackerapp",
      });
      console.log(redirectUri);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error) console.log("Error:", error.message);

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri,
        );

        if (result.type === "success") {
          const { url } = result;
          const params = url.split("#")[1];
          const formData = QueryString.parse(params);
          const access_token = formData.access_token as string;
          const refresh_token = formData.refresh_token as string;

          if (access_token && refresh_token) {
            const { data: sessionData, error: sessionError } =
              await supabase.auth.setSession({
                access_token,
                refresh_token,
              });

            if (sessionError) throw sessionError;
            const {
              data: { user },
            } = await supabase.auth.getUser();

            if (user) {
              router.replace({
                pathname: "/run",
                params: { uid: user.id },
              });
            }
          }
        }
      }
    } catch (error) {
      console.log("Error details:", error);
      Alert.alert(
        "เกิดข้อผิดพลาด",
        "ไม่สามารถเข้าสู่ระบบด้วย Google ได้ กรุณาลองอีกครั้ง",
      );
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.formContainer}>
        {/* โลโก้และชื่อแอป */}
        <Image source={runing} style={styles.imglogo} />
        <Text style={styles.title}>เข้าสู่ระบบ</Text>
        <Text style={styles.subtitle}>Run Tracker วิ่งเพื่อสุขภาพ</Text>

        {/* ช่องกรอกข้อมูล */}
        <TextInput
          style={styles.input}
          placeholder="อีเมล"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="รหัสผ่าน"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* ปุ่มเข้าสู่ระบบแบบปกติ */}
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginBtnText}>เข้าสู่ระบบ</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>- หรือ -</Text>

        {/* ปุ่ม Google Sign-In */}
        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn}>
          <Text style={styles.googleBtnText}>Sign in with Google</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  imglogo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: "Kanit_700Bold",
    color: "#ff88cd", // สีชมพูเดียวกับ Header
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Kanit_400Regular",
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E4E7EB",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: "Kanit_400Regular",
    color: "#333",
  },
  loginBtn: {
    backgroundColor: "#ff88cd",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  loginBtnText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Kanit_700Bold",
  },
  orText: {
    textAlign: "center",
    color: "#999",
    fontFamily: "Kanit_400Regular",
    marginVertical: 20,
  },
  googleBtn: {
    backgroundColor: "#4285F4",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  googleBtnText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Kanit_700Bold",
  },
});
