import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Linking,
  Alert
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const responsiveFontSize = (percentage) => Math.round(width * (percentage / 100));
const responsiveWidth = (percentage) => width * (percentage / 100);

const TrainingCard = ({ 
  item, 
  onPress,
  onUnenroll,
  style = {}
}) => {
  const handleCertificatePress = () => {
    if (item.certificate_file) {
      Linking.openURL(item.certificate_file);
    }
  };

  const handleUnenrollPress = () => {
    Alert.alert(
      'Unenroll from Course',
      `Are you sure you want to unenroll from "${item.t_session.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unenroll',
          style: 'destructive',
          onPress: () => onUnenroll && onUnenroll(item),
        },
      ]
    );
  };

  const shouldShowUnenrollButton = () => {
    // Only show unenroll button if status is 'E' (Enrolled)
    if (item.training_status !== 'E') return false;
    
    const currentDate = new Date();
    
    // Parse DD-MM-YYYY format
    const parseDate = (dateString) => {
      if (!dateString) return null;
      const [day, month, year] = dateString.split('-');
      return new Date(year, month - 1, day); // month is 0-indexed
    };
    
    const createdDate = parseDate(item.t_session.created_date);
    const sessionDate = parseDate(item.t_session.session_date);
    
    if (!createdDate || !sessionDate) return false;
    
    // Check if within 3 days of created_date
    const daysDifference = Math.ceil((currentDate - createdDate) / (1000 * 60 * 60 * 24));
    
    // Check if session_date hasn't passed
    const sessionNotPassed = sessionDate >= currentDate;
    
    return daysDifference <= 3 && sessionNotPassed;
  };

  const statusConfig = getStatusConfig(item.training_status);

  // console.log("Item Data===", item);

  return (
    <TouchableOpacity 
      style={[styles.cardContainer, style]}
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* Gradient Background Overlay */}
      <View style={styles.gradientOverlay} />
      
      {/* Header with title and status */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.module} numberOfLines={1}>
            {item.t_module_data.name || 'General Training'}
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusConfig.color }]}>
          <MaterialCommunityIcons 
            name={statusConfig.icon} 
            size={14} 
            color="#ffffff" 
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>
            {statusConfig.text}
          </Text>
        </View>
      </View>

      {/* Course Image */}
      {item.t_module_data.image && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.t_module_data.image }} 
            style={styles.courseImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
        </View>
      )}

      {/* Course details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="account-tie" size={18} color="#4f46e5" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Trainer</Text>
            <Text style={styles.detailText}>
              {item.trainer_name || 'Not specified'}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="schedule" size={18} color="#059669" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Session Date</Text>
            <Text style={styles.detailText}>
              {item.session_date || 'Not scheduled'}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="map-marker" size={18} color="#dc2626" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailText}>
              {item.location || 'Not specified'}
            </Text>
          </View>
        </View>
      </View>

      {/* Description */}
      {item.t_module_data.remarks && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText} numberOfLines={2}>
            {item.t_module_data.remarks}
          </Text>
        </View>
      )}

      {/* Footer with certificate, score and unenroll */}
      <View style={styles.footer}>
        <View style={styles.leftFooter}>
          {item.certificate_file && (
            <TouchableOpacity
              style={styles.certificateButton}
              onPress={handleCertificatePress}
            >
              <MaterialCommunityIcons name="certificate" size={18} color="#f59e0b" />
              <Text style={styles.certificateText}>Certificate</Text>
            </TouchableOpacity>
          )}

          {item.t_score > 0 && (
            <View style={styles.scoreContainer}>
              <MaterialCommunityIcons name="trophy" size={16} color="#10b981" />
              <Text style={styles.scoreText}>
                {item.t_score}%
              </Text>
            </View>
          )}
        </View>

        {shouldShowUnenrollButton() && (
          <TouchableOpacity
            style={styles.unenrollButton}
            onPress={handleUnenrollPress}
          >
            <MaterialCommunityIcons name="exit-to-app" size={16} color="#ef4444" />
            <Text style={styles.unenrollText}>Unenroll</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Remarks */}
      {item.remarks && (
        <View style={styles.remarksContainer}>
          <MaterialCommunityIcons name="note-text" size={14} color="#6b7280" />
          <Text style={styles.remarksText}>{item.remarks}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const getStatusConfig = (status) => {
  const statusMap = {
    'E': { 
      text: 'Enrolled', 
      color: '#3b82f6', 
      icon: 'account-plus' 
    },
    'A': { 
      text: 'Attended', 
      color: '#10b981', 
      icon: 'check-circle' 
    },
    'S': { 
      text: 'Successfully Completed', 
      color: '#059669', 
      icon: 'trophy' 
    },
    'F': { 
      text: 'Failed', 
      color: '#ef4444', 
      icon: 'close-circle' 
    },
    'N': { 
      text: 'Not Attended', 
      color: '#6b7280', 
      icon: 'account-remove' 
    },
    'X': { 
      text: 'Cancelled', 
      color: '#9ca3af', 
      icon: 'cancel' 
    }
  };
  return statusMap[status] || { text: 'Enrolled', color: '#3b82f6', icon: 'account-plus' };
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#4f46e5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: responsiveFontSize(4.2),
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: responsiveFontSize(5.2),
    marginBottom: 4,
  },
  module: {
    fontSize: responsiveFontSize(3.4),
    color: '#6b7280',
    fontWeight: '500',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 100,
    justifyContent: 'center',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: '#ffffff',
    fontSize: responsiveFontSize(3),
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: 120,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  detailsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: responsiveFontSize(3),
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  detailText: {
    fontSize: responsiveFontSize(3.6),
    color: '#374151',
    fontWeight: '600',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: responsiveFontSize(3.4),
    color: '#6b7280',
    lineHeight: responsiveFontSize(4.6),
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#fafbfc',
  },
  leftFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  certificateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fef3c7',
    marginRight: 12,
  },
  certificateText: {
    fontSize: responsiveFontSize(3.2),
    color: '#d97706',
    marginLeft: 6,
    fontWeight: '600',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: responsiveFontSize(3.2),
    color: '#065f46',
    fontWeight: '700',
    marginLeft: 4,
  },
  unenrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  unenrollText: {
    fontSize: responsiveFontSize(3.2),
    color: '#ef4444',
    marginLeft: 6,
    fontWeight: '600',
  },
  remarksContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  remarksText: {
    fontSize: responsiveFontSize(3.2),
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
    fontStyle: 'italic',
  },
});

export default TrainingCard;