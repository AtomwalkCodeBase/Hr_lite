import { View, Text, TextInput, StyleSheet } from 'react-native'
import React from 'react'
import {Controller} from 'react-hook-form';
import styled from 'styled-components/native';

const Label = styled.Text`
  font-size: 16px;
  margin-bottom: 5px;
`;

const CustomInput = ({
    control, 
    name, 
    rules = {}, 
    placeholder, 
    secureTextEntry}) => {
  return (
    <Controller 
        control={control}
        name={name}
        rules={rules}
        render={({field: {value, onChange, onBlur}, fieldState: {error}}) => (
        <>
        <Label>{placeholder}</Label>
            <View
            style={[
              styles.container,
              {borderColor: error ? 'red' : '#e8e8e8'},
            ]}>
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              style={styles.input}
              secureTextEntry={secureTextEntry}
            />
          </View>
          {error && (
            <Text style={{color: 'red', alignSelf: 'stretch'}}>{error.message || 'Error'}</Text>
          )}
        </>
        )} 
    />
  );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        width: '100%',

        borderColor: '#e8e8e8',
        borderWidth: 1,
        borderRadius: 5,

        paddingHorizontal: 10,
        paddingVertical:5,
        marginVertical: 5,

    },
    input: {},
})

export default CustomInput