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
      'B': { bg: '#E1F5FE', text: '#0288D1' },  // Birthday - Light Blue
      'A': { bg: '#E8F5E9', text: '#388E3C' },  // Anniversary - Light Green
      'C': { bg: '#FFF3E0', text: '#F57C00' },  // Conference - Light Orange
      'M': { bg: '#E0F2F1', text: '#00796B' },  // Meeting - Light Teal
      'P': { bg: '#F3E5F5', text: '#7B1FA2' },  // Party - Light Purple
      'O': { bg: '#EFEBE9', text: '#5D4037' },  // Other - Light Brown
    };
    
    return typeColors[type] || { bg: '#F5F5F5', text: '#757575' }; // Default - Light Grey
  };

  console.log("Ind Event---",event)
  // Format the date for display (handles DD-MM-YYYY format)
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
        month: date.toLocaleString('default', { month: 'short' })
      };
    } catch (error) {
      console.error("Date parsing error:", error);
      return { day: '--', month: '---' };
    }
  };

  // Get event status style and display text
  const getStatusStyle = (status) => {
    const statusMap = {
      'A': { // Active
        display: 'Active',
        bg: '#E3F2FD',     // Light Blue
        text: '#1565C0'     // Dark Blue
      },
      'P': { // Planned
        display: 'Planned',
        bg: '#FFFDE7',     // Light Yellow
        text: '#F9A825'     // Amber / Dark Yellow
      },
      'X': { // Cancelled
        display: 'Cancelled',
        bg: '#FFEBEE',     // Light Red / Pink
        text: '#C62828'     // Dark Red
      },
      'C': { // Completed
        display: 'Completed',
        bg: '#E0F2F1',     // Light Teal
        text: '#00695C'     // Strong Teal
      }
    };
    
    
    
    return statusMap[status] || { display: 'Unknown', bg: '#F5F5F5', text: '#757575' };
  };

  const formattedDate = formatEventDate(event.event_date);
  const typeColor = getEventTypeColor(event.event_type);
  const statusInfo = getStatusStyle(event.event_status);

  return (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => onPress(event)}
      activeOpacity={0.95}
    >
      <View style={styles.cardContent}>
        {/* Date display */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateDay}>{formattedDate.day}</Text>
          <Text style={styles.dateMonth}>{formattedDate.month}</Text>
        </View>
        
        {/* Main event content */}
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle} numberOfLines={1}>{event.event_text}</Text>
          
          <View style={styles.eventMeta}>
            {/* Event type tag */}
            <View style={[styles.tag, { backgroundColor: typeColor.bg }]}>
              <Text style={[styles.tagText, { color: typeColor.text }]}>
                {event.event_type_display}
              </Text>
            </View>
            
            {/* Event status tag */}
            <View style={[styles.tag, { backgroundColor: statusInfo.bg }]}>
              <Text style={[styles.tagText, { color: statusInfo.text }]}>
                {statusInfo.display}
              </Text>
            </View>
          </View>
          
          {/* Remarks - if available */}
          {event.emp_name && (
            <View style={styles.remarksContainer}>
              <Ionicons name="person" size={14} color="#7f8c8d" />
              <Text style={styles.remarksText} numberOfLines={1}>{event.emp_name}</Text>
            </View>
          )}
        </View>
        
        {/* Event Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: event.image || 'https://via.placeholder.com/100' }}
            style={styles.eventImage}
            resizeMode="cover"
          />
          <View style={styles.arrowContainer}>
            <MaterialIcons name="arrow-forward-ios" size={16} color="#3498db" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: responsiveWidth(5),
    marginBottom: responsiveHeight(2),
    padding: responsiveWidth(3),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    backgroundColor: '#f5f6fa',
    borderRadius: 12,
    padding: responsiveWidth(2),
    alignItems: 'center',
    justifyContent: 'center',
    width: responsiveWidth(14),
    height: responsiveWidth(14),
    marginRight: responsiveWidth(3),
  },
  dateDay: {
    fontSize: responsiveFontSize(4.5),
    fontWeight: '700',
    color: '#2c3e50',
    lineHeight: responsiveFontSize(5),
  },
  dateMonth: {
    fontSize: responsiveFontSize(2.8),
    fontWeight: '500',
    color: '#7f8c8d',
    textTransform: 'uppercase',
  },
  eventInfo: {
    flex: 1,
    paddingRight: responsiveWidth(2),
  },
  eventTitle: {
    fontSize: responsiveFontSize(3.8),
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: responsiveHeight(0.8),
  },
  eventMeta: {
    flexDirection: 'row',
    marginBottom: responsiveHeight(0.8),
  },
  tag: {
    paddingHorizontal: responsiveWidth(2.5),
    paddingVertical: responsiveHeight(0.5),
    borderRadius: 8,
    marginRight: responsiveWidth(2),
  },
  tagText: {
    fontSize: responsiveFontSize(2.8),
    fontWeight: '500',
  },
  remarksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remarksText: {
    fontSize: responsiveFontSize(2.8),
    color: '#7f8c8d',
    marginLeft: responsiveWidth(1),
  },
  imageContainer: {
    position: 'relative',
  },
  eventImage: {
    width: responsiveWidth(16),
    height: responsiveWidth(16),
    borderRadius: 12,
  },
  arrowContainer: {
    position: 'absolute',
    bottom: responsiveHeight(-1),
    right: responsiveWidth(-1),
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: responsiveWidth(1),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  }
});

export default EventCard;