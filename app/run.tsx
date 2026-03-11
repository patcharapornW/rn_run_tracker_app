import { supabase } from '@/service/supabase';
import { Runtype } from '@/types/runtype';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const runing = require("@/assets//images/runing.png");


export default function Run() {
  //สร้าง state เก็บข้อมูลที่ดึงมาจาก supabase
  const [runs, setRuns] = useState<Runtype[]>([]);

  //สร้างฟังก์ชัน ดึงข้อมูลรายการวิ่งจาก supabse
  const fetchRuns = async () => {
    //ดึงข้อมูลจาก supabase
    const { data, error } = await supabase.from("runs").select("*");
    //ตรวจสอบ error
    if (error) {
      Alert.alert("คำเตือน", "ไม่สามารถดึงข้อมูลรายการวิ่งได้ กรุณาลองใหม่อีกครั้ง ");
      return;
    }
    //กำหนดข้อมูลที่ดึงให้กับ state
    setRuns(data as Runtype[]);
  };

  //เรียกใช้ฟังก์ชันดึงข้อมูล
  useFocusEffect(
    useCallback(() => {
      fetchRuns();
    }, [])
  );

  //สร้างฟังก์ชันแสดงหน้าตาของแต่ละรายการที่ flatlist
  const renderItem = ({ item }: { item: Runtype }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.cardImage}
        />
        <View style={styles.distanceBadge}>
          <Text style={styles.locationText}>{item.location}</Text>
          <Text style={styles.dateText}>
            {(() => {
              const date = new Date(item.run_date);
              const buddhistYear = 'พ.ศ. ' + (date.getFullYear() + 543) ;
              return new Intl.DateTimeFormat('th-TH', {
                month: 'long',
                day: 'numeric',
              }).format(date) + ' ' + buddhistYear;
            })()}
          </Text>
        </View>
        <Text style={styles.distanceText}>{item.distance} km</Text>
      </View>
 
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      {/* ส่วนแสดงรูป ด้านบนสุด */}
      <Image source={runing} style={styles.imglogo} />

      {/* ส่วนแสดงข้อมูลรายการว่างที่ดึงมาจาก SUPABASE*/}
      <FlatList
        data={runs}
        renderItem={(renderItem)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
      />

      {/* ส่วนแสดงปุ่มเปิดไปหน้า /add */}
      <TouchableOpacity
        style={styles.floatingBtn}
        onPress={() => router.push("/add")}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  listPadding: {
    padding: 20,
    paddingBottom: 100, // เว้นที่ให้ FAB
  },
  distanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
locationText: {
    fontFamily: 'Kanit_700Bold',
    fontSize: 18,
    color: '#333',
    marginBottom: 4,
  },
dateText: {
    fontFamily: 'Kanit_400Regular',
    fontSize: 14,
    color: '#888',
  },
distanceText: {
    fontFamily: 'Kanit_700Bold',
    fontSize: 14,
    color: '#007AFF',
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 10,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    // Shadow สำหรับ iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Elevation สำหรับ Android
    elevation: 3,
  },
  cardItem: {
    flex: 1,
    flexDirection: "row",
    margin: 5,
    width: "100%",
    padding: 10, 
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
  },
  imgShow: {
    width: 50,
    height: 50,
  },
  imglogo: {
    width: 120,
    height: 120,
    marginTop: 40,
    margin: "auto",
  

  },
  floatingBtn: {
    padding: 10,
    backgroundColor: "#ff88cd",
    width: 60,
    height: 60,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 60,
    right: 50,
    elevation: 5,
  },
  container: {
    flex: 1,
  },
  text: {
    fontSize: 24,
    fontFamily: "Kanit_700Bold",
    color: "#555",
  }
})