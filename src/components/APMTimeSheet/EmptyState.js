import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../Styles/appStyle";

const EmptyState = ({ title, subtitle, onRefresh }) => (
  <View style={styles.container}>
    <Ionicons name="folder-open-outline" size={64} color="#ccc" />
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.text}>{subtitle}</Text>

    {onRefresh && (
      <TouchableOpacity style={styles.button} onPress={onRefresh}>
        <Text style={styles.buttonText}>Refresh</Text>
      </TouchableOpacity>
    )}
  </View>
);

export default EmptyState;

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 20 },
  title: { fontSize: 18, fontWeight: "600", marginTop: 16, color: "#333" },
  text: { fontSize: 14, marginTop: 6, color: "#777", textAlign: "center" },
  button: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
