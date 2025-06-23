import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors1 } from '../Styles/appStyle';

const StatusBadge = ({ status }) => {
  const isCompleted = status === 'Completed';
  
  return (
    <View style={[styles.badge, isCompleted ? styles.completedBadge : styles.activeBadge]}>
      <Text style={[styles.badgeText, isCompleted ? styles.completedText : styles.activeText]}>
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: colors1.primaryLight,
  },
  completedBadge: {
    backgroundColor: '#e8f5e8',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: colors1.primary,
  },
  completedText: {
    color: colors1.success,
  },
});

export default StatusBadge;