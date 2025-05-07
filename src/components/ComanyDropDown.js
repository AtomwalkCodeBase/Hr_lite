import React from 'react';
import styled from 'styled-components/native';
import { Dropdown } from 'react-native-element-dropdown';
import { Text } from 'react-native';
import { colors } from '../Styles/appStyle';

const FieldContainer = styled.View`
  margin-bottom: 10px;
  margin-top: 5px;
`;

const Label = styled.Text`
  font-size: 16px;
  margin-bottom: 5px;
`;

const PickerContainer = styled.View`
  border-width: 1px;
  border-color: ${props => props.error ? colors.red : '#ccc'};
  border-radius: 5px;
`;

const CompanyDropdown = ({ error, label, data, value, setValue }) => {
  return (
    <FieldContainer>
      <Label>{label}</Label>
      <PickerContainer error={error}>
        <Dropdown
          data={data || []}
          labelField="label"
          valueField="value"
          placeholder={`Select ${label}`}
          value={value}
          onChange={(item) => setValue(item)}
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
      </PickerContainer>
      {error && (
        <Text style={{ marginTop: 7, color: colors.red, fontSize: 12 }}>
          {error}
        </Text>
      )}
    </FieldContainer>
  );
};

export default CompanyDropdown;