import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native'
import React, { use, useEffect } from 'react'
import { router } from 'expo-router';


const runing = require("@/assets//images/runing.png");

export default function Index() {
  //หน้า Splash Screen หน่วงเวลา 3 วิ เปิดไปหน้า Run
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/run");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={runing} style={styles.imglogo} />
      <Text style={styles.appname}> Run Tracker</Text>
      <Text style={styles.appthainame}>วิ่งเพื่อสุขภาพ</Text>
      <ActivityIndicator  size="large" color="#0000ff" />
    </View>
  )
}

const styles = StyleSheet.create({
  appthainame: {
    fontSize: 18, 
    fontFamily: "Kanit_400Regular",
    marginTop: 20,
    marginBottom: 20,
    color: "#555",
  },
  appname: {
    fontSize: 18, 
    fontFamily: "Kanit_400Regular",
    marginTop: 20,
    color: "#555",
  },
  imglogo: {
    width: 150,
    height: 150,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})