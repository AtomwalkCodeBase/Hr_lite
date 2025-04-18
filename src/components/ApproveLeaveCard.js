import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ApproveLeaveCard = ({ leave, onPress, onApprove, onReject }) => {
  const getStatusStyles = (status_display) => {
    switch (status_display) {
      case 'Submitted':
        return { 
          bgColor: '#fff', 
          textColor: '#FF8F00', 
          borderColor: '#FFE0B2',
          icon: 'pending',
          statusBg: '#FFF3E0'
        };
      case 'Rejected':
        return { 
          bgColor: '#FFEBEE', 
          textColor: '#D32F2F', 
          borderColor: '#FFCDD2',
          icon: 'cancel',
          statusBg: '#FFE0E0'
        };
      case 'Cancelled':
        return { 
          bgColor: '#F5F5F5', 
          textColor: '#616161', 
          borderColor: '#E0E0E0',
          icon: 'cancel',
          statusBg: '#EEEEEE'
        };
      case 'Approved':
        return { 
          bgColor: '#E8F5E9', 
          textColor: '#388E3C', 
          borderColor: '#C8E6C9',
          icon: 'check-circle',
          statusBg: '#E0F2E1'
        };
      default:
        return { 
          bgColor: '#E3F2FD', 
          textColor: '#1976D2', 
          borderColor: '#BBDEFB',
          icon: 'info',
          statusBg: '#E1F0FF'
        };
    }
  };

  const { bgColor, textColor, borderColor, icon, statusBg } = getStatusStyles(leave.status_display);
  const showButtons = leave.status_display === 'Submitted';

  return (
    <TouchableOpacity 
      style={[styles.cardContainer, { backgroundColor: bgColor, borderColor }]}
      onPress={() => onPress(leave)}
      activeOpacity={0.9}
    >
      <View style={styles.headerContainer}>
        <View style={styles.profileContainer}>
          <Image 
            source={{ uri: leave.emp_data.image }} 
            style={styles.profileImage}
            resizeMode="cover"
          />
          <View style={styles.employeeInfo}>
            <Text style={styles.employeeNameText} numberOfLines={1}>
              {leave.emp_data.name}
            </Text>
            <View style={styles.metaContainer}>
              <Text style={styles.employeeIdText}>{leave.emp_data.emp_id}</Text>
              <View style={styles.divider} />
              <Text style={styles.departmentText}>{leave.emp_data.department_name}</Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <MaterialIcons 
            name={icon} 
            size={16} 
            color={textColor} 
            style={styles.statusIcon}
          />
          <Text style={[styles.statusText, { color: textColor }]}>
            {leave.status_display}
          </Text>
        </View>
      </View>
      
      <View style={styles.leaveDetailsContainer}>
        <View style={styles.leaveTypeContainer}>
          <Text style={styles.leaveTypeText}>{leave.leave_type_display}</Text>
          <View style={styles.daysBadge}>
            <Text style={styles.daysText}>{leave.no_leave_count} day(s)</Text>
          </View>
        </View>
        
        <View style={styles.dateContainer}>
          <MaterialIcons name="date-range" size={16} color="#555" />
          <Text style={styles.dateText}>
            {leave.from_date} - {leave.to_date}
          </Text>
        </View>
        
        {leave.remarks && (
          <View style={styles.remarksContainer}>
            <MaterialIcons name="notes" size={14} color="#555" />
            <Text style={styles.remarksText} numberOfLines={5}>
              {leave.remarks}
            </Text>
          </View>
        )}
      </View>
      
      {showButtons && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]} 
            onPress={() => onReject(leave)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="clear" size={18} color="#fff" />
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.approveButton]} 
            onPress={() => onApprove(leave)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="check" size={18} color="#fff" />
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.footerContainer}>
        <Text style={styles.submittedText}>
          Submitted on: {leave.submit_date}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
      android: {
        elevation: 6,
      },
    }),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeNameText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeIdText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  departmentText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: '#bbb',
    marginHorizontal: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  leaveDetailsContainer: {
    marginBottom: 12,
    paddingLeft: 8,
  },
  leaveTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leaveTypeText: {
    fontSize: 15,
    color: '#222',
    fontWeight: '700',
  },
  daysBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  daysText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
    marginLeft: 6,
  },
  remarksContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  remarksText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '400',
    marginLeft: 6,
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: 18,
    flex: 1,
    paddingHorizontal: 12,
  },
  rejectButton: {
    backgroundColor: '#E53935',
    marginRight: 8,
  },
  approveButton: {
    backgroundColor: '#43A047',
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  footerContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    paddingTop: 10,
    marginTop: 10,
  },
  submittedText: {
    fontSize: 11,
    color: '#888',
    fontWeight: '400',
    textAlign: 'right',
  },
});

export default ApproveLeaveCard;