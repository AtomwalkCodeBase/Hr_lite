import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Platform 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const NewLeaveCardComponent = ({ leave, onPress }) => {
  const leaveTypeColor = getLeaveTypeColor(leave.leave_type);
  const statusStyles = getStatusStyles(leave.status);
  const isHalfOrFullDay = leave.no_leave_count === '0.5' || leave.no_leave_count === '0.0' || leave.no_leave_count === '1.0' || leave.leave_type === 'WH';

  return (
    <TouchableOpacity 
      style={[
        styles.cardContainer,
        { borderLeftColor: leaveTypeColor }
      ]}
      onPress={() => onPress(leave)}
    >
      <View style={styles.headerRow}>
        <View style={styles.dateContainer}>
          <View style={styles.dateRow}>
            <MaterialIcons name="event" size={18} color="#666" />
            <Text style={styles.dateText}>{formatDateWithoutYear(leave.from_date)}</Text>
          </View>
          
          {!isHalfOrFullDay && (
            <View style={[styles.dateRow, styles.lastDateRow]}>
              <MaterialIcons name="event" size={18} color="#666" />
              <Text style={styles.dateText}>{formatDateWithoutYear(leave.to_date)}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.badgeContainer}>
          <View style={[styles.leaveTypeBadge, { backgroundColor: leaveTypeColor }]}>
            <Text style={styles.leaveTypeText}>{getLeaveTypeDisplay(leave.leave_type)}</Text>
          </View>
          {!isHalfOrFullDay && (
            <Text style={styles.daysText}>
              {formatLeaveCount(leave.no_leave_count)} {leave.no_leave_count === '1.0' ? 'day' : 'days'}
            </Text>
          )}
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusStyles.bgColor }]}>
          <MaterialIcons 
            name={statusStyles.icon} 
            size={16} 
            color={statusStyles.color} 
          />
          <Text style={[styles.statusText, { color: statusStyles.color }]}>
            {leave.status_display}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Helper functions (same as before)
const getLeaveTypeColor = (type) => {
  const colors = {
    'EL': '#4CAF50',
    'WH': '#2196F3',
    'HL': '#FF9800',
    'LP': '#F44336'
  };
  return colors[type] || '#9E9E9E';
};

const getLeaveTypeDisplay = (type) => {
  const types = {
    'EL': 'EL',
    'WH': 'WFH',
    'HL': 'Half Day',
    'LP': 'LOP'
  };
  return types[type] || type;
};

const getStatusStyles = (status) => {
  switch (status) {
    case 'A':
      return { 
        bgColor: '#E8F5E9', 
        color: '#2E7D32', 
        icon: 'check-circle-outline'
      };
    case 'S':
      return { 
        bgColor: '#E3F2FD', 
        color: '#0D47A1',
        icon: 'schedule'
      };
    case 'C':
      return { 
        bgColor: '#FFEBEE', 
        color: '#C62828', 
        icon: 'cancel-presentation'
      };
    case 'R':
      return { 
        bgColor: '#FCE4EC', 
        color: '#B71C1C', 
        icon: 'block'
      };
    default:
      return { 
        bgColor: '#FFF3E0', 
        color: '#E65100',
        icon: 'hourglass-empty'
      };
  }
};

const formatDateWithoutYear = (dateString) => {
  const [day, month, year] = dateString.split('-');
  const date = new Date(`${year}-${month}-${day}`);
  const options = { day: 'numeric', month: 'short' };
  return date.toLocaleDateString('en-US', options);
};

const formatLeaveCount = (count) => {
  const num = parseFloat(count);
  if (num % 1 === 0) {
    return num.toString();
  }
  return count;
};

// Styles
const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    padding: width * 0.04, // Responsive padding
    borderRadius: 12,
    marginBottom: width * 0.04,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 3,
      },
    }),
    borderLeftWidth: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 1,
  },
  dateContainer: {
    width: '33%',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  lastDateRow: {
    marginBottom: 0,
  },
  dateText: {
    fontSize: width > 400 ? 16 : 14, // Larger font on bigger screens
    color: '#444',
    fontWeight: '600',
    marginLeft: 8,
  },
  badgeContainer: {
    width: '33%',
    alignItems: 'center',
  },
  leaveTypeBadge: {
    padding: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  leaveTypeText: {
    fontSize: width > 400 ? 13 : 12,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  daysText: {
    fontSize: width > 400 ? 15 : 14,
    color: '#555',
    fontWeight: '500',
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    justifyContent: 'center',
    minWidth: 100,
    maxWidth: 120,
    marginLeft: 'auto',
  },
  statusText: {
    fontSize: width > 400 ? 13 : 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default NewLeaveCardComponent;