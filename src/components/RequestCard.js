import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../Styles/appStyle';

const { width } = Dimensions.get('window');

const responsiveFontSize = (percentage) => Math.round(width * (percentage / 100));

const RequestCard = ({ item, onPress, onUpdate, onResolve }) => {
  // Status configuration with colors and icons
  const statusConfig = {
    approved: { color: '#4CAF50', icon: 'check-circle', bgColor: '#E8F5E8', borderColor: '#4CAF50' },
    rejected: { color: '#f44336', icon: 'cancel', bgColor: '#FFEBEE', borderColor: '#f44336' },
    pending: { bgColor: '#FFF3E0', color: '#EF6C00', borderColor: '#FF9800', icon: 'schedule' },
    submitted: { color: '#2196F3', icon: 'schedule', bgColor: '#E3F2FD', borderColor: '#2196F3' },
    default: { color: '#9E9E9E', icon: 'help-outline', bgColor: '#F5F5F5', borderColor: '#9E9E9E' }
  };

  // Determine status configuration based on item status
  const { bgColor, borderColor, color: textColor, icon: statusIcon } = (() => {
    const status = item.status_display?.toLowerCase();
    if (status?.includes('approved')) return statusConfig.approved;
    if (status?.includes('rejected') || status?.includes('denied')) return statusConfig.rejected;
    if (status?.includes('pending')) return statusConfig.pending;
    if (status?.includes('submitted')) return statusConfig.submitted;
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
          
          <View style={[styles.statusBadge, { backgroundColor: bgColor, borderColor: borderColor }]}>
            <MaterialIcons name={statusIcon} size={16} color={textColor} />
            <Text style={[styles.statusBadgeText, { color: textColor }]}>{item.status_display}</Text>
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

      {/* Action buttons container */}
      <View style={styles.buttonsContainer}>
        {/* Update Details button */}
        {/* <TouchableOpacity 
          style={[styles.actionButton, styles.updateButton]}
          onPress={onUpdate}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#26A69A', '#00897B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Update Details</Text>
            <Ionicons name="create" size={18} color="white" />
          </LinearGradient>
        </TouchableOpacity> */}
        
        {/* View Details button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onUpdate}
          activeOpacity={0.8}
        >
          <View
            style={styles.button}
          >
             <Ionicons name="create-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>Update</Text>
            {/* <Ionicons name="arrow-forward" size={18} color="white" /> */}
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onResolve}
          activeOpacity={0.8}
        >
          <View
            style={styles.button}
          >
            <MaterialCommunityIcons name="checkbox-marked-outline" size={18} color="white" />
            <Text style={styles.buttonText}>Resolve</Text>
            {/* <Ionicons name="arrow-forward" size={18} color="white" /> */}
          </View>
        </TouchableOpacity>
      </View>
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
    borderColor: '#cccc',
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
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
    margin: 5,
    // borderTopWidth: 1,
    // borderTopColor: '#ECEFF1',
  },
  actionButton: {
    flex: 1,
    paddingBottom: 5
  },
  updateButton: {
    borderRightWidth: 1,
    borderRightColor: '#ECEFF1',
  },
  button: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6
  },
  buttonText: {
    color: 'white',
    fontSize: responsiveFontSize(3.8),
    fontWeight: '600',
    marginRight: 8,
  },
});

export default RequestCard;