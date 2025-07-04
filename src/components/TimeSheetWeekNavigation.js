import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Navigation button for week/month/year navigation
const WeekNavButton = ({ onPress, icon }) => (
  <TouchableOpacity style={styles.weekNavButton} onPress={onPress}>
    <Ionicons name={icon} size={24} color="#a970ff" />
  </TouchableOpacity>
);

// Week/month/year info display
const WeekInfo = ({ text }) => (
  <View style={styles.weekInfo}>
    <Text style={styles.weekText}>{text}</Text>
  </View>
);

// Helper to get display text for navigation
function getDisplayText(type, filterRange, year, monthOptions, start, end, formatDisplayDate) {
  if (type === 'year') return filterRange.year;
  if (type === 'month') {
    const label = monthOptions.find((m) => m.value === Number(filterRange.month))?.label;
    return `${label} ${year}`;
  }
  return `${formatDisplayDate(start)} - ${formatDisplayDate(end)}`;
}

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
      let newYear = Number(year);
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

  const displayText = getDisplayText(type, filterRange, year, monthOptions, start, end, formatDisplayDate);

  return (
    <View style={styles.weekNavigation}>
      <WeekNavButton onPress={() => handleNavigate(-1)} icon="chevron-back" />
      <WeekInfo text={displayText} />
      <WeekNavButton onPress={() => handleNavigate(1)} icon="chevron-forward" />
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