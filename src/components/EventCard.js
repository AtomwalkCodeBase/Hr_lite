import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const responsiveWidth = (percentage) => width * (percentage / 100);
const responsiveHeight = (percentage) => height * (percentage / 100);
const responsiveFontSize = (percentage) => Math.round(width * (percentage / 100));

const EventCard = ({ event, onPress }) => {
  // Helper function to get event type color
  const getEventTypeColor = (type) => {
    const typeColors = {
      'B': { bg: '#E1F5FE', text: '#0288D1' },  // Birthday
      'A': { bg: '#E8F5E9', text: '#388E3C' },  // Anniversary
      'C': { bg: '#FFF3E0', text: '#F57C00' },  // Conference
      'M': { bg: '#E0F2F1', text: '#00796B' },  // Meeting
      'P': { bg: '#F3E5F5', text: '#7B1FA2' },  // Party
      'O': { bg: '#EFEBE9', text: '#5D4037' },  // Other
    };
    
    return typeColors[type] || { bg: '#F5F5F5', text: '#757575' };
  };

  // Format the date for display
  const formatEventDate = (dateString) => {
    try {
      if (!dateString) return { day: '--', month: '---' };
      
      const [day, month, year] = dateString.split('-');
      const date = new Date(`${year}-${month}-${day}`);
      
      if (isNaN(date.getTime())) {
        return { day: '--', month: '---' };
      }
      
      return {
        day: day,
        month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
        year: year
      };
    } catch (error) {
      console.error("Date parsing error:", error);
      return { day: '--', month: '---', year: '----' };
    }
  };

  // Get event status style
  const getStatusStyle = (status) => {
    const statusMap = {
      'A': { // Active
        display: 'Active',
        bg: '#E3F2FD',
        text: '#1565C0',
        icon: 'flash'
      },
      'P': { // Planned
        display: 'Planned',
        bg: '#FFFDE7',
        text: '#F9A825',
        icon: 'calendar'
      },
      'X': { // Cancelled
        display: 'Cancelled',
        bg: '#FFEBEE',
        text: '#C62828',
        icon: 'close-circle'
      },
      'C': { // Completed
        display: 'Completed',
        bg: '#E0F2F1',
        text: '#00695C',
        icon: 'checkmark-circle'
      }
    };
    
    return statusMap[status] || { 
      display: 'Unknown', 
      bg: '#F5F5F5', 
      text: '#757575',
      icon: 'help-circle'
    };
  };

  const formattedDate = formatEventDate(event.event_date);
  const typeColor = getEventTypeColor(event.event_type);
  const statusInfo = getStatusStyle(event.event_status);

  return (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => onPress(event)}
      activeOpacity={0.9}
    >
      {/* Date ribbon */}
      <View style={styles.dateRibbon}>
        <Text style={styles.dateRibbonDay}>{formattedDate.day}</Text>
        <Text style={styles.dateRibbonMonth}>{formattedDate.month}</Text>
      </View>
      
      {/* Main content */}
      <View style={styles.cardContent}>
        {/* Event image - now properly positioned */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: event.image || 'https://via.placeholder.com/100' }}
            style={styles.eventImage}
            resizeMode="cover"
          />
        </View>
        
        {/* Event details - now properly positioned to the right of image */}
        <View style={styles.eventDetails}>
          <Text style={styles.eventTitle} numberOfLines={1}>{event.event_text}</Text>
          
          {event.emp_name && (
            <View style={styles.employeeContainer}>
              <Ionicons name="person-outline" size={14} color="#7f8c8d" />
              <Text style={styles.employeeText} numberOfLines={1}>
                {event.emp_name}
              </Text>
            </View>
          )}
          
          <View style={styles.tagsContainer}>
            <View style={[styles.tag, { backgroundColor: typeColor.bg }]}>
              <Text style={[styles.tagText, { color: typeColor.text }]}>
                {event.event_type_display}
              </Text>
            </View>
            
            <View style={[styles.tag, { backgroundColor: statusInfo.bg }]}>
              <Ionicons 
                name={statusInfo.icon} 
                size={14} 
                color={statusInfo.text} 
                style={styles.statusIcon}
              />
              <Text style={[styles.tagText, { color: statusInfo.text }]}>
                {statusInfo.display}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.arrowContainer}>
          <MaterialIcons 
            name="arrow-forward-ios" 
            size={16} 
            color="#bdc3c7" 
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
    padding: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  dateRibbon: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#2c3e50',
    paddingVertical: responsiveHeight(0.8),
    paddingHorizontal: responsiveWidth(3),
    borderBottomRightRadius: 12,
    zIndex: 2,
  },
  dateRibbonDay: {
    fontSize: responsiveFontSize(4),
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    lineHeight: responsiveFontSize(4.2),
  },
  dateRibbonMonth: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Changed to flex-start for better alignment
    padding: responsiveWidth(3),
    paddingLeft: responsiveWidth(22), // Increased to make space for image
  },
  imageContainer: {
    position: 'absolute',
    left: responsiveWidth(3),
    top: responsiveHeight(2), // Added top positioning
    width: responsiveWidth(18), // Slightly reduced width
    height: responsiveWidth(18), // Slightly reduced height
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 1,
    zIndex: 1, // Ensure image stays above other elements
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventDetails: {
    flex: 1,
    marginLeft: 0, // Removed marginLeft since we're using absolute positioning
  },
  eventTitle: {
    fontSize: responsiveFontSize(3.8),
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: responsiveHeight(0.6),
  },
  employeeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveHeight(1.2),
  },
  employeeText: {
    fontSize: responsiveFontSize(3),
    color: '#7f8c8d',
    marginLeft: responsiveWidth(1),
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(2.5),
    paddingVertical: responsiveHeight(0.6),
    borderRadius: 6,
    marginRight: responsiveWidth(2),
    marginBottom: responsiveHeight(0.5),
  },
  tagText: {
    fontSize: responsiveFontSize(2.8),
    fontWeight: '500',
  },
  statusIcon: {
    marginRight: 3,
  },
  arrowContainer: {
    marginLeft: 'auto',
    paddingLeft: responsiveWidth(2),
  },
});

export default EventCard;