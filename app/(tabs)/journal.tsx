import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";



const SAMPLE_IMAGE_URI = "file:///mnt/data/A_pair_of_digital_screenshots_displays_the_user_in.png";

const MONTHLY_WORDS = [
  "Gratitude","Self-care","Healing","Joy","Discipline","Love","Focus","Peace","Courage","Confidence",
  "Growth","Calm","Happiness","Energy","Strength","Acceptance","Learning","Clarity","Hope","Reflection"
];
const AFFIRMATIONS = [
  "I am glowing and growing.",
  "I deserve peace and rest.",
  "I attract good things into my life.",
  "I am enough, exactly as I am.",
  "I trust my journey.",
  "My potential is limitless.",
  "I choose joy today.",
  "I am grateful for the small things.",
  "I am calm, centered, and capable.",
  "I learn and improve every day.",
  "I embrace growth and change.",
  "I give myself permission to heal.",
  "I welcome abundance into my life.",
  "I am proud of how far I’ve come.",
  "I radiate kindness and compassion.",
  "I make space for what matters.",
  "I forgive myself and move forward.",
  "I celebrate my small wins.",
  "I am creative and resourceful.",
  "I find balance in my day."
];

const REFLECTION_QUESTIONS = [
  "What challenged you today?",
  "What made you smile today?",
  "What would make tomorrow better?",
  "Who made your day easier today?",
  "What are you most grateful for?"
];


type Entry = {
  id: string;
  date: string;
  text: string;
  favorite?: boolean;
  mood?: string | null;
  tags?: string[] | null;
};


