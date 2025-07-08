import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { Alert, Linking, ScrollView, View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { getClaimApprover, postClaimAction, validateClaimItem } from '../services/productServices';
import HeaderComponent from '../components/HeaderComponent';
import SuccessModal from '../components/SuccessModal';
import Loader from '../components/old_components/Loader';
import ImageViewer from 'react-native-image-zoom-viewer';
import { MaterialIcons } from '@expo/vector-icons';
import { AppContext } from '../../context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfirmationModal from '../components/ConfirmationModal';
import ClaimItemCard from '../components/ClaimItemCard';
import ClaimItemActions from '../components/ClaimItemActions';
import RemarksInput from '../components/RemarkInput';

const ApproveClaimDetails = (props) => {
  const { profile } = useContext(AppContext);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const [validationError, setValidationError] = useState(null);
  const [managers, setManagers] = useState([]);
  const [claim, setClaim] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemActions, setItemActions] = useState({});
  const [errors, setErrors] = useState({});
  const [validationResults, setValidationResults] = useState({});
  const [claimRemarks, setClaimRemarks] = useState('');

  const claimData = props?.claim_data;
  const callType = props?.claim_data?.callType;
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const approversRes = await getClaimApprover();
        setManagers(approversRes.data);

        if (claimData) {
          const parsedDetails = typeof claimData.claimDetails === 'string' 
            ? JSON.parse(claimData.claimDetails) 
            : claimData.claimDetails;
          
          setClaim(parsedDetails);
          
          if (parsedDetails.claim_items) {
            const sum = parsedDetails.claim_items.reduce(
              (total, item) => total + parseFloat(item.expense_amt || 0), 
              0
            );
            setTotalAmount(sum);
            
            const initialStates = {};
            const initialSelectedItems = [];
            
            parsedDetails.claim_items.forEach(item => {
              initialStates[item.id] = {
                action: null,
                approvedAmount: item.expense_amt.toString(),
                remarks: '',
                forwardManager: null
              };

              if (item.expense_status !== 'A' && item.expense_status !== 'R') {
                initialSelectedItems.push(item.id);
              }
            });
            
            setItemActions(initialStates);
            setSelectedItems(initialSelectedItems);
          }

          const validationData = {
            emp_id: profile?.emp_id,
            m_claim_id: claimData?.master_claim_id || parsedDetails?.master_claim_id
          };
          const validationResponse = await validateClaimItem(validationData);

          if (validationResponse.data) {
            const results = {};
            validationResponse.data.forEach(item => {
              results[item.claim_id] = {
                limitType: item.limit_type,
                limitRemarks: item.limit_remarks,
                forwardManager: item.approved_emp_id,
                approvalType: item.approval_type
              };
            });
            setValidationResults(results);
            setValidationError(null);
          } else if (validationResponse.message) {
            setValidationError(validationResponse.message);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setValidationError(error?.response?.data?.message || 'Failed to load claim data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [claimData, profile]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleBackPress = () => {
    if (selectedImageUrl) {
      setSelectedImageUrl(null);
    } else {
      router.push('ApproveClaim');
    }
  };

  const handleViewFile = (fileUrl) => {
    if (!fileUrl) return;
    
    const fileExtension = fileUrl.split('.').pop().split('?')[0].toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
      setSelectedImageUrl(fileUrl);
    } else if (fileExtension === 'pdf') {
      Alert.alert('File Downloading', 'The file is being downloaded.');
      Linking.openURL(fileUrl).catch((err) => console.error('Failed to open URL:', err));
    } else {
      console.warn('Unsupported file type:', fileExtension);
    }
  };

  const toggleItemExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const toggleItemSelection = (itemId) => {
    const item = claim.claim_items?.find(i => i.id === itemId);
    if (item?.expense_status === 'A' || item?.expense_status === 'R') return;
    
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    );
  };

  const toggleSelectAll = () => {
  if (!claim.claim_items) return;
  
  const actionableItems = claim.claim_items
    .filter(item => item.expense_status !== 'A' && item.expense_status !== 'R')
    .map(item => item.id);
  
  if (selectedItems.length === actionableItems.length) {
    setSelectedItems([]);
  } else {
    setSelectedItems([...actionableItems]);
  }
};

  const handleItemActionChange = (itemId, action) => {
    const item = claim.claim_items.find(i => i.id === itemId);
    if (item?.expense_status === 'A' || item?.expense_status === 'R') return;
    
    const validationResult = validationResults[item.claim_id];
    if (validationResult && validationResult.limitType !== 'N') return;
    
    setItemActions(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        action,
        approvedAmount: action === 'REJECT' 
          ? '0' 
          : (prev[itemId]?.approvedAmount || item.expense_amt.toString())
      }
    }));
  };

  const handleItemAmountChange = (itemId, amount) => {
    setItemActions(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        approvedAmount: amount
      }
    }));
  };

  // In ApproveClaimDetails.js
