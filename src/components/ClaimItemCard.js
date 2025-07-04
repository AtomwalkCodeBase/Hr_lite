import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ClaimItemCard = ({ 
  item, 
  isSelected, 
  isDisabled, 
  isLimited,
  expanded,
  onToggleExpand,
  onToggleSelect,
  validationResult,
  children 
}) => {
  return (
    <View style={[
      styles.itemContainer, 
      isDisabled && styles.disabledItem, 
      isLimited && styles.limitedItem
    ]}>
      <TouchableOpacity 
        onPress={onToggleExpand}
        activeOpacity={0.8}
        style={styles.itemHeaderTouchable}
        disabled={isDisabled}
      >
        <View style={styles.itemHeader}>
          {!isDisabled ? (
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                if (!isLimited) onToggleSelect();
              }}
              style={styles.checkboxContainer}
            >
              <View style={[
                styles.checkbox, 
                isSelected && styles.checkboxSelected,
                isLimited && styles.checkboxLimited
              ]}>
                {isSelected && (
                  <MaterialIcons name="check" size={16} color="white" />
                )}
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.statusIconContainer}>
              <MaterialIcons 
                name={item.expense_status === 'A' ? 'check-circle' : 'cancel'} 
                size={22} 
                color={item.expense_status === 'A' ? '#27ae60' : '#e74c3c'} 
              />
            </View>
          )}
          
          <View style={styles.itemTitleContainer}>
            <Text style={[
              styles.itemTitle,
              isDisabled && styles.disabledText,
              isLimited && styles.limitedText
            ]} numberOfLines={1} ellipsizeMode="tail">
              {item.item_name}
            </Text>
            {item.project_name && (
              <Text style={[
                styles.itemProject,
                isDisabled && styles.disabledText,
                isLimited && styles.limitedText
              ]} numberOfLines={1}>
                {item.project_name}
              </Text>
            )}
            {isLimited && validationResult?.limitRemarks && (
              <Text style={styles.limitRemarksText}>
                {validationResult.limitRemarks}
              </Text>
            )}
          </View>
          
          <View style={styles.itemAmountContainer}>
            <Text style={[
              styles.itemAmount,
              isDisabled && styles.disabledText,
              isLimited && styles.limitedText
            ]}>
              ₹{parseFloat(item.expense_amt).toFixed(2)}
            </Text>
            {!isDisabled && (
              <MaterialIcons 
                name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
                size={24} 
                color={isLimited ? '#e67e22' : '#666'} 
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
      
      {expanded && children}
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  limitedItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#e67e22',
  },
  disabledItem: {
    opacity: 0.7,
    backgroundColor: '#f9f9f9',
  },
  itemHeaderTouchable: {
    paddingVertical: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  checkboxContainer: {
    padding: 4,
    marginRight: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#bdc3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  checkboxLimited: {
    borderColor: '#e67e22',
  },
  statusIconContainer: {
    width: 22,
    height: 22,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2c3e50',
  },
  limitedText: {
    color: '#e67e22',
  },
  disabledText: {
    color: '#95a5a6',
  },
  itemProject: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 2,
  },
  limitRemarksText: {
    fontSize: 12,
    color: '#e67e22',
    marginTop: 2,
    fontStyle: 'italic',
  },
  itemAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#27ae60',
    marginRight: 8,
  },
});

export default ClaimItemCard;