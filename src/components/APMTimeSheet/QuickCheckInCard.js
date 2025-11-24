import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../Styles/appStyle";

const QuickCheckInCard = ({ project, onCheckIn, onDetails }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Ready to begin?</Text>
      <Text style={styles.subtitle}>
        {project.title} ({project.project_code})
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.primaryBtn]} onPress={onCheckIn}>
          <Ionicons name="log-in-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Check-In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.secondaryBtn]} onPress={onDetails}>
          <Ionicons name="document-text-outline" size={18} color={colors.primary} />
          <Text style={[styles.btnText, styles.secondaryBtnText]}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QuickCheckInCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  subtitle: {
    fontSize: 13,
    color: "#475569",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
  },
  secondaryBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  secondaryBtnText: {
    color: colors.primary,
  },
});
