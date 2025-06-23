import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import CustomButton from './CustomButton';
import StatusBadge from './StatusBadge';
import { colors1 } from '../Styles/appStyle';

const ProgramCard = ({ 
  program, 
  onPress, 
  showProgress = false, 
  showEnrollButton = false,
  onEnrollPress,
  onTrainerPress,
  cardType  // 'session' or 'enrolled'
}) => {
  // Determine if this is an enrolled training or session data
  const isEnrolledTraining = cardType === 'enrolled' || program.t_session_data;
  
  // Extract data based on structure
  const getTrainingData = () => {
    if (isEnrolledTraining) {
      return {
        name: program.t_session_data?.name || program.name,
        module: program.t_session_data?.t_module_data || program.t_module_data,
        trainer: program.t_session_data?.trainer_name || program.trainer_name,
        location: program.t_session_data?.location || program.location,
        sessionDate: program.t_session_data?.session_date || program.session_date,
        description: program.t_session_data?.description || program.description,
        image: program.t_session_data?.t_module_data?.image || program.image,
        score: program.t_score,
        status: program.training_status,
        isApproved: program.is_approved,
        isQualified: program.is_qualified,
        completedDate: program.completed_date,
        certificateFile: program.certificate_file,
        employeeName: program.employee_name,
        empId: program.emp_id
      };
    } else {
      return {
        name: program.name,
        module: program.t_module_data,
        trainer: program.trainer_name,
        location: program.location,
        sessionDate: program.session_date,
        description: program.description,
        image: program.t_module_data.image,
        maxAttendance: program.max_attendance_count
      };
    }
  };

  const data = getTrainingData();
  
  // Get status for badge
  const getStatusInfo = () => {
    if (isEnrolledTraining) {
      switch (data.status) {
        case 'E': return { label: 'Enrolled', color: colors1.primary };
        case 'A': return { label: 'Attended', color: '#2196F3' };
        case 'S': return { label: 'Successfully Completed', color: '#4CAF50' };
        case 'F': return { label: 'Failed', color: '#F44336' };
        case 'N': return { label: 'Not Attended', color: '#FF5722' };
        case 'X': return { label: 'Cancelled', color: '#9E9E9E' };
        default: return { label: 'Active', color: colors1.primary };
      }
    }
    return { label: 'Available', color: colors1.primary };
  };

  const statusInfo = getStatusInfo();

  // Get default image or placeholder
  // const getImageSource = () => {
  //   if (data.image) {
  //     return { uri: data.image };
  //   }
  //   // Return a placeholder or default training image
  //   return require('../assets/default-training.png'); // Add your default image
  // };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header Section with Image and Status */}
      <View style={styles.headerSection}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: data.image }}
            style={styles.trainingImage}
            resizeMode="cover"
          />
          <View style={styles.imageGradient} />
        </View>
        
        <View style={styles.headerOverlay}>
          <View style={styles.statusContainer}>
            <StatusBadge 
              status={statusInfo.label} 
              backgroundColor={statusInfo.color}
            />
            {data.certificateFile && (
              <View style={[styles.badge, styles.certificateBadge]}>
                <Text style={styles.badgeText}>📜</Text>
              </View>
            )}
          </View>
          
          <View style={styles.headerContent}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {data.name}
            </Text>
            <Text style={styles.moduleCode}>
              {data.module?.training_code || 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
        {/* Module Information */}
        <View style={styles.moduleInfo}>
          <View style={styles.moduleHeader}>
            <Text style={styles.moduleTitle}>{data.module?.name || 'General Training'}</Text>
            <View style={styles.moduleDetails}>
              <Text style={styles.moduleDetail}>
                {data.module?.no_of_days || 1} Days • {data.module?.no_of_credit || 1} Credits
              </Text>
            </View>
          </View>
          
          {data.module?.is_mandatory && (
            <View style={styles.mandatoryBadge}>
              <Text style={styles.mandatoryText}>Mandatory</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {data.description && (
          <Text style={styles.description} numberOfLines={2}>
            {data.description}
          </Text>
        )}

        {/* Training Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>👨‍🏫 Trainer</Text>
              <TouchableOpacity onPress={onTrainerPress}>
                <Text style={[styles.detailValue, styles.trainerLink]} numberOfLines={1}>
                  {data.trainer || 'Not assigned'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>📅 Date</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {data.sessionDate || 'TBD'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>📍 Location</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {data.location || 'Not specified'}
              </Text>
            </View>
            
            {isEnrolledTraining && data.score && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>🏆 Score</Text>
                <Text style={[styles.detailValue, styles.scoreValue]} numberOfLines={1}>
                  {data.score}%
                </Text>
              </View>
            )}
            
            {!isEnrolledTraining && data.maxAttendance && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>👥 Max Attendance</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {data.maxAttendance}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Progress Section for Enrolled Trainings */}
        {showProgress && isEnrolledTraining && data.status === 'P' && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPercentage}>65%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: '65%' }]} />
            </View>
          </View>
        )}

        {/* Enrolled Training Specific Info */}
        {isEnrolledTraining && (
          <View style={styles.enrollmentInfo}>
            <View style={styles.enrollmentRow}>
              <Text style={styles.enrollmentLabel}>Employee: {data.empId}</Text>
              {data.isApproved && (
                <View style={styles.approvedBadge}>
                  <Text style={styles.approvedText}>✓ Approved</Text>
                </View>
              )}
            </View>
            
            {data.completedDate && (
              <Text style={styles.completedDate}>
                Completed on: {data.completedDate}
              </Text>
            )}
          </View>
        )}

        {/* Action Button */}
        {showEnrollButton && (
          <View style={styles.buttonContainer}>
            <CustomButton
              title="Enroll Now"
              onPress={onEnrollPress}
              style={styles.enrollButton}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors1.white,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  
  // Header Section
  headerSection: {
    position: 'relative',
    height: 180,
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  trainingImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    justifyContent: 'space-between',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  certificateBadge: {
    minWidth: 32,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors1.white,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  moduleCode: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },

  // Content Section
  contentSection: {
    padding: 16,
  },
  moduleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleHeader: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors1.text,
    marginBottom: 2,
  },
  moduleDetails: {
    flexDirection: 'row',
  },
  moduleDetail: {
    fontSize: 12,
    color: colors1.subText,
    fontWeight: '500',
  },
  mandatoryBadge: {
    backgroundColor: '#FFE0E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mandatoryText: {
    fontSize: 10,
    color: '#D32F2F',
    fontWeight: '600',
  },

  description: {
    fontSize: 14,
    color: colors1.subText,
    lineHeight: 20,
    marginBottom: 16,
  },

  // Details Grid
  detailsGrid: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: colors1.subText,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: colors1.text,
    fontWeight: '600',
  },
  trainerLink: {
    color: colors1.primary,
  },
  scoreValue: {
    color: '#4CAF50',
  },

  // Progress Section
  progressSection: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: colors1.text,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 14,
    color: colors1.primary,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors1.primary,
    borderRadius: 3,
  },

  // Enrollment Info
  enrollmentInfo: {
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  enrollmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  enrollmentLabel: {
    fontSize: 12,
    color: colors1.text,
    fontWeight: '500',
  },
  approvedBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  approvedText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '600',
  },
  completedDate: {
    fontSize: 12,
    color: colors1.subText,
    fontStyle: 'italic',
  },

  // Button
  buttonContainer: {
    marginTop: 8,
  },
  enrollButton: {
    paddingVertical: 12,
    borderRadius: 8,
  },
});

export default ProgramCard;