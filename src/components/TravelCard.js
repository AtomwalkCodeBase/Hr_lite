import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { 
  Ionicons, 
  MaterialIcons, 
  MaterialCommunityIcons,
  FontAwesome 
} from '@expo/vector-icons';
import { colors } from '../Styles/appStyle';

const { width } = Dimensions.get('window');

const responsiveFontSize = (percentage) => Math.round(width * (percentage / 100));

const TravelCard = ({ item, onPress, onUpdate }) => {
  // Status configuration with colors and icons
  const statusConfig = {
    booked: { color: '#4CAF50', icon: 'check-circle', bgColor: '#E8F5E8', borderColor: '#4CAF50' },
    submitted: { color: '#2196F3', icon: 'schedule', bgColor: '#E3F2FD', borderColor: '#2196F3' },
    approved: { color: '#673AB7', icon: 'verified', bgColor: '#EDE7F6', borderColor: '#673AB7' },
    rejected: { color: '#F44336', icon: 'cancel', bgColor: '#FFEBEE', borderColor: '#F44336' },
    cancelled: { color: '#F44336', icon: 'cancel', bgColor: '#FFEBEE', borderColor: '#F44336' },
    default: { color: '#FF9800', icon: 'help-outline', bgColor: '#FFF3E0', borderColor: '#FF9800' }
  };

  // Enhanced travel mode configuration with icons and display names
  const travelModeConfig = {
    'flight': { 
      icon: 'flight', 
      iconSet: MaterialIcons, 
      color: '#3F51B5',
      displayName: 'Flight'
    },
    'by flight': { 
      icon: 'flight', 
      iconSet: MaterialIcons, 
      color: '#3F51B5',
      displayName: 'Flight'
    },
    'air': { 
      icon: 'flight', 
      iconSet: MaterialIcons, 
      color: '#3F51B5',
      displayName: 'Flight'
    },
    'train': { 
      icon: 'train', 
      iconSet: MaterialCommunityIcons, 
      color: '#795548',
      displayName: 'Train'
    },
    'bus': { 
      icon: 'bus', 
      iconSet: MaterialCommunityIcons, 
      color: '#FF9800',
      displayName: 'Bus'
    },
    'car': { 
      icon: 'taxi', 
      iconSet: MaterialCommunityIcons, 
      color: '#FF5722',
      displayName: 'Taxi'
    },
    'slf': { 
      icon: 'car', 
      iconSet: MaterialCommunityIcons, 
      color: '#607D8B',
      displayName: 'Own Car'
    },
    'oth': { 
      icon: 'directions', 
      iconSet: MaterialIcons, 
      color: '#9C27B0',
      displayName: 'Other'
    },
    
    default: { 
      icon: 'directions-transit', 
      iconSet: MaterialIcons, 
      color: '#607D8B',
      displayName: 'Travel'
    }
  };

  // Get travel mode config with better matching logic
  const getTravelModeConfig = (mode) => {
    if (!mode) return travelModeConfig.default;
    
    const normalizedMode = mode.toLowerCase().trim();
    
    // Check exact matches first
    if (travelModeConfig[normalizedMode]) {
      return travelModeConfig[normalizedMode];
    }
    
    // Check partial matches
    const modes = Object.keys(travelModeConfig);
    const matchedMode = modes.find(key => 
      key !== 'default' && normalizedMode.includes(key)
    );
    
    return matchedMode ? travelModeConfig[matchedMode] : travelModeConfig.default;
  };

  // Determine status configuration based on item status
  const { bgColor, borderColor, color: textColor, icon: statusIcon } = (() => {
    const status = item.status_display?.toLowerCase();
    if (status?.includes('booked')) return statusConfig.booked;
    if (status?.includes('submitted')) return statusConfig.submitted;
    if (status?.includes('approved')) return statusConfig.approved;
    if (status?.includes('rejected')) return statusConfig.rejected;
    if (status?.includes('cancelled')) return statusConfig.cancelled;
    return statusConfig.default;
  })();

  const isSubmitted = item.status_display?.toLowerCase().includes('draft');
  const travelMode = getTravelModeConfig(item.travel_mode);
  const TravelModeIcon = travelMode.iconSet;

  // Simple date display without formatting
  const displayDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dateString;
  };

  // Create styles dynamically based on component state
  const dynamicStyles = StyleSheet.create({
    updateButton: {
      flex: isSubmitted ? 1 : 0,
    },
  });

  const CardContent = () => (
    <View style={styles.cardContainer}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <TravelModeIcon 
              name={travelMode.icon} 
              size={20} 
              color={travelMode.color} 
            />
            <Text style={styles.travelId}>{item.travel_id}</Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: bgColor, borderColor }]}>
            <MaterialIcons name={statusIcon} size={16} color={textColor} />
            <Text style={[styles.statusBadgeText, { color: textColor }]}>{item.status_display}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.destinationRow}>
            <MaterialIcons name="place" size={18} color="#607D8B" />
            <Text style={styles.destinationText}>{item.to_city}</Text>
          </View>

          <View style={styles.datesRow}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <View style={styles.dateValueContainer}>
                <MaterialIcons name="date-range" size={16} color="#607D8B" />
                <Text style={styles.dateValue}>{displayDate(item.start_date)}</Text>
              </View>
            </View>
            
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>End Date</Text>
              <View style={styles.dateValueContainer}>
                <MaterialIcons name="date-range" size={16} color="#607D8B" />
                <Text style={styles.dateValue}>{displayDate(item.end_date)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <TravelModeIcon 
                name={travelMode.icon} 
                size={16} 
                color={travelMode.color} 
              />
              <Text style={[styles.detailText, { color: travelMode.color }]}>
                {travelMode.displayName}
              </Text>
            </View>
            
           {item.project_name && <View style={styles.detailItem}>
              <MaterialIcons name="work" size={16} color="#607D8B" />
              <Text style={styles.detailText}>{item.project_name}</Text>
            </View>}
          </View>

          {item.advance_required && (
            <View style={styles.advanceRow}>
              <MaterialIcons name="attach-money" size={16} color="#607D8B" />
              <Text style={styles.advanceText}>Advance: ₹{item.advance_amt}</Text>
            </View>
          )}

          {item.travel_purpose && (
            <View style={styles.purposeRow}>
              <MaterialIcons name="info" size={16} color="#607D8B" />
              <Text style={styles.purposeText}>{item.travel_purpose}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        {isSubmitted && (
          <TouchableOpacity 
            style={[styles.actionButton, dynamicStyles.updateButton]}
            onPress={onUpdate}
            activeOpacity={0.8}
          >
            <View style={styles.button}>
              <MaterialIcons name="edit" size={18} color="#fff" />
              <Text style={styles.buttonText}>Update</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <View style={styles.button}>
            <Text style={styles.buttonText}>View Details</Text>
            <MaterialIcons name="arrow-forward" size={18} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return onPress ? (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <CardContent />
    </TouchableOpacity>
  ) : (
    <CardContent />
  );
};

// Static styles (not dependent on component state/props)
const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: 'white',
    overflow: 'hidden',
    shadowColor: '#1A237E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  travelId: {
    fontSize: responsiveFontSize(3.8),
    fontWeight: '600',
    color: '#303F9F',
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: responsiveFontSize(3.4),
    fontWeight: '600',
    marginLeft: 5,
  },
  cardBody: {
    marginBottom: 12,
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  destinationText: {
    fontSize: responsiveFontSize(4),
    fontWeight: '600',
    color: '#37474F',
    marginLeft: 8,
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateContainer: {
    width: '48%',
  },
  dateLabel: {
    fontSize: responsiveFontSize(3.2),
    color: '#78909C',
    marginBottom: 4,
  },
  dateValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateValue: {
    fontSize: responsiveFontSize(3.6),
    fontWeight: '500',
    color: '#455A64',
    marginLeft: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  detailText: {
    fontSize: responsiveFontSize(3.5),
    color: '#455A64',
    marginLeft: 8,
  },
  advanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ECEFF1',
  },
  advanceText: {
    fontSize: responsiveFontSize(3.5),
    color: '#455A64',
    marginLeft: 8,
    fontWeight: '500',
  },
  purposeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  purposeText: {
    fontSize: responsiveFontSize(3.5),
    color: '#546E7A',
    marginLeft: 8,
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ECEFF1',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  button: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: responsiveFontSize(3.8),
    fontWeight: '600',
  },
});

export default TravelCard;