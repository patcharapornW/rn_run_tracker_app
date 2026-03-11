import { supabase } from '@/service/supabase';
import { Ionicons } from '@expo/vector-icons';
import { decode } from "base64-arraybuffer";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Add() {
    const router = useRouter();

    //สร้าง state สำหรับเก็บข้อมูลที่กรอกในฟอร์ม
    const [location, setLocation] = useState("");
    const [distance, setDistance] = useState("");
    const [timeOfDay, setTimeOfDay] = useState("เช้า");
    const [image, setImage] = useState<string | null>(null);
    const [base64Image, setBase64Image] = useState<string | null>(null);


    //ฟังก์ฃันเปิดกล้องถ่ายภาพ
    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('ขออนุญาตเข้าถึงกล้องนห่อยนะค๊า >-<');
            return;
        }

        //เปิดกล้องเพื่อถ่ายภาพ
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        //หลังจากถ่ายเรียบร้อยแล้ว เอาไปเก็บ state ที่เตรียมไว้
        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setBase64Image(result.assets[0].base64 || null);
        }
    };

    const handleSaveToSupabase = async () => {
        //Validate location , distance, image (ตรวจสอบข้อมูลว่ากรอกหรือไม่)
        if (!location || !distance || !image) {
            Alert.alert("คำเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        //อัปโหลดรูปไปยัง Bucket -> Storage -> Supabase
        //ตัวแปรกับ url กับรูปที่โหลด
        let image_url = null;
        const fileName = `img_${Date.now()}.jpg`; //ตั้งชื่อไฟล์ที่จะอัปโหลด
        const { error: uploadError } = await supabase.storage
            .from("run_bk")
            .upload(fileName, decode(base64Image!), {
                contentType: "image/jpeg",
            });

        //เอา url ของรูปที่ storage
        image_url = await supabase.storage
            .from("run_bk")
            .getPublicUrl(fileName)
            .data.publicUrl;


        //บันทึกข้อมูลไปยัง Table -> Database -> Supabase
        const {error: insertError} = await supabase.from("runs").insert([
            {
                location: location,
                distance: distance,
                time_of_day: timeOfDay,
                run_date: new Date().toISOString().split("T")[0], //เอาแค่ปีเดือนวัน ไม่เอา เวลา
                image_url: image_url,
            },
        ]);

        if (insertError){
            Alert.alert("คำเตือน", "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
            return;
         }

        //บันทึกเรียบร้อยแสดงข้อความแจ้ง และเปิดกลับไปยังหน้า /run
        Alert.alert("สำเร็จ", "บันทึกข้อมูลเรียบร้อย");
        router.back()
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>

                { /* ป้อนสถานที่*/}
                <Text style={styles.titleShow}>สถานที่วิ่ง</Text>
                <TextInput style={styles.inputValue} placeholder="เช่น สวนลุมพินี" value={location} onChangeText={setLocation} />

                { /* ป้อนระยะทาง*/}
                <Text style={styles.titleShow}>ระยะทาง (กิโลเมตร)</Text>
                <TextInput style={styles.inputValue} placeholder="เช่น 5.5" keyboardType="numeric" value={distance} onChangeText={setDistance} />

                { /* ปุ่มเลือกช่วงเวลา ถ้าเลือกเป็นสี ไม่เลือกเป็นสีเทา*/}
                <Text style={styles.titleShow}>ช่วงเวลา</Text>
                <View style={{ flexDirection: "row", marginBottom: 20 }}>
                    <TouchableOpacity onPress={() => setTimeOfDay("เช้า")}
                        style={[styles.todBtn, { backgroundColor: timeOfDay === "เช้า" ? "#ff88cd" : "#dbdbdda9" }]}
                    >
                        <Text style={{ fontFamily: "Kanit_400Regular", color: "white" }}>เช้า</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setTimeOfDay("เย็น")}
                        style={[styles.todBtn, { backgroundColor: timeOfDay === "เย็น" ? "#ff88cd" : "#dbdbdda9" }]}
                    >
                        <Text style={{ fontFamily: "Kanit_400Regular", color: "white" }}>เย็น</Text>
                    </TouchableOpacity>
                </View>

                { /* ปุ่มเปิดกล้อง*/}
                <Text style={styles.titleShow}>รูปภาพสถานที่</Text>
                <TouchableOpacity onPress={handleTakePhoto} style={styles.takePhotoBtn}>
                    {
                        image
                            ? (
                                <Image source={{ uri: image }} style={{ width: "100%", height: 200 }} />
                            )
                            : (
                                <View style={{ alignItems: "center" }}>
                                    <Ionicons name="camera" size={30} color="#b9b9b9" />
                                    <Text style={{ fontFamily: "Kanit_400Regular", color: "#b9b9b9" }}>
                                        กดเพื่อถ่ายภาพ
                                    </Text>
                                </View>
                            )
                    }

                </TouchableOpacity>

                {/* ปุ่มบันทึก */}
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveToSupabase}>
                    <Text style={{ fontFamily: "Kanit_700Bold", color: "white" }}>
                        บันทึกข้อมูล
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    todBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        marginRight: 10
    },
    saveBtn: {
        backgroundColor: "#ff88cd",
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        alignItems: "center",
    },
    takePhotoBtn: {
        backgroundColor: "#dbdbdda9",
        height: 200,
        width: "100%",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    inputValue: {
        borderWidth: 1,
        borderColor: "#ccc",
        fontFamily: "Kanit_400Regular",
        padding: 10,
        marginBottom: 20,
        borderRadius: 5,
        backgroundColor: "#fff",
    },
    titleShow: {
        fontFamily: "Kanit_700Bold",
        marginBottom: 10,

    }
})