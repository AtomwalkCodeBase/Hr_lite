import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const ProjectTimeDistribution = ({ weeklyData, formatDisplayDate }) => {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Generate different shades of the primary color for task segments
  const generateTaskColors = (taskCount) => {
    const baseColor = '#a970ff';
    const colors = [];
    
    for (let i = 0; i < taskCount; i++) {
      const opacity = 0.3 + (0.7 * i / Math.max(taskCount - 1, 1));
      colors.push(`${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`);
    }
    
    return colors;
  };

  const openProjectDetail = (project, data) => {
    // Group tasks by project to get detailed breakdown
    const projectTasks = {};
    
    Object.values(weeklyData.days).forEach(dayData => {
      dayData.tasks.forEach(task => {
        if (task.project_code.trim() === project) {
          const key = `${task.activity_name}-${task.a_date}`;
          if (!projectTasks[key]) {
            projectTasks[key] = {
              activity: task.activity_name,
              date: task.a_date,
              hours: 0,
              tasks: []
            };
          }
          projectTasks[key].hours += parseFloat(task.effort) || 0;
          projectTasks[key].tasks.push(task);
        }
      });
    });

    setSelectedProject({
      code: project,
      data: data,
      tasks: Object.values(projectTasks).sort((a, b) => b.hours - a.hours)
    });
    setShowProjectModal(true);
  };

  const renderProgressBar = (project, data) => {
    // Get unique activities for this project
    const activities = {};
    
    Object.values(weeklyData.days).forEach(dayData => {
      dayData.tasks.forEach(task => {
        if (task.project_code.trim() === project) {
          if (!activities[task.activity_name]) {
            activities[task.activity_name] = 0;
          }
          activities[task.activity_name] += parseFloat(task.effort) || 0;
        }
      });
    });

    const activityEntries = Object.entries(activities).sort((a, b) => b[1] - a[1]);
    const colors = generateTaskColors(activityEntries.length);

    let currentWidth = 0;
    
    return (
      <View style={styles.progressBar}>
        {activityEntries.map(([activity, hours], index) => {
          const width = (hours / data.hours) * 100;
          currentWidth += width;
          
          return (
            <View
              key={activity}
              style={[
                styles.progressSegment,
                {
                  width: `${width}%`,
                  backgroundColor: colors[index] || '#a970ff',
                }
              ]}
            />
          );
        })}
      </View>
    );
  };

  if (Object.keys(weeklyData.projects).length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="work" size={20} color="#a970ff" />
        <Text style={styles.sectionTitle}>Project Time Distribution</Text>
      </View>
      
      <ScrollView style={styles.projectGrid} showsVerticalScrollIndicator={false}>
        {Object.entries(weeklyData.projects).map(([project, data]) => (
          <TouchableOpacity
            key={project}
            style={styles.projectCard}
            onPress={() => openProjectDetail(project, data)}
          >
            <View style={styles.projectHeader}>
              <View style={styles.projectInfo}>
                <Text style={styles.projectCode}>{project.trim()}</Text>
                <View style={styles.projectStats}>
                  <View style={styles.statChip}>
                    <MaterialIcons name="assignment" size={12} color="#a970ff" />
                    <Text style={styles.statText}>{data.tasks} tasks</Text>
                  </View>
                  <View style={styles.statChip}>
                    <MaterialIcons name="schedule" size={12} color="#a970ff" />
                    <Text style={styles.statText}>{data.hours.toFixed(1)}h</Text>
                  </View>
                </View>
              </View>
              <View style={styles.projectPercentage}>
                <Text style={styles.percentageText}>
                  {weeklyData.totalHours ? ((data.hours / weeklyData.totalHours) * 100).toFixed(0) : 0}%
                </Text>
              </View>
            </View>
            
            {renderProgressBar(project, data)}
            
            <View style={styles.projectFooter}>
              <Text style={styles.viewDetailsText}>Tap to view task breakdown</Text>
              <MaterialIcons name="arrow-forward-ios" size={14} color="#a970ff" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={showProjectModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.projectModal}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {selectedProject?.code}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {selectedProject?.data.hours.toFixed(1)}h • {selectedProject?.data.tasks} tasks
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowProjectModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewTitle}>Project Overview</Text>
                <View style={styles.overviewStats}>
                  <View style={styles.overviewStat}>
                    <Text style={styles.overviewValue}>
                      {selectedProject?.data.hours.toFixed(1)}h
                    </Text>
                    <Text style={styles.overviewLabel}>Total Hours</Text>
                  </View>
                  <View style={styles.overviewStat}>
                    <Text style={styles.overviewValue}>
                      {selectedProject?.data.tasks}
                    </Text>
                    <Text style={styles.overviewLabel}>Total Tasks</Text>
                  </View>
                  <View style={styles.overviewStat}>
                    <Text style={styles.overviewValue}>
                      {weeklyData.totalHours ? 
                        ((selectedProject?.data.hours / weeklyData.totalHours) * 100).toFixed(0) : 0}%
                    </Text>
                    <Text style={styles.overviewLabel}>of Week</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.taskBreakdownTitle}>Task Breakdown</Text>
              {selectedProject?.tasks.map((taskGroup, index) => (
                <View key={index} style={styles.taskGroupCard}>
                  <View style={styles.taskGroupHeader}>
                    <Text style={styles.taskActivity}>{taskGroup.activity}</Text>
                    <Text style={styles.taskHours}>{taskGroup.hours.toFixed(1)}h</Text>
                  </View>
                  <Text style={styles.taskDate}>
                    {formatDisplayDate(new Date(taskGroup.date))}
                  </Text>
                  <View style={styles.taskProgress}>
                    <View
                      style={[
                        styles.taskProgressFill,
                        {
                          width: `${(taskGroup.hours / selectedProject.data.hours) * 100}%`
                        }
                      ]}
                    />
                  </View>
                  <View style={styles.taskMeta}>
                    <Text style={styles.taskCount}>
                      {taskGroup.tasks.length} {taskGroup.tasks.length === 1 ? 'entry' : 'entries'}
                    </Text>
                    <Text style={styles.taskPercentage}>
                      {((taskGroup.hours / selectedProject.data.hours) * 100).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  projectGrid: {
    // maxHeight: 300,
  },
  projectCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#a970ff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  projectStats: {
    flexDirection: "row",
    gap: 8,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f0ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#a970ff",
    fontWeight: "600",
  },
  projectPercentage: {
    alignItems: "center",
    backgroundColor: "#a970ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
  },
  progressSegment: {
    height: "100%",
  },
  projectFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewDetailsText: {
    fontSize: 12,
    color: "#a970ff",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  projectModal: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "68%",
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  overviewCard: {
    backgroundColor: "#f3f0ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#a970ff",
    marginBottom: 12,
  },
  overviewStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  overviewStat: {
    alignItems: "center",
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#a970ff",
  },
  overviewLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  taskBreakdownTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  taskGroupCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#a970ff",
  },
  taskGroupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  taskActivity: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  taskHours: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#a970ff",
  },
  taskDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  taskProgress: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    marginBottom: 8,
  },
  taskProgressFill: {
    height: "100%",
    backgroundColor: "#a970ff",
    borderRadius: 3,
  },
  taskMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskCount: {
    fontSize: 12,
    color: "#666",
  },
  taskPercentage: {
    fontSize: 12,
    color: "#a970ff",
    fontWeight: "600",
  },
});

export default ProjectTimeDistribution;