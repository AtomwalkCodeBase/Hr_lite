import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ApproveLeaveCard = ({ leave, onPress, onApprove, onReject }) => {
  const getStatusStyles = (status_display) => {
    switch (status_display) {
      case 'Submitted':
        return { 
          bgColor: '#fff7e6', 
          color: '#FFA800', 
          borderColor: '#FFA800',
          icon: 'pending'
        };
      case 'Rejected':
        return { 
          bgColor: '#ffe6e6', 
          color: '#FF0000', 
          borderColor: '#FF0000', 
          icon: 'cancel' 
        };
      case 'Cancelled':
        return { 
          bgColor: '#ffe6e6', 
          color: '#ff6666', 
          borderColor: '#ff6666', 
          icon: 'cancel' 
        };
      case 'Approved':
        return { 
          bgColor: '#eaffea', 
          color: '#66cc66', 
          borderColor: '#66cc66', 
          icon: 'check-circle' 
        };
      default:
        return { 
          bgColor: '#fff', 
          color: '#000', 
          borderColor: '#ddd', 
          icon: 'check-circle' 
        };
    }
  };

  console.log("Leave==",leave)

  const { bgColor, color, borderColor, icon } = getStatusStyles(leave.status_display);
  const showButtons = leave.status_display === 'Submitted';

  return (
    <TouchableOpacity 
      style={[styles.cardContainer, { borderColor }]}
      onPress={() => onPress(leave)}
      activeOpacity={0.8}
    >
      <View style={styles.headerContainer}>
        <View style={styles.employeeInfo}>
          <Text 
            style={styles.employeeIdText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {leave.emp_data.emp_id}
          </Text>
          <Text 
            style={styles.employeeNameText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {leave.emp_data.name}
          </Text>
        </View>
        
        <View style={[styles.statusContainer, { backgroundColor: bgColor }]}>
          <Text 
            style={[styles.statusText, { color }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {leave.leave_type_display}
          </Text>
          <MaterialIcons 
            name={icon} 
            size={20} 
            color={color} 
            style={styles.statusIcon}
          />
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.dateText}>
          {leave.from_date} - {leave.to_date}
        </Text>
        <Text style={styles.daysText}>
          {leave.no_leave_count} day(s)
        </Text>
      </View>
      
      {showButtons && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.rejectButton} 
            onPress={() => onReject(leave)}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.approveButton} 
            onPress={() => onApprove(leave)}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  employeeInfo: {
    flex: 1,
    marginRight: 8,
  },
  employeeIdText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
    marginBottom: 2,
  },
  employeeNameText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    maxWidth: '40%',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusIcon: {
    marginLeft: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  daysText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rejectButton: {
    backgroundColor: '#ff4444',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 20,
    flex: 1,
    marginRight: 8,
  },
  approveButton: {
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 20,
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ApproveLeaveCard;