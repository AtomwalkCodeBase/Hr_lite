import React, { memo, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ProjectHoursBreakdown, TaskDetailCard } from './SharedTimesheetComponents';
import ApplyButton from './ApplyButton';

const STATUS_CONFIG = {
  s: { color: '#2196F3', icon: 'schedule', label: 'SUBMITTED', bgColor: '#E3F2FD', borderColor: '#2196F3' },
  a: { color: '#4CAF50', icon: 'check-circle', label: 'APPROVED', bgColor: '#E8F5E8', borderColor: '#4CAF50' },
  r: { color: '#f44336', icon: 'cancel', label: 'REJECTED', bgColor: '#FFEBEE', borderColor: '#f44336' },
  n: { color: '#FF9800', icon: 'schedule', label: 'DRAFT', bgColor: '#FFF3E0', borderColor: '#FF9800' },
  default: { color: '#9E9E9E', icon: 'help-outline', label: 'UNKNOWN', bgColor: '#F5F5F5', borderColor: '#9E9E9E' },
};

const getStatusStats = (tasks) => {
  const stats = { approved: 0, submitted: 0, rejected: 0, draft: 0 };
  tasks.forEach(task => {
    const status = (task.status || 'n').toLowerCase();
    stats[status === 'a' ? 'approved' : status === 's' ? 'submitted' : status === 'r' ? 'rejected' : 'draft']++;
  });
  return stats;
};

const getDominantStatusKey = (tasks) => {
  const stats = getStatusStats(tasks);
  const statusCounts = [
    { key: 'a', count: stats.approved, priority: 2 },
    { key: 'r', count: stats.rejected, priority: 1 },
    { key: 's', count: stats.submitted, priority: 3 },
    { key: 'n', count: stats.draft, priority: 4 },
  ];

  const maxCount = Math.max(...statusCounts.map(s => s.count));
  if (maxCount === 0) return 'default';

  const maxStatuses = statusCounts.filter(s => s.count === maxCount);
  return maxStatuses.reduce((prev, curr) => prev.priority < curr.priority ? prev : curr).key;
};

const ActivityRow = memo(({ task, statusConfig }) => {
  const status = statusConfig[(task.status || 'n').toLowerCase()] || statusConfig.default;
  return (
    <View style={styles.activityRow}>
      <MaterialIcons name={status.icon} size={14} color={status.color} style={styles.activityIcon} />
      <Text style={[styles.activityName, { color: status.color }]}>{task.activity_name}</Text>
      <Text style={styles.activityEffort}>({parseFloat(task.effort) || 0}h)</Text>
      <Text style={styles.activityStatus}>{status.label}</Text>
    </View>
  );
});

const StatItem = memo(({ icon, value, label, color }) => (
  <View style={styles.statItem}>
    <MaterialIcons name={icon} size={20} color={color} />
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
));

const SelectedDayDetail = ({
  selectedDay,
  formatDisplayDate,
  isSelfView,
  onEdit,
  onDelete,
  showAddModal,
  showAddIcon,
  onAnyActionClose,
}) => {
  const { tasks, totalHours, projects } = selectedDay;
  const dominantStatusKey = useMemo(() => getDominantStatusKey(tasks), [tasks]);
  const dominantStatusColor = STATUS_CONFIG[dominantStatusKey]?.color || STATUS_CONFIG.default.color;
  const statusStats = useMemo(() => getStatusStats(tasks), [tasks]);

  return (
    <>
      <ScrollView style={styles.container}>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Daily Summary</Text>
          <View style={styles.statsGrid}>
            <StatItem icon="schedule" value={`${totalHours.toFixed(1)}h`} label="Total Hours" color={dominantStatusColor} />
            <StatItem icon="work" value={projects.size} label="Projects" color={dominantStatusColor} />
            <StatItem icon="assignment" value={tasks.length} label="Tasks" color={dominantStatusColor} />
          </View>
          <View style={styles.activityContainer}>
            {tasks.map((task, idx) => (
              <ActivityRow key={idx} task={task} statusConfig={STATUS_CONFIG} />
            ))}
          </View>
        </View>

        {/* Project Hour */}
        <ProjectHoursBreakdown selectedDay={selectedDay} progressColor={dominantStatusColor} />

        {/* Detail task card */}
        <View style={styles.tasksSection}>
          <Text style={styles.tasksTitle}>Task Details</Text>
          {tasks.map((task, index) => (
            <TaskDetailCard
              key={index}
              task={task}
              selectedDay={selectedDay}
              isSelfView={isSelfView}
              onEdit={async (t) => {
                await onEdit(t);
                if (onAnyActionClose) onAnyActionClose();
              }}
              onDelete={async (t) => {
                await onDelete(t);
                if (onAnyActionClose) onAnyActionClose();
              }}
              statusConfig={STATUS_CONFIG}
            />
          ))}
        </View>
      </ScrollView>
      {showAddIcon && (
        <ApplyButton
          onPress={() => {
            showAddModal(selectedDay.date);
            if (onAnyActionClose) onAnyActionClose();
          }}
          buttonText={`Add New Task on ${formatDisplayDate(selectedDay.date)}`}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activityContainer: {
    marginTop: 12,
    marginLeft: 4,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityIcon: {
    marginRight: 4,
  },
  activityName: {
    fontSize: 13,
    fontWeight: '600',
  },
  activityEffort: {
    fontSize: 12,
    color: '#555',
    marginLeft: 4,
  },
  activityStatus: {
    fontSize: 12,
    color: '#888',
    marginLeft: 6,
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

export default memo(SelectedDayDetail);