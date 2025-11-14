import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from '../Styles/appStyle';

const ProjectCard = ({ 
  project, 
  onStartProject, 
  onViewDetails, 
  fadeAnim = new Animated.Value(1) 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "active": return colors.primary;
      case "planned": return "#FF9800";
      case "pending": return "#F44336";
      case "completed": return "#2196F3";
      default: return "#757575";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active": return "play-circle";
      case "planned": return "calendar-outline";
      case "pending": return "alert-circle";
      case "completed": return "checkmark-circle";
      default: return "help-circle";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getButtonText = (status) => {
    switch (status) {
      case "active": return "Continue";
      case "pending": return "Start";
      case "planned": return "Start";
      case "completed": return "Completed";
      default: return "Start";
    }
  };

  return (
    <Animated.View 
      style={[
        styles.card,
        { opacity: fadeAnim }
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.projectTitle} numberOfLines={1}>
            {project.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
            <Ionicons 
              name={getStatusIcon(project.status)} 
              size={12} 
              color="#fff" 
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.projectCode}>
          {project.project_code}
        </Text>
      </View>

      {/* Project Dates */}
      <View style={styles.datesContainer}>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.dateLabel}>Planned Start: </Text>
          <Text style={styles.dateValue}>{formatDate(project.planned_start_date)}</Text>
        </View>
        <View style={styles.dateRow}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.dateLabel}>Actual Start: </Text>
          <Text style={styles.dateValue}>
            {project.actual_start_date ? formatDate(project.actual_start_date) : "Not started"}
          </Text>
        </View>
        <View style={styles.dateRow}>
          <Ionicons name="flag-outline" size={14} color="#666" />
          <Text style={styles.dateLabel}>Due Date: </Text>
          <Text style={styles.dateValue}>{formatDate(project.due_date)}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button, 
            styles.startButton,
            project.status === "completed" && styles.buttonDisabled
          ]}
          onPress={() => onStartProject(project)}
          disabled={project.status === "completed"}
        >
          <Ionicons 
            name={project.status === "active" ? "play" : "play-circle-outline"} 
            size={16} 
            color="#fff" 
          />
          <Text style={styles.buttonText}>
            {getButtonText(project.status)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.detailsButton]}
          onPress={() => onViewDetails(project)}
        >
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          <Text style={[styles.buttonText, styles.detailsButtonText]}>
            Details
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a202c",
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  projectCode: {
    fontSize: 14,
    color: "#666",
    fontFamily: "monospace",
  },
  datesContainer: {
    marginBottom: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  dateLabel: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
    marginRight: 4,
    fontWeight: "500",
  },
  dateValue: {
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  startButton: {
    backgroundColor: colors.primary,
  },
  detailsButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  detailsButtonText: {
    color: colors.primary,
  },
});

export default ProjectCard;