const handleItemRemarksChange = React.useCallback((itemId, remarks) => {
  setItemActions(prev => ({
    ...prev,
    [itemId]: {
      ...prev[itemId],
      remarks
    }
  }));
}, []);

  const handleItemForwardManagerChange = (itemId, managerId) => {
    setItemActions(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        forwardManager: managerId
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (claimRemarks.trim() === '') {
      newErrors.claimRemarks = 'Claim level remarks are required';
    }
    
    if (selectedItems.length === 0) {
      newErrors.selectedItems = 'Please select at least one item to take action';
      return newErrors;
    }

    selectedItems.forEach(itemId => {
      const item = itemActions[itemId];
      const originalItem = claim.claim_items.find(i => i.id === itemId);
      const validationResult = validationResults[originalItem.claim_id];
      
      if (!validationResult || validationResult.limitType === 'N') {
        if (item.action === 'APPROVE' || item.action === 'FORWARD') {
          if (!item.approvedAmount || item.approvedAmount.trim() === '') {
            newErrors[`itemAmount-${itemId}`] = 'Please enter an approved amount';
          }
          else if (isNaN(parseFloat(item.approvedAmount))) {
            newErrors[`itemAmount-${itemId}`] = 'Please enter a valid amount';
          }
          else if (parseFloat(item.approvedAmount) > parseFloat(originalItem.expense_amt)) {
            newErrors[`itemAmount-${itemId}`] = 'Approved amount cannot exceed claimed amount';
          }
        }
      }
    });
    
    return newErrors;
  };

  const formatIndianCurrency = (num) => {
  if (!num && num !== 0) return null; // handles null, undefined, empty string
  
  // Convert to number to handle cases like "12.00"
  const numberValue = Number(num);
  if (isNaN(numberValue)) return null;

  // Check if it's an integer (has no decimal or decimal is .00)
  const isInteger = Number.isInteger(numberValue);
  
  // Format the number based on whether it's an integer
  const numStr = isInteger ? numberValue.toString() : numberValue.toString();
  const parts = numStr.split('.');
  let integerPart = parts[0];
  const decimalPart = !isInteger && parts.length > 1 ? `.${parts[1]}` : '';

  // Format the integer part with Indian comma separators
  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  
  if (otherNumbers !== '') {
    integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  } else {
    integerPart = lastThree;
  }

  return `₹${integerPart}${decimalPart}`;
};

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setShowConfirmationModal(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmationModal(false);
    setIsLoading(true);
    
    try {
      const claim_list = selectedItems.map(itemId => {
        const item = itemActions[itemId];
        const originalItem = claim.claim_items.find(i => i.id === itemId);
        const validationResult = validationResults[originalItem.claim_id];
        
        const itemPayload = {
          claim_id: originalItem.claim_id,
          approve_type: validationResult?.approvalType || getApproveType(item.action),
          approved_amt: item.action === 'REJECT' ? '0' : item.approvedAmount,
          remarks: item.remarks || ''
        };

        if ((item.action === 'FORWARD' || validationResult?.limitType !== 'N') && 
            (validationResult?.forwardManager || item.forwardManager)) {
          itemPayload.a_emp_id = validationResult?.forwardManager || item.forwardManager;
        }

        return itemPayload;
      });

      const payload = {
        m_claim_id: claimData?.master_claim_id || claim?.master_claim_id,
        remarks: claimRemarks,
        call_mode: 'APPROVE_CLAIM',
        claim_list: claim_list
      };

      await postClaimAction(payload);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert(
        'Action Failed', 
        error.response?.data?.message || error.message || 'Failed to process claim'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getApproveType = (action) => {
    switch (action) {
      case 'APPROVE': return 'A';
      case 'REJECT': return 'R';
      case 'FORWARD': return 'F';
      case 'Back To Claimant': return 'B';
      default: return 'A';
    }
  };

  const ClaimItem = ({ item }) => {
    const validationResult = validationResults[item.claim_id];
    const isLimited = validationResult && validationResult.limitType !== 'N';
    const isDisabled = item.expense_status === 'A' || item.expense_status === 'R';
    const isSelected = selectedItems.includes(item.id);

    const toggleSelection = () => {
      if (isDisabled) return;  // Only check for disabled status (approved/rejected items)
      toggleItemSelection(item.id);
    };

    return (
      <ClaimItemCard
  item={item}
  isSelected={isSelected}
  isDisabled={isDisabled}
  isLimited={isLimited}  // Still pass the limit status for display purposes
  expanded={expandedItems[item.id]}
  onToggleExpand={() => toggleItemExpand(item.id)}
  onToggleSelect={toggleSelection}
  validationResult={validationResult}
>
        <View style={styles.itemDetails}>
          <View style={styles.detailSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expense Date:</Text>
              <Text style={styles.detailValue}>{item.expense_date}</Text>
            </View>
            {item.project_name && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Project:</Text>
                <Text style={styles.detailValue}>{item.project_name}</Text>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Original Remarks:</Text>
              <Text style={styles.detailValue}>{item.remarks || 'None'}</Text>
            </View>
            
            {item.submitted_file_1 && (
              <TouchableOpacity 
                style={styles.viewFileButton}
                onPress={() => handleViewFile(item.submitted_file_1)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="attach-file" size={18} color="#1976d2" />
                <Text style={styles.viewFileText}>View Attachment</Text>
              </TouchableOpacity>
            )}
          </View>

          {isSelected && (
  <ClaimItemActions
    item={item}
    itemActions={itemActions[item.id]}
    isLimited={isLimited}
    validationResult={validationResult}
    managers={managers}
    errors={errors}
    onActionChange={handleItemActionChange}
    onAmountChange={handleItemAmountChange}
    onRemarksChange={handleItemRemarksChange}
    onForwardManagerChange={handleItemForwardManagerChange}
    key={`actions-${item.id}`} // Add key to prevent re-mounting
  />
)}
        </View>
      </ClaimItemCard>
    );
  };

  const renderClaimItem = ({ item }) => {
    return <ClaimItem item={item} />;
  };

  if (isLoading) {
    return <Loader visible={isLoading} />;
  }

  if (selectedImageUrl) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <HeaderComponent headerTitle="View Image" onBackPress={handleBackPress} />
        <View style={{ flex: 1 }}>
          <ImageViewer
            imageUrls={[{ url: selectedImageUrl }]}
            enableSwipeDown={true}
            onSwipeDown={handleBackPress}
          />
        </View>
      </SafeAreaView>
    );
  }

  const formattedClaimId = claim?.master_claim_id?.length > 8 
    ? `...${claim.master_claim_id.slice(-8)}` 
    : claim?.master_claim_id;

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderComponent 
        headerTitle={`${callType === 'Approve' ? 'Approve' : 'Return'} Claim ${formattedClaimId || ''}`} 
        onBackPress={handleBackPress} 
      />
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Claim Summary Section */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Claim Summary</Text>
          </View>
          
          {validationError && (
            <View style={styles.validationErrorContainer}>
              <Text style={styles.validationErrorText}>{validationError}</Text>
            </View>
          )}
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Claimant</Text>
              <Text style={styles.summaryValue}>{claim?.employee_name}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Claim Date</Text>
              <Text style={styles.summaryValue}>{claim?.claim_date}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={[styles.summaryValue, styles.amountText]}>
                ${formatIndianCurrency(totalAmount.toFixed(2))}
                {/* ₹{totalAmount.toFixed(2)} */}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items Count</Text>
              <Text style={styles.summaryValue}>{claim?.claim_items?.length || 0}</Text>
            </View>
          </View>
        </View>

        {/* Claim Items List */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Claim Items</Text>
            <View style={styles.selectAllContainer}>
              <Text style={styles.selectedCount}>
                {selectedItems.length} of {claim?.claim_items?.filter(item => 
                  item.expense_status !== 'A' && item.expense_status !== 'R'
                ).length || 0} selected
              </Text>
              <TouchableOpacity onPress={toggleSelectAll}>
                <Text style={styles.selectAllText}>
                  {selectedItems.length === claim?.claim_items?.filter(item => 
                    item.expense_status !== 'A' && item.expense_status !== 'R'
                  ).length ? 'Unselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {errors.selectedItems && (
            <Text style={styles.sectionError}>{errors.selectedItems}</Text>
          )}
          
          <FlatList
            data={claim?.claim_items || []}
            renderItem={renderClaimItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>

        {/* Claim Level Remarks */}
        <View style={styles.remarksCard}>
          <RemarksInput
            label="Overall Claim Remarks"
            remark={claimRemarks}
            setRemark={setClaimRemarks}
            error={errors.claimRemarks}
            placeholder="Enter your overall remarks for this claim..."
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[
            styles.submitButton,
            selectedItems.length === 0 && styles.submitButtonDisabled
          ]} 
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={selectedItems.length === 0}
        >
          <Text style={styles.submitButtonText}>
            {selectedItems.length > 0 
              ? `Submit Actions (${selectedItems.length} items)` 
              : 'Select items to take action'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          isVisible={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            router.push('ApproveClaim');
          }}
          message="Claim actions submitted successfully."
        />
      )}
      <ConfirmationModal
        visible={showConfirmationModal}
        message={`Are you sure you want to submit actions for ${selectedItems.length} item(s)?`}
        onConfirm={confirmSubmit}
        onCancel={() => setShowConfirmationModal(false)}
        confirmText="Submit"
        cancelText="Cancel"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  selectedCount: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  sectionError: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryRow: {
    width: '48%',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2c3e50',
  },
  amountText: {
    color: '#27ae60',
    fontWeight: '600',
  },
  validationErrorContainer: {
    backgroundColor: '#fdecea',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  validationErrorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  itemDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    width: '40%',
  },
  detailValue: {
    fontSize: 14,
    color: '#34495e',
    fontWeight: '500',
    width: '60%',
    textAlign: 'right',
  },
  viewFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  viewFileText: {
    color: '#3498db',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  remarksCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: '#3498db',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowColor: '#bdc3c7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 4,
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllText: {
    fontSize: 14,
    color: '#3498db',
    marginLeft: 10,
    fontWeight: '500',
  },
});

export default ApproveClaimDetails;