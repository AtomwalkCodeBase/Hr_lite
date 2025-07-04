import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { ProjectHoursBreakdown, TaskDetailCard } from './SharedTimesheetComponents';

const SelectedDayDetail = ({ 
  selectedDay, 
  formatDisplayDate, 
  isSelfView, 
  onEdit 
}) => {
  const statusConfig = {
    s: { color: '#2196F3', icon: 'schedule', label: 'SUBMITTED', bgColor: '#E3F2FD', borderColor: '#2196F3' },
    a: { color: '#4CAF50', icon: 'check-circle', label: 'APPROVED', bgColor: '#E8F5E8', borderColor: '#4CAF50' },
    r: { color: '#f44336', icon: 'cancel', label: 'REJECTED', bgColor: '#FFEBEE', borderColor: '#f44336' },
    n: { color: '#FF9800', icon: 'schedule', label: 'DRAFT', bgColor: '#FFF3E0', borderColor: '#FF9800' },
    default: { color: '#9E9E9E', icon: 'help-outline', label: 'UNKNOWN', bgColor: '#F5F5F5', borderColor: '#9E9E9E' },
  };

  const getStatusStats = () => {
    const stats = {
      approved: 0,
      submitted: 0,
      rejected: 0,
      draft: 0
    };

    selectedDay.tasks.forEach(task => {
      const status = (task.status || 'n').toLowerCase();
      switch (status) {
        case 'a':
          stats.approved++;
          break;
        case 's':
          stats.submitted++;
          break;
        case 'r':
          stats.rejected++;
          break;
        default:
          stats.draft++;
          break;
      }
    });

    return stats;
  };

  const statusStats = getStatusStats();

  return (
    <ScrollView style={styles.container}>
      {/* Day Header */}
      {/* <View style={styles.dayHeader}>
        <View style={styles.dayHeaderLeft}>
          <MaterialIcons name="event" size={24} color="#a970ff" />
          <Text style={styles.dayTitle}>
            {formatDisplayDate(selectedDay.date)}
          </Text>
        </View>
        <View style={styles.dayHeaderRight}>
          <Text style={styles.dayOfWeek}>
            {selectedDay.date.toLocaleDateString('en-US', { weekday: 'long' })}
          </Text>
        </View>
      </View> */}

      {/* Stats Overview */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Daily Summary</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <MaterialIcons name="schedule" size={20} color="#a970ff" />
            <Text style={styles.statValue}>{selectedDay.totalHours.toFixed(1)}h</Text>
            <Text style={styles.statLabel}>Total Hours</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="work" size={20} color="#a970ff" />
            <Text style={styles.statValue}>{selectedDay.projects.size}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="assignment" size={20} color="#a970ff" />
            <Text style={styles.statValue}>{selectedDay.tasks.length}</Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </View>
        </View>
      </View>

		{/* Status Distribution */}
		<StatusDistribution statusStats={statusStats} />

		{/* Project Hours Breakdown  */}
		<ProjectHoursBreakdown selectedDay={selectedDay} />
		{/* Tasks List */}
      <View style={styles.tasksSection}>
        <Text style={styles.tasksTitle}>Task Details</Text>
        {selectedDay.tasks.map((task, index) => {
          return (
            <TaskDetailCard 
              key={index} 
              task={task} 
              selectedDay={selectedDay} 
              isSelfView={isSelfView} 
              onEdit={onEdit} 
              statusConfig={statusConfig} 
            />
          );
        })}
      </View>
    </ScrollView>
  );
};

// --- Subcomponents extracted for clarity and reuse ---

// Status distribution section
const StatusDistribution = ({ statusStats }) => (
  <View style={styles.statusCard}>
    <Text style={styles.statusTitle}>Task Status Distribution</Text>
    <View style={styles.statusGrid}>
      {(statusStats.approved > 0 || statusStats.submitted > 0 || statusStats.rejected > 0 || statusStats.draft > 0) ? (
        <>
          {statusStats.approved > 0 && (
            <View style={styles.statusItem}>
              <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.statusCount}>{statusStats.approved}</Text>
              <Text style={styles.statusLabel}>Approved</Text>
            </View>
          )}
          {statusStats.submitted > 0 && (
            <View style={styles.statusItem}>
              <MaterialIcons name="schedule" size={16} color="#2196F3" />
              <Text style={styles.statusCount}>{statusStats.submitted}</Text>
              <Text style={styles.statusLabel}>Submitted</Text>
            </View>
          )}
          {statusStats.rejected > 0 && (
            <View style={styles.statusItem}>
              <MaterialIcons name="cancel" size={16} color="#f44336" />
              <Text style={styles.statusCount}>{statusStats.rejected}</Text>
              <Text style={styles.statusLabel}>Rejected</Text>
            </View>
          )}
          {statusStats.draft > 0 && (
            <View style={styles.statusItem}>
              <MaterialIcons name="schedule" size={16} color="#FF9800" />
              <Text style={styles.statusCount}>{statusStats.draft}</Text>
              <Text style={styles.statusLabel}>Draft</Text>
            </View>
          )}
        </>
      ) : (
        <Text style={{ color: '#999', fontSize: 13, marginTop: 8 }}>No status data available.</Text>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f3f0ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  dayHeaderRight: {
    alignItems: 'flex-end',
  },
  dayOfWeek: {
    fontSize: 14,
    color: '#a970ff',
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#a970ff',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
    padding: 8,
  },
  statusCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  statusLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },

  tasksSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  tasksTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },

});

export default SelectedDayDetail;