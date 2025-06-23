import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors1 } from '../Styles/appStyle';
import { router, useLocalSearchParams } from 'expo-router';
import HeaderComponent from '../components/HeaderComponent';

const TrainerDetailsScreen = () => {
  const { name, program, module, location, experience, rating, bio, Organization } = useLocalSearchParams();

  	const handleBackPress = () => {
	  router.navigate({
		pathname: 'AvailableTrainings',
	  });
	};

  return (
	<>
 			<HeaderComponent 
     	  	headerTitle="More Options" 
         	onBackPress={handleBackPress} 
          	headerStyle={{ backgroundColor: '#7e57c2' }}
        />
		<ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

         <View style={styles.card}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatar}>
                  {name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              
              <View style={styles.info}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.title}>Professional Trainer</Text>
                
                {/* <View style={styles.stats}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{experience || '5+ years'}</Text>
                    <Text style={styles.statLabel}>Experience</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{rating || '4.8'}</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                  </View>
                </View> */}
              </View>
            </View>
        
         <View style={styles.detailsContainer}>
           <View style={styles.section}>
             <Text style={styles.sectionTitle}>About</Text>
             <Text style={styles.sectionText}>
              {bio}
              </Text>
           </View>
           <View style={styles.section}>
             <Text style={styles.sectionTitle}>Organization</Text>
             <Text style={styles.sectionText}>
              {Organization}
              </Text>
           </View>
           <View style={styles.section}>
             <Text style={styles.sectionTitle}>Specializations</Text>
             <View style={styles.tagContainer}>
               <View style={styles.tag}>
                 <Text style={styles.tagText}>{module}</Text>
               </View>
               {/* <View style={styles.tag}>
                 <Text style={styles.tagText}>Professional Training</Text>
               </View>
               <View style={styles.tag}>
                 <Text style={styles.tagText}>Skill Development</Text>
               </View> */}
             </View>
           </View>
           <View style={styles.section}>
             <Text style={styles.sectionTitle}>Current Program</Text>
             <View style={styles.programInfo}>
               <Text style={styles.programName}>{program}</Text>
               <Text style={styles.programDetails}>Location: {location}</Text>
               <Text style={styles.programDetails}>Module: {module}</Text>
             </View>
           </View>
         </View>
       </ScrollView>
	</>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors1.background,
  },
  scrollContainer: {
    padding: 20,
  },
  detailsContainer: {
    marginTop: 20,
  },
  section: {
    backgroundColor: colors1.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors1.text,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: colors1.subText,
    lineHeight: 24,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: colors1.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    color: colors1.primary,
    fontWeight: '500',
  },
  programInfo: {
    padding: 16,
    backgroundColor: colors1.primaryLight,
    borderRadius: 8,
  },
  programName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors1.text,
    marginBottom: 8,
  },
  programDetails: {
    fontSize: 14,
    color: colors1.subText,
    marginBottom: 4,
  },
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

export default TrainerDetailsScreen;