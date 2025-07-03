import { useNavigation, useRouter } from 'expo-router';
import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { Alert, Linking, ScrollView, View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import { getClaimApprover, postClaimAction } from '../services/productServices';
import HeaderComponent from '../components/HeaderComponent';
import AmountInput from '../components/AmountInput';
import RemarksInput from '../components/RemarkInput';
import DropdownPicker from '../components/DropdownPicker';
import SuccessModal from '../components/SuccessModal';
import Loader from '../components/old_components/Loader';
import ImageViewer from 'react-native-image-zoom-viewer';
import { MaterialIcons } from '@expo/vector-icons';
import { AppContext } from '../../context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const ApproveClaimDetails = (props) => {
  const { profile } = useContext(AppContext);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  // Parse claim data
  const claimData = props?.claim_data;
  const [claim, setClaim] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemActions, setItemActions] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (claimData) {
      try {
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
          parsedDetails.claim_items.forEach(item => {
            initialStates[item.id] = {
              action: null,
              approvedAmount: item.expense_amt.toString(),
              remarks: '',
              forwardManager: null
            };
          });
          setItemActions(initialStates);
        }
      } catch (error) {
        console.error("Error parsing claim data:", error);
      }
    }
  }, [claimData]);

  const callType = props?.claim_data?.callType;
  const isMasterApproval = props?.claim_data?.isMaster === "true";
  const navigation = useNavigation();
  const router = useRouter();

  const [claimRemarks, setClaimRemarks] = useState('');
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const approversRes = await getClaimApprover();
        setManagers(approversRes.data);
      } catch (error) {
        console.error('Error fetching approvers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    );
  };

  const handleItemActionChange = (itemId, action) => {
  const item = claim.claim_items.find(i => i.id === itemId);
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
  // Allow empty value (clearing the field)
  if (amount === '') {
    setItemActions(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        approvedAmount: ''
      }
    }));
    return;
  }

  // Basic validation - allow only numbers and decimal point
  const cleanedAmount = amount.replace(/[^0-9.]/g, '');
  
  // Get the original claimed amount for this item
  const item = claim.claim_items.find(i => i.id === itemId);
  const originalAmount = parseFloat(item.expense_amt);
  
  // Prevent amount from exceeding original claim
  if (cleanedAmount && parseFloat(cleanedAmount) > originalAmount) {
    return;
  }
  
  setItemActions(prev => ({
    ...prev,
    [itemId]: {
      ...prev[itemId],
      approvedAmount: cleanedAmount
    }
  }));
};

  const handleItemRemarksChange = (itemId, remarks) => {
    setItemActions(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        remarks
      }
    }));
  };

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
    
    // selectedItems.forEach(itemId => {
    //   const item = itemActions[itemId];
      
    //   if (!item.action) {
    //     newErrors[`itemAction-${itemId}`] = 'Please select an action for this item';
    //   }
      
    //   if (item.action === 'APPROVE' || item.action === 'FORWARD') {
    //     if (!item.approvedAmount || isNaN(parseFloat(item.approvedAmount))) {
    //       newErrors[`itemAmount-${itemId}`] = 'Please enter a valid approved amount';
    //     } else if (parseFloat(item.approvedAmount) > parseFloat(item.expense_amt)) {
    //       newErrors[`itemAmount-${itemId}`] = 'Approved amount cannot exceed claimed amount';
    //     }
    //   }
      
    //   if (item.action === 'FORWARD' && !item.forwardManager) {
    //     newErrors[`itemManager-${itemId}`] = 'Please select a manager to forward';
    //   }
      
    //   if (!item.remarks || item.remarks.trim() === '') {
    //     newErrors[`itemRemarks-${itemId}`] = 'Remarks are required for this item';
    //   }
    // });

    selectedItems.forEach(itemId => {
    const item = itemActions[itemId];
    
    if (item.action === 'APPROVE' || item.action === 'FORWARD') {
      if (!item.approvedAmount || item.approvedAmount === '') {
        newErrors[`itemAmount-${itemId}`] = 'Please enter an approved amount';
      } else if (isNaN(parseFloat(item.approvedAmount))) {
        newErrors[`itemAmount-${itemId}`] = 'Please enter a valid amount';
      } else if (parseFloat(item.approvedAmount) > parseFloat(item.expense_amt)) {
        newErrors[`itemAmount-${itemId}`] = 'Approved amount cannot exceed claimed amount';
      }
    }
  });
    
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const itemPayloads = selectedItems.map(itemId => {
        const item = itemActions[itemId];
        return {
          item_id: itemId,
          action: item.action,
          approved_amount: item.approvedAmount,
          remarks: item.remarks,
          forward_manager_id: item.forwardManager
        };
      });
      
      const claimPayload = {
        claim_id: isMasterApproval ? claim?.master_claim_id : `${claim?.id}`,
        claim_remarks: claimRemarks,
        is_master: isMasterApproval,
        items: itemPayloads
      };
      
      await postClaimAction(claimPayload);
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert('Action Failed', `Failed to process claim: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderClaimItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity 
        onPress={() => toggleItemExpand(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.itemHeader}>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              toggleItemSelection(item.id);
            }}
            style={styles.checkboxContainer}
          >
            <View style={[
              styles.checkbox, 
              selectedItems.includes(item.id) && styles.checkboxSelected
            ]}>
              {selectedItems.includes(item.id) && (
                <MaterialIcons name="check" size={16} color="white" />
              )}
            </View>
          </TouchableOpacity>
          
          <Text style={styles.itemTitle} numberOfLines={1} ellipsizeMode="tail">
            {item.item_name}
          </Text>
          
          <Text style={styles.itemAmount}>₹{parseFloat(item.expense_amt).toFixed(2)}</Text>
          
          <MaterialIcons 
            name={expandedItems[item.id] ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
            size={24} 
            color="#666" 
          />
        </View>
      </TouchableOpacity>
      
      {expandedItems[item.id] && (
        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{item.expense_date}</Text>
          </View>
          
          {item.project_name && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Project:</Text>
              <Text style={styles.detailValue}>{item.project_name}</Text>
            </View>
          )}
          
          {selectedItems.includes(item.id) && (
            <>
              <View style={styles.sectionDivider} />
              
              <Text style={styles.sectionSubtitle}>Item Action</Text>
              
              <View style={styles.actionRow}>
                <Text style={styles.detailLabel}>Action:</Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      itemActions[item.id]?.action === 'APPROVE' && styles.approveButtonActive
                    ]}
                    onPress={() => handleItemActionChange(item.id, 'APPROVE')}
                  >
                    <Text style={[
                      styles.actionButtonText,
                      itemActions[item.id]?.action === 'APPROVE' && styles.actionButtonTextActive
                    ]}>
                      Approve
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      itemActions[item.id]?.action === 'REJECT' && styles.rejectButtonActive
                    ]}
                    onPress={() => handleItemActionChange(item.id, 'REJECT')}
                  >
                    <Text style={[
                      styles.actionButtonText,
                      itemActions[item.id]?.action === 'REJECT' && styles.actionButtonTextActive
                    ]}>
                      Reject
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      itemActions[item.id]?.action === 'FORWARD' && styles.forwardButtonActive
                    ]}
                    onPress={() => handleItemActionChange(item.id, 'FORWARD')}
                  >
                    <Text style={[
                      styles.actionButtonText,
                      itemActions[item.id]?.action === 'FORWARD' && styles.actionButtonTextActive
                    ]}>
                      Forward
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {errors[`itemAction-${item.id}`] && (
                <Text style={styles.errorText}>{errors[`itemAction-${item.id}`]}</Text>
              )}
              
              {(itemActions[item.id]?.action === 'APPROVE' || itemActions[item.id]?.action === 'FORWARD') && (
  <>
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>Approved Amount:</Text>
      <View style={{flex: 1}}>
        <AmountInput
          label=""
          claimAmount={itemActions[item.id]?.approvedAmount || item.expense_amt.toString()}
          setClaimAmount={(amount) => handleItemAmountChange(item.id, amount)}
          error={errors[`itemAmount-${item.id}`]}
        />
      </View>
    </View>
  </>
)}
              
              {itemActions[item.id]?.action === 'FORWARD' && (
                <>
                  <View style={styles.detailRow}>
                    
                    <View style={styles.dropdownWrapper}>
                      <Text style={styles.detailLabel}>Forward To Manager</Text>
                      <View style={styles.managerSelectionContainer}>
                        <DropdownPicker
                          data={managers.map(m => ({
                            label: `${m.name} [${m.emp_id}]`,
                            value: m.id
                          }))}
                          value={itemActions[item.id]?.forwardManager}
                          setValue={(value) => handleItemForwardManagerChange(item.id, value)}
                          placeholder="Select manager"
                          style={styles.itemDropdown}
                          containerStyle={styles.dropdownContainer}
                        />
                      </View>
                    </View>
                  </View>
                  {errors[`itemManager-${item.id}`] && (
                    <Text style={styles.errorText}>{errors[`itemManager-${item.id}`]}</Text>
                  )}
                </>
              )}
              
              <RemarksInput
                label="Item Remarks:"
                remark={itemActions[item.id]?.remarks || ''}
                setRemark={(text) => handleItemRemarksChange(item.id, text)}
                error={errors[`itemRemarks-${item.id}`]}
                placeholder="Enter remarks for this item..."
                style={styles.itemRemarksInput}
              />
            </>
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
      )}
    </View>
  );

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
        headerTitle={`${callType === 'Approve' ? 'Approve' : 'Return'} (${formattedClaimId || 'Claim'})`} 
        onBackPress={handleBackPress} 
      />
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Claim Summary Section */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionHeader}>Claim Summary</Text>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Claim ID</Text>
              <Text style={styles.summaryValue}>{claim?.master_claim_id}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Employee</Text>
              <Text style={styles.summaryValue}>{claim?.employee_name}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Claim Date</Text>
              <Text style={styles.summaryValue}>{claim?.claim_date}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Status</Text>
              <Text style={[
                styles.summaryValue,
                styles.statusText,
                getStatusStyle(claim?.expense_status)
              ]}>
                {claim?.status_display || getClaimStatus(claim?.expense_status)}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={[styles.summaryValue, styles.amountText]}>
                ₹{totalAmount.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Items</Text>
              <Text style={styles.summaryValue}>{claim?.claim_items?.length || 0}</Text>
            </View>
          </View>
        </View>

        {/* Claim Items List */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Claim Items</Text>
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
          style={styles.submitButton} 
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Submit Actions</Text>
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
    </SafeAreaView>
  );
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'A': return styles.statusApproved;
    case 'R': return styles.statusRejected;
    case 'F': return styles.statusForwarded;
    case 'B': return styles.statusReturned;
    default: return styles.statusPending;
  }
};

const getClaimStatus = (status) => {
  switch (status) {
    case 'S': return 'Submitted';
    case 'A': return 'Approved';
    case 'F': return 'Forwarded';
    case 'R': return 'Rejected';
    case 'B': return 'Returned';
    default: return 'Pending';
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionError: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#34495e',
    marginBottom: 10,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 12,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
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
  statusText: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusApproved: {
    color: '#27ae60',
  },
  statusRejected: {
    color: '#e74c3c',
  },
  statusForwarded: {
    color: '#3498db',
  },
  statusReturned: {
    color: '#f39c12',
  },
  statusPending: {
    color: '#7f8c8d',
  },
  remarksCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#f8f9fa',
  },
  checkboxContainer: {
    padding: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#bdc3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#2c3e50',
    marginRight: 10,
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#27ae60',
    marginRight: 10,
  },
  itemDetails: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
  fontSize: 14,
  color: '#7f8c8d',
  marginTop: 4,
},
  detailValue: {
    fontSize: 14,
    color: '#34495e',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  actionRow: {
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#ecf0f1',
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButtonActive: {
    backgroundColor: '#27ae60',
  },
  rejectButtonActive: {
    backgroundColor: '#e74c3c',
  },
  forwardButtonActive: {
    backgroundColor: '#3498db',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  actionButtonTextActive: {
    color: '#fff',
  },
  itemAmountInput: {
  flex: 1,
  // Ensure this matches your AmountInput component's requirements
},
  dropdownWrapper: {
  flex: 1,
  minWidth: 250, // Set your desired minimum width
},
dropdownContainer: {
  width: '100%',
  marginBottom: 4, // Space between dropdown and label
},
itemDropdown: {
  // Your existing dropdown item styles
  paddingHorizontal: 10, // Ensure proper padding
},
  itemRemarksInput: {
    marginTop: 12,
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
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 8,
  },
  managerSelectionContainer: {
  marginBottom: 12,
},
});

export default ApproveClaimDetails;