import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Linking,
  Alert,
  Modal,
  TouchableOpacity,
  Text
} from 'react-native';
import { useNavigation, useRouter } from "expo-router";
import HeaderComponent from '../components/HeaderComponent';
import EmptyMessage from '../components/EmptyMessage';
import Loader from '../components/old_components/Loader';
import ApplyButton from '../components/ApplyButton';
import TrainingCard from '../components/TrainingCard';
import ImageViewer from 'react-native-image-zoom-viewer';
import TrainingModalContent from '../components/TrainingModalContent';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import ConfirmationModal from '../components/ConfirmationModal';
import { getEmpTrainingList, getTrainingData } from '../services/productServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProgramCard from '../components/ProgramCard';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const responsiveWidth = (percentage) => width * (percentage / 100);
const responsiveHeight = (percentage) => height * (percentage / 100);

const TrainingScreen = () => {
  const router = useRouter();
  const navigate = useNavigation();
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const EmpId = await AsyncStorage.getItem('empId')
        const res = await getEmpTrainingList(EmpId);
        setTrainingSessions(res.data);
      } catch (error) {
        console.error("Error fetching training sessions:", error);
        // Alert.alert("Error", "Failed to load training sessions");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const EmpId = await AsyncStorage.getItem('empId');
      const res = await getEmpTrainingList(EmpId);
      setTrainingSessions(res.data);
    } catch (error) {
      console.error("Error refreshing training sessions:", error);
    } finally {
      setRefreshing(false);
    }
  };

  
  const handleExploreTrainings = () => {  
    router.push({
      pathname: 'AvailableTrainings',
    });
  };

const showTrainerDetails = (trainer) => {  
  router.push({
    pathname: 'TrainerDetails',
    params: {
      name: trainer.trainer_name,
      bio: trainer.description,
      rating: 4,
      experience: 5,
      location: trainer.location,
      Organization: trainer.trainer_organisation,
      module: trainer?.t_module_data.name,
      program: trainer.name
    }
  });
};

const showModuleDetailsAndCertificate = (item) => {

  router.push({
    pathname: 'ModuleDetails',
    params: {
      item: JSON.stringify(item), // Send as a string if needed
    },
  });
};


  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderComponent 
        headerTitle="My Trainings" 
        onBackPress={() => navigate.goBack()} 
        showActionButton={false}
      />
      <View style={styles.container}>
        {loading ? (
          <Loader visible={loading} />
        ) : (
          <ScrollView 
            style={styles.contentContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#9Bd35A', '#689F38']}
              />
            }
          >
            {trainingSessions.length > 0 ? (
              <FlatList
                data={trainingSessions}
                renderItem={({ item }) => (
                  // <TrainingCard item={item.t_session_data} onPress={() => handleCardPress(item)} />
                  <ProgramCard
                      program={item}
                      cardType="enrolled"
                      onPress={() => showModuleDetailsAndCertificate(item)}
                      onTrainerPress={() => showTrainerDetails(item.t_session_data)}
                      showProgress={item.training_status === 'P'}
                    />
                )}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <EmptyMessage 
                message="No training sessions found"
                subMessage="You haven't enrolled in any training sessions yet"
                iconName="school"
                data="training"
              />
            )}
          </ScrollView>
        )}

        <ApplyButton             
          onPress={handleExploreTrainings}
          buttonText="Explore Available Trainings"
          iconName="search"
        />
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: responsiveWidth(4),
  },
  contentContainer: {
    flex: 1,
    paddingTop: responsiveWidth(5),
  },
  scrollContent: {
    paddingBottom: responsiveHeight(12),
  },
  listContent: {
    paddingBottom: responsiveHeight(2),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    flex: 1,
  },
  headerButtonsContainer: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
    padding: 5,
  },
  activeHeaderButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
});

export default TrainingScreen;