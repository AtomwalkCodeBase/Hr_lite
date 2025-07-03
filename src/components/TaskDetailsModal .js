import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const TaskDetailsModal = ({ visible, onClose, task, status }) => {
  if (!task) return null;

  return (
<Modal visible={visible} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalBackground}>
      <View style={styles.modalContent}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Task Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Section */}
          <View style={styles.statusSection}>
            <View style={[styles.statusBadge, {
              backgroundColor: status.bgColor,
              borderColor: status.borderColor
            }]}>
              <MaterialIcons name={status.icon} size={20} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
          </View>

          {/* Project Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Project Code:</Text>
                <Text style={styles.infoValue}>{task.project_code || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Activity:</Text>
                <Text style={styles.infoValue}>{task.activity_name || 'N/A'}</Text>
              </View>
            </View>
          </View>

		  {task.remarks && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Employee Note</Text>
              <View style={styles.remarksContainer}>
                <Text style={styles.remarksText}>{task.remarks}</Text>
              </View>
            </View>
          )}

          {/* Manager's Note */}
          {task.a_remarks && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Manager's Note</Text>
              <View style={styles.remarksContainer}>
                <Text style={styles.remarksText}>{task.a_remarks}</Text>
              </View>
            </View>
          )}

          {/* Approval/Rejection Date */}
          {task.a_date && ['A', 'R'].includes((task.status || '').toUpperCase()) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {task.status.toUpperCase() === 'A' ? 'Approved Date' : 'Rejected Date'}
              </Text>
              <View style={styles.dateContainer}>
                <View style={styles.dateCard}>
                  <View style={[styles.dateIcon, {
                    backgroundColor: task.status.toUpperCase() === 'A' ? '#E8F5E8' : '#FFEBEE'
                  }]}>
                    <MaterialIcons
                      name={task.status.toUpperCase() === 'A' ? 'check-circle' : 'cancel'}
                      size={24}
                      color={task.status.toUpperCase() === 'A' ? '#4CAF50' : '#f44336'}
                    />
                  </View>
                  <Text style={styles.dateLabel}>
                    {task.status.toUpperCase() === 'A' ? 'Approved on' : 'Rejected on'}
                  </Text>
                  <Text style={styles.dateValue}>{task.a_date}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  </View>
</Modal>

  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
	height: 500,
    // maxHeight: height * 0.85,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  statusSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    borderWidth: 1,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    // textAlign: 'right',
  },
  remarksContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  remarksText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  dateContainer: {
    alignItems: 'center',
  },
  dateCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: 200,
  },
  dateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '700',
  },
});

export default TaskDetailsModal;