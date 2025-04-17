import React from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components/native';
import { Dropdown } from 'react-native-element-dropdown';

const FieldContainer = styled.View`
  margin-bottom: 20px;
  margin-top: 5px;
`;

const Label = styled.Text`
  font-size: 16px;
  margin-bottom: 5px;
`;

const ClaimTypePicker = styled.View`
  border-width: 1px;
  border-color: #ccc;
  border-radius: 5px;
`;

const ItemPicker = ({ claimItem, item, setItem }) => {
  return (
    <FieldContainer>
      <Label>Expense Item</Label>
      <ClaimTypePicker>
        <Dropdown
          data={claimItem.map((claim) => ({
            label: claim.name,
            value: claim.id,
          }))}
          labelField="label"
          valueField="value"
          placeholder="Select Expense Item"
          value={item}
          onChange={(item) => setItem(item.value)}
          style={{
            padding: 10,
          }}
          placeholderStyle={{
            color: '#ccc',
            fontSize: 16,
          }}
          selectedTextStyle={{
            fontSize: 16,
          }}
        />
      </ClaimTypePicker>
    </FieldContainer>
  );
};

export default ItemPicker;
