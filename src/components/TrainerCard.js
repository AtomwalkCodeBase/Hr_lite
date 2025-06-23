import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors1 } from '../Styles/appStyle';

const TrainerCard = ({ trainer }) => {
  return (
    <View style={styles.card}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatar}>
          {trainer.name.split(' ').map(n => n[0]).join('')}
        </Text>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.name}>{trainer.name}</Text>
        <Text style={styles.title}>Professional Trainer</Text>
        
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{trainer.experience || '5+ years'}</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{trainer.rating || '4.8'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors1.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors1.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors1.white,
  },
  info: {
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: colors1.text,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: colors1.subText,
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors1.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors1.subText,
    textTransform: 'uppercase',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors1.primaryLight,
  },
});

export default TrainerCard;