import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgramCard from '../components/ProgramCard';
import CustomButton from '../components/CustomButton';
import { colors1 } from '../Styles/appStyle';
import HeaderComponent from '../components/HeaderComponent';
import { router, useNavigation } from 'expo-router';
import { EnrollEmpTraining, getTrainingData } from '../services/productServices';
import { processEmpTraining } from '../services/ConstantServies';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfirmationModal from '../components/ConfirmationModal';
import SuccessModal from '../components/SuccessModal';
import Loader from '../components/old_components/Loader';
import { AppContext } from '../../context/AppContext';
import ErrorModal from '../components/ErrorModal';
import EmptyMessage from '../components/EmptyMessage';

const TrainingListScreen = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const [enrollingItem, setEnrollingItem] = useState(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [SuccessModalMessage, setSuccessModalMessage] = useState(false);
  const [isErrorVisiable, setIsErrorVisiable] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  


    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const res = await getTrainingData();
          setPrograms(res.data);
        } catch (error) {
          console.error("Error fetching training sessions:", error);
          Alert.alert("Error", "Failed to load training sessions");
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }, []);

    const handleBackPress = () => {
    router.navigate({
      pathname: 'TrainingScr',
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

const handleEnrollPress = (item) => {
  setShowModal(true);
  setEnrollingItem(item); // Optional — in case you still want it
};

const confirmButton = async (item) => {
  setShowModal(false);
  setIsErrorVisiable(false); // Reset error state before API call
  setErrorMessage(""); // Clear previous error message
  setLoading(true);

  try {
    const EmpId = await AsyncStorage.getItem("empId");
    if (!EmpId) {
      throw new Error("Employee ID not found");
    }

    const formData = new FormData();
    formData.append("emp_id", EmpId);
    formData.append("call_mode", "ENROLL");
    formData.append("t_session_id", item.id.toString());
    formData.append("training_id", "");
    formData.append("remarks", "");

    const res = await EnrollEmpTraining(formData);

    if (res.status === 200) {
      setIsSuccessModalVisible(true);
      setSuccessModalMessage("Enrollment Successful");
    } else {
      // Handle non-200 status codes
      throw new Error(res?.data?.message || "Enrollment failed");
    }
  } catch (error) {
    // console.error("Enrollment Error:", error);
    setIsErrorVisiable(true);
     if (error?.response?.data?.message.includes('Invalid request - ')) {
          const msg = error?.response?.data?.message;
          const afterText = msg.split('Invalid request -')[1]?.trim() || '';
          setErrorMessage(afterText )
     }
    // setErrorMessage(error.message || "An error occurred during enrollment");
  } finally {
    setLoading(false);
  }
};



const cancelButton = () => {
  setShowModal(false);
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <HeaderComponent 
        headerTitle="Training List" 
        onBackPress={handleBackPress} 
        headerStyle={{ backgroundColor: '#7e57c2' }}
      />
      {programs.length > 0 ? (
          <FlatList
            data={programs}
            renderItem={({item}) => (
              <ProgramCard
                program={item}
                cardType="session"
                onPress={() => showModuleDetailsAndCertificate(item)}
                onTrainerPress={() => showTrainerDetails(item)}
                showEnrollButton={true}
                onEnrollPress={() => handleEnrollPress(item)}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyMessage 
            message="No training sessions found"
            subMessage="Wait for the training sessions to be added"
            iconName="school"
            data="training"

          />
       ) }


      <ConfirmationModal
        visible={showModal}
        message="Do you want to Enroll this certificate?"
        onConfirm={() => confirmButton(enrollingItem)} 
        onCancel={cancelButton}
        confirmText="Yes"
        cancelText="Cancel"
      />

      <SuccessModal
        visible={isSuccessModalVisible}
        onClose={() => {
          setIsSuccessModalVisible(false);
          handleBackPress();
        }}
        message={SuccessModalMessage}
      />

      <Loader visible={loading} />

      <ErrorModal
        visible={isErrorVisiable}
        message={errorMessage}
        onClose={() => {setIsErrorVisiable(false)}}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors1.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors1.background,
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    padding: 20,
    backgroundColor: colors1.white,
    borderBottomWidth: 1,
    borderBottomColor: colors1.primaryLight,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors1.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors1.subText,
  },
  listContainer: {
    padding: 20,
  },
  programContainer: {
    marginBottom: 16,
  },
});

export default TrainingListScreen;