import React from "react";
import { View, Text, Image,ScrollView} from "react-native";
import styled from 'styled-components/native';
import { SIZES, SHADOWS} from "../constant_s";
import { SubInfo, CardTitle } from "./SubInfo";
import { colors } from "../Styles/appStyle";
import { MaterialIcons } from '@expo/vector-icons';
const Header = styled.View`
  background-color: #4285f4;
  border-radius: 20px;
  align-items: center;
  padding: 20px;
`;

const ProfilePhotoContainer = styled.View`
  background-color: #fff;
  border-radius: 50px;
  width: 100px;
  height: 100px;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
`;

const ProfilePhoto = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 40px;
`;

const EmailText = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10px;
`;

const TaskInfo = styled.View`
  width: 100%;
  padding: 0 16px;
`;

const TaskText = styled.Text`
  color: #fff;
  font-size: 16px;
  margin-bottom: 5px;
`;

const Label = styled.Text`
  font-weight: bold;
`;

const DetailCard = ({colour, title, subTitle, date, dateTitle, imageUrl, imageLabel, status, statusColour, name,
                     subInfo}) => {
    
    const cardColour = colour ? colour: colors.primary
    return (
      <Header>
      {imageUrl&&<ProfilePhotoContainer>
        <ProfilePhoto
          source={{
            uri: imageUrl, // Placeholder image URL
          }}
        />
      </ProfilePhotoContainer>}
      <EmailText>{imageLabel}</EmailText>

      {/* Task Details Section */}
      <TaskInfo>
        {name&&  <TaskText>
          <Label>Task Name: </Label>{name}
        </TaskText>}
       
        {subInfo&&<TaskText>
          <Label>Info: </Label>{subInfo}
        </TaskText>}
       {status&& <TaskText>
          <Label>Status: </Label>{status}
        </TaskText>}
        {date&&<TaskText>
          <Label>{dateTitle}: </Label>{date}
        </TaskText>}
        <TaskText>
          {title}
        </TaskText>
        <TaskText>
          {subTitle}
        </TaskText>
      </TaskInfo>
    </Header>
    );
};

export default DetailCard