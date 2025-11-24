// Home.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

export default function Home() {
  const [boardImage, setBoardImage] = useState(null);
  const [completedItems, setCompletedItems] = useState({});
  const [stars, setStars] = useState({});
  const [timers, setTimers] = useState({});
  const [tipModalVisible, setTipModalVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState("");
  const timerIntervalRef = useRef(null);

  const tips = [
    "Drink water first thing in the morning!",
    "Try a quick stretch to energize your day.",
    "Get productive with your time.",
    "Take deep breaths for 5 minutes to relax.",
    "Small steps create big change ✨",
    "Your brain needs enough rest.",
    "Improve your eating habits",
  ];

  const challenges = [
    { id: "c1", title: "21-Day Hydration Challenge", type: "checklist", total: 21, subtitle: "Drink water every day" },
    { id: "c2", title: "7-Day Morning Stretch", type: "checklist", total: 7, subtitle: "Quick 10-minute stretch" },
    { id: "c3", title: "1 Hr No Screen Time", type: "timer", duration: 3600, total: 1, subtitle: "No phone for 1 hour" },
    { id: "c4", title: "30-Min Meditation", type: "timer", duration: 1800, total: 1, subtitle: "Focus on your breathing" },
    { id: "c5", title: "365-Day Skincare Glow", type: "checklist", total: 365, subtitle: "Morning + night routine" },
    {id: "c6", title:"8-Hrs Sleep Time", type:"timer", duration: 28800,total:1,subtitle: "Get enough sleep"},
    { id: "c7", title: "5-Day Healthy Breakfast", type: "checklist", total: 5, subtitle: "Start the day with a healthy meal" },
  ];

  const KEY_COMPLETED = "glow_completed";
  const KEY_STARS = "glow_stars";
  const KEY_TIMERS = "glow_timers";
  const KEY_BOARD_IMG = "glow_board_image";

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      let changed = false;
      const newTimers = { ...timers };
      const newStars = { ...stars };
      const newCompleted = { ...completedItems };

      Object.keys(newTimers).forEach((k) => {
        const t = newTimers[k];
        if (t && t.endTime <= now) {
          newStars[k] = true;
          newCompleted[k] = newCompleted[k] || [];
          if (!newCompleted[k].includes("__timer_done")) {
            newCompleted[k].push("__timer_done");
          }
          delete newTimers[k];
          changed = true;
        }
      });

      if (changed) {
        setTimers(newTimers);
        setStars(newStars);
        setCompletedItems(newCompleted);
        persist(newTimers, newStars, newCompleted, null);
      }
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [timers, stars, completedItems]);

  const loadAll = async () => {
    try {
      const [sCompleted, sStars, sTimers, sImg] = await Promise.all([
        AsyncStorage.getItem(KEY_COMPLETED),
        AsyncStorage.getItem(KEY_STARS),
        AsyncStorage.getItem(KEY_TIMERS),
        AsyncStorage.getItem(KEY_BOARD_IMG),
      ]);
      if (sCompleted) setCompletedItems(JSON.parse(sCompleted));
      if (sStars) setStars(JSON.parse(sStars));
      if (sTimers) setTimers(JSON.parse(sTimers));
      if (sImg) setBoardImage(sImg);
    } catch (e) {
      console.log("Load error:", e);
    }
  };

  const persist = async (timersToSave, starsToSave, completedToSave, boardImageToSave) => {
    try {
      if (completedToSave) await AsyncStorage.setItem(KEY_COMPLETED, JSON.stringify(completedToSave));
      if (starsToSave) await AsyncStorage.setItem(KEY_STARS, JSON.stringify(starsToSave));
      if (timersToSave) await AsyncStorage.setItem(KEY_TIMERS, JSON.stringify(timersToSave));
      if (boardImageToSave !== null) {
        await AsyncStorage.setItem(KEY_BOARD_IMG, boardImageToSave || "");
      }
    } catch (e) {
      console.log("Persist error:", e);
    }
  };

  const toggleChecklist = (challenge, index) => {
    const id = challenge.id;
    const list = completedItems[id] ? [...completedItems[id]] : [];
    const pos = list.indexOf(index);
    if (pos === -1) list.push(index);
    else list.splice(pos, 1);

    const clean = Array.from(new Set(list)).sort((a, b) => a - b);
    const updated = { ...completedItems, [id]: clean };

    const doneCount = clean.length;
    const newStars = { ...stars, [id]: doneCount >= challenge.total ? true : false };

    setCompletedItems(updated);
    setStars(newStars);
    persist(timers, newStars, updated, null);
  };

  const startTimer = (challenge) => {
    const id = challenge.id;
    const endTime = Date.now() + (challenge.duration || 60) * 1000;
    const newTimers = { ...timers, [id]: { endTime } };
    setTimers(newTimers);
    persist(newTimers, stars, completedItems, null);
    Alert.alert("Timer started", `${challenge.title} timer started`);
  };

  const resetChallenge = (challenge) => {
    const id = challenge.id;
    const newCompleted = { ...completedItems };
    delete newCompleted[id];
    const newStars = { ...stars };
    delete newStars[id];
    const newTimers = { ...timers };
    delete newTimers[id];

    setCompletedItems(newCompleted);
    setStars(newStars);
    setTimers(newTimers);
    persist(newTimers, newStars, newCompleted, null);
    Alert.alert("Reset", `${challenge.title} has been reset`);
  };

  const pickImage = async () => {
    try {
      const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!res.granted) {
        Alert.alert("Permission required", "Please allow photo access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setBoardImage(uri);
        await AsyncStorage.setItem(KEY_BOARD_IMG, uri);
      }
    } catch (e) {
      console.log("Image pick error:", e);
    }
  };

  const removeBoardImage = async () => {
    setBoardImage(null);
    await AsyncStorage.removeItem(KEY_BOARD_IMG);
  };

  const getSecondsLeft = (id) => {
    if (!timers[id]) return 0;
    return Math.max(0, Math.floor((timers[id].endTime - Date.now()) / 1000));
  };

  const showTip = () => {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setCurrentTip(randomTip);
    setTipModalVisible(true);
  };

  const renderChallenge = ({ item }) => {
    const id = item.id;
    const checkedList = completedItems[id] || [];
    const doneCount = checkedList.length;
    const percent = Math.min(100, Math.round((doneCount / item.total) * 100));
    const isFull = stars[id] || doneCount >= item.total;

    return (
      <View style={[styles.card, isFull && styles.cardComplete]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.challengeTitle}>{item.title}</Text>
            <Text style={styles.challengeSubtitle}>{item.subtitle}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.star, isFull && styles.starFilled]}>{isFull ? "★" : "☆"}</Text>
            <Text style={styles.percentText}>{percent}%</Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>

        {item.type === "checklist" && (
          <View style={styles.checklistWrap}>
            <View style={styles.checkRow}>
              {Array.from({ length: item.total }).map((_, idx) => {
                const checked = checkedList.includes(idx);
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.checkItem, checked && styles.checkItemChecked]}
                    onPress={() => toggleChecklist(item, idx)}
                  >
                    <Text style={[styles.checkText, checked && styles.checkTextChecked]}>
                      {checked ? "✔" : idx + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {item.type === "timer" && (
          <View style={styles.timerRow}>
            {!timers[id] && !isFull && (
              <TouchableOpacity style={styles.btnPrimary} onPress={() => startTimer(item)}>
                <Text style={styles.btnPrimaryText}>Start {Math.round(item.duration / 60)}m</Text>
              </TouchableOpacity>
            )}
            {timers[id] && <Text style={styles.timerText}>Time left: {getSecondsLeft(id)}s</Text>}
            {isFull && <Text style={styles.timerCompleteText}>Completed ✔</Text>}
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.progressLabel}>
            {doneCount} / {item.total} {item.type === "checklist" ? "done" : "sessions"}
          </Text>
          <View style={styles.footerButtons}>
            <TouchableOpacity style={styles.smallBtn} onPress={() => resetChallenge(item)}>
              <Text style={styles.smallBtnText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.smallBtn, styles.smallBtnAlt]} onPress={showTip}>
              <Text style={[styles.smallBtnText, styles.smallBtnAltText]}>Tip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // ----------------- Header for FlatList -----------------
  const renderListHeader = () => (
    <View style={{ marginBottom: 12 }}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.appTitle}>GlowApp</Text>
          <Text style={styles.appSub}>Daily glow checklist ✨</Text>
        </View>
        <View style={styles.topRight}>
          <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
            <Text style={styles.imageBtnText}>+ Image</Text>
          </TouchableOpacity>
          {boardImage && (
            <TouchableOpacity style={styles.removeImageBtn} onPress={removeBoardImage}>
              <Text style={styles.removeImageText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {boardImage ? (
        <Image source={{ uri: boardImage }} style={styles.boardImage} />
      ) : (
        <View style={styles.boardPlaceholder}>
          <Text style={styles.boardPlaceholderText}>Add a circular background image!</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={challenges}
        keyExtractor={(i) => i.id}
        renderItem={renderChallenge}
        contentContainerStyle={{ paddingBottom: 80 }}
        style={{ width: "100%" }}
        ListHeaderComponent={renderListHeader} // <--- moved header here
      />

      {/* Tip Modal */}
      <Modal
        visible={tipModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTipModalVisible(false)}
      >
        <View style={{flex:1, justifyContent:"center", alignItems:"center", backgroundColor:"rgba(0,0,0,0.5)"}}>
          <View style={{backgroundColor:"#fff", padding:20, borderRadius:12, maxWidth:"80%"}}>
            <Text style={{fontSize:16, fontWeight:"600", marginBottom:12}}>{currentTip}</Text>
            <Pressable onPress={() => setTipModalVisible(false)} style={{alignSelf:"flex-end"}}>
              <Text style={{color:"#ff3a7a", fontWeight:"700"}}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ----------------- STYLES -----------------
const LIGHT_PINK_BG = "#fff5f7";
const LIGHT_PINK_CARD = "#ffe6ed";
const ACCENT = "#ff66a3";
const ACCENT_DARK = "#ff3a7a";
const TEXT = "#2b2b2b";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LIGHT_PINK_BG, padding: 16, alignItems: "center" },
  topRow: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  appTitle: { fontSize: 24, fontWeight: "800", color: ACCENT_DARK },
  appSub: { color: TEXT, marginTop: 2, opacity: 0.7 },
  topRight: { flexDirection: "row", alignItems: "center" },
  imageBtn: { backgroundColor: ACCENT, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginLeft: 8 },
  imageBtnText: { color: "#fff", fontWeight: "700" },
  removeImageBtn: { marginLeft: 8, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 50, backgroundColor: LIGHT_PINK_CARD, borderWidth: 1, borderColor: ACCENT },
  removeImageText: { color: ACCENT_DARK, fontWeight: "700" },

  boardImage: { width: 140, height: 140, borderRadius: 70, marginBottom: 12, alignSelf: "center", borderWidth: 3, borderColor: ACCENT },
  boardPlaceholder: { width: 140, height: 140, borderRadius: 70, marginBottom: 12, backgroundColor: "#ffeef6", justifyContent: "center", alignItems: "center", borderStyle: "dashed", borderWidth: 2, borderColor: "#ffd6e8", padding: 12 },
  boardPlaceholderText: { textAlign: "center", color: "#b24b7a", fontWeight: "600" },

  card: { width: "100%", backgroundColor: LIGHT_PINK_CARD, padding: 12, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: "#ffd6e8" },
  cardComplete: { borderColor: "#ffd1e8", backgroundColor: "#fff7fb" },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  challengeTitle: { fontSize: 16, fontWeight: "800", color: ACCENT_DARK },
  challengeSubtitle: { fontSize: 12, color: TEXT, opacity: 0.65, marginTop: 4 },
  headerRight: { alignItems: "flex-end", marginLeft: 10 },
  star: { fontSize: 20, color: "#ffdede" },
  starFilled: { color: "#ffbf00" },
  percentText: { marginTop: 6, fontWeight: "700", color: TEXT },

  progressBar: { width: "100%", height: 8, backgroundColor: "#ffe0ee", borderRadius: 8, overflow: "hidden", marginVertical: 10 },
  progressFill: { height: "100%", backgroundColor: ACCENT },

  checklistWrap: { marginTop: 6 },
  checkRow: { flexDirection: "row", flexWrap: "wrap" },
  checkItem: { width: 44, height: 44, borderRadius: 10, backgroundColor: "#fff", margin: 6, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#ffd6e8" },
  checkItemChecked: { backgroundColor: ACCENT, borderColor: ACCENT_DARK },
  checkText: { color: ACCENT_DARK, fontWeight: "700" },
  checkTextChecked: { color: "#fff" },

  timerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 },
  btnPrimary: { backgroundColor: ACCENT, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  btnPrimaryText: { color: "#fff", fontWeight: "700" },
  timerText: { fontWeight: "700", color: TEXT },
  timerCompleteText: { color: ACCENT_DARK, fontWeight: "800" },

  cardFooter: { marginTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressLabel: { color: TEXT, opacity: 0.8, fontWeight: "600" },
  footerButtons: { flexDirection: "row" },
  smallBtn: { backgroundColor: "#fff", paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, borderColor: "#ffd6e8", marginLeft: 8 },
  smallBtnText: { color: ACCENT_DARK, fontWeight: "700" },
  smallBtnAlt: { backgroundColor: "transparent", borderColor: "transparent" },
  smallBtnAltText: { color: ACCENT_DARK },
});