import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TimeSheetWeekNavigation = ({ currentWeekStart, onNavigate, formatDisplayDate, getCurrentWeekDates }) => {
  const { start: weekStart, end: weekEnd } = getCurrentWeekDates(currentWeekStart);
  return (
    <View style={styles.weekNavigation}>
      <TouchableOpacity style={styles.weekNavButton} onPress={() => onNavigate(-1)}>
        <Ionicons name="chevron-back" size={24} color="#a970ff" />
      </TouchableOpacity>
      <View style={styles.weekInfo}>
        <Text style={styles.weekText}>
          {formatDisplayDate(weekStart)} - {formatDisplayDate(weekEnd)}
        </Text>
      </View>
      <TouchableOpacity style={styles.weekNavButton} onPress={() => onNavigate(1)}>
        <Ionicons name="chevron-forward" size={24} color="#a970ff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  weekNavigation: {
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  weekNavButton: {
    padding: 5,
  },
  weekInfo: {
    flex: 1,
    alignItems: "center",
  },
  weekText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});

export default TimeSheetWeekNavigation; 