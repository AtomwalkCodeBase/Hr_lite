import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const responsiveFontSize = (percentage) => Math.round(width * (percentage / 100));

const RequestCard = ({ item, onPress }) => {
  // Status configuration with colors and icons
  const statusConfig = {
    approved: { color: '#4CAF50', icon: 'checkmark-circle' },
    rejected: { color: '#F44336', icon: 'close-circle' },
    pending: { color: '#FF9800', icon: 'time' },
    default: { color: '#2196F3', icon: 'information-circle' }
  };

  // Determine status configuration based on item status
  const { color: statusColor, icon: statusIcon } = (() => {
    const status = item.status_display?.toLowerCase();
    if (status?.includes('approved')) return statusConfig.approved;
    if (status?.includes('rejected') || status?.includes('denied')) return statusConfig.rejected;
    if (status?.includes('pending')) return statusConfig.pending;
    return statusConfig.default;
  })();

  // Card content component
  const CardContent = () => (
    <View style={styles.cardContainer}>
      {/* Main card content */}
      <View style={styles.cardContent}>
        {/* Header with title and status */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Ionicons name="document-text" size={20} color="#3F51B5" />
            <Text style={styles.requestTitle} numberOfLines={1}>
              {item.request_sub_type || 'Resource Request'}
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Ionicons name={statusIcon} size={16} color="white" />
            <Text style={styles.statusBadgeText}>{item.status_display}</Text>
          </View>
        </View>

        {/* Card body with details */}
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="id-card" size={16} color="#607D8B" />
            <Text style={styles.infoText}>Request ID: {item.request_id}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color="#607D8B" />
            <Text style={styles.infoText}>{item.created_date}</Text>
          </View>
          
          {item.remarks && (
            <View style={styles.infoRow}>
              <Ionicons name="chatbubbles" size={16} color="#607D8B" />
              <Text style={[styles.infoText, styles.remarksText]} numberOfLines={2}>
                {item.remarks}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* View Details button with gradient */}
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#5C6BC0', '#3949AB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>View Details</Text>
          <Ionicons name="arrow-forward" size={18} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Return either touchable or regular version based on onPress prop
  return onPress ? (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <CardContent />
    </TouchableOpacity>
  ) : (
    <CardContent />
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: 'white',
    overflow: 'hidden',
    shadowColor: '#1A237E',
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
  requestTitle: {
    fontSize: responsiveFontSize(4),
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
    minWidth: 80,
    justifyContent: 'center',
  },
  statusBadgeText: {
    fontSize: responsiveFontSize(3.2),
    color: 'white',
    fontWeight: '500',
    marginLeft: 5,
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: responsiveFontSize(3.5),
    color: '#455A64',
    marginLeft: 8,
  },
  remarksText: {
    fontStyle: 'italic',
    color: '#78909C',
  },
  actionButton: {
    borderTopWidth: 1,
    borderTopColor: '#ECEFF1',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: responsiveFontSize(3.8),
    fontWeight: '600',
    marginRight: 8,
  },
});

export default RequestCard;