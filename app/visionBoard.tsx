import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";


const prompts = [
  "I WANT TO START:",
  "I WANT TO STOP:",
  "I WANT TO LEARN:",
  "I WANT TO TRY:",
  "I AM GRATEFUL FOR:",
  "I WILL CONTINUE:",
];

export default function VisionBoard() {
  const [values, setValues] = useState(Array(6).fill(""));

  const handleChange = (text: string, index: number) => {
    const copy = [...values];
    copy[index] = text;
    setValues(copy);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Monthly Vision Board</Text>

      <View style={styles.grid}>
        {prompts.map((label, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardLabel}>{label}</Text>

            <TextInput
              style={styles.input}
              placeholder="Write here..."
              placeholderTextColor="#B8B8B8"
              multiline
              value={values[index]}
              onChangeText={(t) => handleChange(t, index)}
            />
          </View>
        ))}
      </View>

      <Text style={styles.footerText}>
        “Your vision becomes real when you clarify and define it.”
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5E5F0",
    padding: 20,
  },
  title: {
    fontSize: 77,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
    color: "#90595C",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#FEF5F0",
    borderRadius: 30,
    padding: 15,
    marginBottom: 15,
    minHeight: 160,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#90595C",
    marginBottom: 10,
    letterSpacing: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#90595C",
    paddingTop: 5,
    textAlignVertical: "top",
  },
  footerText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    color: "#90595C",
    fontStyle: "italic",
  },
});