export default function JournalScreen(){
  const [text, setText] = useState("");

  const [mood, setMood] = useState<string | null>(null);

  const [tags, setTags] = useState<string[]>([]);

  const [entries, setEntries] = useState<Entry[]>(() => [
    { id: "e1", date: new Date().toDateString(), text: "I felt proud today after finishing a task." },
    { id: "e2", date: new Date(Date.now() - 86400000).toDateString(), text: "Small wins — made time for self-care." }
  ]);

  const [reminderOn, setReminderOn] = useState(false);

  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  const favoriteEntries = entries.filter(e => e.favorite);

  const [affirmation, setAffirmation] = useState<string>("");

  const MAX_WORDS = 7;


  useEffect(() => {
    const dayIndex = new Date().getDate() % AFFIRMATIONS.length;
    setAffirmation(AFFIRMATIONS[dayIndex]);
  }, []);


  function saveEntry() {
    if (!text.trim()) {
      Alert.alert("Please write something before saving.");
      return;
    }

    const newEntry: Entry = {
      id: Math.random().toString(36).slice(2),
      date: new Date().toDateString(),
      text: text.trim(),
      favorite: false,
      mood,
      tags: tags.length ? [...tags] : undefined
    };

    setEntries(prev => [newEntry, ...prev]);
    setText("");
    setMood(null);
    setTags([]);

    Alert.alert("Saved", "Your reflection was saved for today.");
  }

  function toggleFavorite(id: string) {
    setEntries(prev => prev.map(e => (e.id === id ? { ...e, favorite: !e.favorite } : e)));
  }

  function toggleTag(t: string) {
    setTags(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));
  }

  function pickReflectionQuestion(q: string) {
    setText(prev => (prev.trim() ? `${prev}\n\n${q}` : q));
  }

  function toggleReminder() {
    setReminderOn(r => !r);
    Alert.alert("Reminder", !reminderOn ? "Daily reminder turned ON (UI only)." : "Daily reminder turned OFF.");
  }

  function toggleWord(word: string) {
    if (selectedWords.includes(word)) {
      setSelectedWords(prev => prev.filter(w => w !== word));
      return;
    }
    if (selectedWords.length >= MAX_WORDS) {
      Alert.alert("Limit reached", `You can only select up to ${MAX_WORDS} words.`);
      return;
    }
    setSelectedWords(prev => [...prev, word]);
  }


  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Hi, Emma ✿</Text>
        <Text style={styles.subtitle}>Your daily space to reflect and grow.</Text>

        <View style={styles.affirmCard}>
          <Text style={styles.affirmTitle}>Daily Affirmation</Text>
          <Text style={styles.affirmText}>{affirmation}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Reflection</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          placeholder="Write your thoughts..."
          placeholderTextColor="#9A6060"
          style={styles.textarea}
        />

        <View style={styles.row}>
          <TouchableOpacity style={styles.saveButton} onPress={saveEntry}>
            <Text style={styles.saveText}>Save Entry</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallButton, mood ? styles.smallButtonActive : null]}
            onPress={() => {
              const options = ["😁","🙂","😐","☹️","😭"];
              const next = options[(options.indexOf(mood || "") + 1) % options.length];
              setMood(next);
            }}
          >
            <Text style={styles.saveText}>{mood || "Set Mood"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Reflection Questions</Text>
        <View style={styles.questionsRow}>
          {REFLECTION_QUESTIONS.map(q => (
            <TouchableOpacity key={q} style={styles.questionChip} onPress={() => pickReflectionQuestion(q)}>
              <Text style={styles.questionText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tags */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tags</Text>
        <View style={styles.tagRow}>
          {["Self-care","Productivity","Gratitude","Stress","Random"].map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tag, tags.includes(t) ? styles.tagActive : null]}
              onPress={() => toggleTag(t)}
            >
              <Text style={[styles.tagText, tags.includes(t) ? styles.tagTextActive : null]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Add Photo */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add a photo to today's entry</Text>
        <View style={styles.row}>
          <Image source={{ uri: SAMPLE_IMAGE_URI }} style={styles.thumb} />
          <TouchableOpacity onPress={() => Alert.alert("Upload", "Image picker not included in this simple build")} style={styles.uploadButton}>
            <Text style={styles.uploadText}>Upload</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Previous Entries</Text>

        <View style={{ marginVertical: 8 }}>
          <Text style={styles.subTitle}>Favorites</Text>
          {favoriteEntries.length === 0 ? (
            <Text style={styles.note}>No favorites yet. Tap ⭐ on an entry to favorite it.</Text>
          ) : favoriteEntries.map(f => (
            <View key={f.id} style={styles.entryRow}>
              <Text style={styles.entryDate}>{f.date}</Text>
              <Text style={styles.entryText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 6 }}>
          {entries.map(e => (
            <View key={e.id} style={styles.entryItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.entryDate}>{e.date}</Text>
                <Text style={styles.entryText}>{e.text}</Text>
                {e.mood ? <Text style={styles.smallMuted}>Mood: {e.mood}</Text> : null}
                {e.tags?.length ? <Text style={styles.smallMuted}>Tags: {e.tags.join(", ")}</Text> : null}
              </View>

              <TouchableOpacity onPress={() => toggleFavorite(e.id)} style={styles.favoriteBtn}>
                <Text style={{ fontSize: 18 }}>{e.favorite ? "★" : "☆"}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

     
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Monthly Word Cloud</Text>
        <Text style={styles.note}>Select up to {MAX_WORDS} words — these are the words you’ll see this month.</Text>

        <View style={styles.wordGrid}>
          {MONTHLY_WORDS.map(w => {
            const selected = selectedWords.includes(w);
            return (
              <TouchableOpacity key={w} onPress={() => toggleWord(w)} style={[styles.wordChip, selected ? styles.wordChipActive : null]}>
                <Text style={[styles.wordText, selected ? styles.wordTextActive : null]}>{w}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.note, { marginTop: 8 }]}>Selected: {selectedWords.join(", ") || "None"}</Text>
      </View>

    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDE7EC" },

  header: { padding: 16, paddingTop: 26 },
  title: { fontSize: 28, fontWeight: "700", color: "#6A3B3B" },
  subtitle: { color: "#8C5454", marginTop: 6 },

  affirmCard: { marginTop: 12, backgroundColor: "#FFF7F7", marginBottom: 6, padding: 10, borderRadius: 12 },
  affirmTitle: { color: "#6A3B3B", fontWeight: "600" },
  affirmText: { color: "#704141", marginTop: 6 },

  card: { backgroundColor: "#FFF7F7", marginHorizontal: 16, padding: 12, borderRadius: 12, marginTop: 12 },
  cardTitle: { color: "#6A3B3B", fontWeight: "600", fontSize: 16, marginBottom: 6 },

  textarea: { minHeight: 90, backgroundColor: "#FDEFF0", borderRadius: 10, padding: 10, color: "#6A3B3B" },

  row: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  saveButton: { flex: 1, backgroundColor: "#F8C9D0", padding: 10, borderRadius: 10, alignItems: "center" },
  saveText: { color: "#6A3B3B", fontWeight: "600" },

  smallButton: { marginLeft: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: "#EEE", backgroundColor: "#fff" },
  smallButtonActive: { backgroundColor: "#F3B9C4" },

  questionsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  questionChip: { backgroundColor: "#fff", padding: 10, borderRadius: 10, marginRight: 8, marginBottom: 8, minWidth: 160 },
  questionText: { color: "#704141" },

  tagRow: { flexDirection: "row", flexWrap: "wrap" },
  tag: { backgroundColor: "#FFF0F1", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  tagActive: { backgroundColor: "#F7D9DD" },
  tagText: { color: "#8B4C57" },
  tagTextActive: { color: "#6A3B3B", fontWeight: "600" },

  thumb: { width: 70, height: 70, borderRadius: 10, marginRight: 12, backgroundColor: "#eee" },
  uploadButton: { padding: 10, borderRadius: 10, backgroundColor: "#fff", justifyContent: "center" },
  uploadText: { color: "#6A3B3B" },

  subTitle: { color: "#6A3B3B", fontWeight: "700" },
  note: { color: "#704141", marginTop: 6 },

  entryRow: { marginBottom: 8, borderRadius: 8, padding: 6, backgroundColor: "#FFF" },
  entryItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderColor: "#F2E6E6" },
  entryDate: { color: "#8C5454", fontSize: 12 },
  entryText: { color: "#6A3B3B", marginTop: 4 },
  smallMuted: { color: "#9A6060", fontSize: 12 },

  favoriteBtn: { marginLeft: 8, padding: 8 },

  wordGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  wordChip: { padding: 8, borderRadius: 20, backgroundColor: "#FFF0F1", marginRight: 8, marginBottom: 8 },
  wordChipActive: { backgroundColor: "#F7D9DD" },
  wordText: { color: "#8B4C57" },
  wordTextActive: { color: "#6A3B3B", fontWeight: "700" }
});
