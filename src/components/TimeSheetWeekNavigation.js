import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TimeSheetWeekNavigation = ({
  currentWeekStart,
  onNavigate,
  formatDisplayDate,
  getCurrentWeekDates,
  filterRange,
  getFilterDateRange,
  monthOptions,
}) => {
  const { start, end, type, year } = getFilterDateRange(filterRange, currentWeekStart);

  const handleNavigate = (direction) => {
    if (type === 'year') {
      const newYear = Number(filterRange.year) + direction;
      filterRange.setFilters((prev) => ({ ...prev, year: newYear, month: "" }));
    } else if (type === 'month') {
      let newMonth = Number(filterRange.month) + direction;
      let newYear = Number(year); // Use year from getFilterDateRange (selected or default)
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
      filterRange.setFilters((prev) => ({ ...prev, year: newYear, month: newMonth }));
    } else {
      onNavigate(direction);
    }
  };

  const displayText =
    type === 'year'
      ? filterRange.year
      : type === 'month'
      ? `${monthOptions.find((m) => m.value === Number(filterRange.month))?.label} ${year}`
      : `${formatDisplayDate(start)} - ${formatDisplayDate(end)}`;

  return (
    <View style={styles.weekNavigation}>
      <TouchableOpacity style={styles.weekNavButton} onPress={() => handleNavigate(-1)}>
        <Ionicons name="chevron-back" size={24} color="#a970ff" />
      </TouchableOpacity>
      <View style={styles.weekInfo}>
        <Text style={styles.weekText}>{displayText}</Text>
      </View>
      <TouchableOpacity style={styles.weekNavButton} onPress={() => handleNavigate(1)}>
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
    marginBottom: 10
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