import { Modal } from 'react-native';
import React from 'react';
import {AntDesign} from "@expo/vector-icons";

import {
    ModalButton,
    ModalContainer,
    ModalView,
    StyledInput,
    ModalAction,
    ModalActionGroup,
    ModalIcon,
    HeaderTitle,
    colors
} from './../Styles/appStyle';


const InputModal = ({
    modalVisible, 
    setModalVisible, 
    todoInputValue, 
    setTodoInputValue, 
    handleAddTodo, 
    todoToBeEdited,
    setTodoToBeEdited,
    handleEditTodo,
    todos}) => {
    
    const handleCloseModal = () => {
        setModalVisible(false);
        setTodoInputValue("");
        setTodoToBeEdited(null);
    }
    const handleSubmit = () => {
        if (!todoToBeEdited){
            handleAddTodo({
                title: todoInputValue,
                date: new Date().toUTCString(),
                key: `${(todos[todos.length-1] && parseInt(todos[todos.length-1].key) + 1) || 1}`
            });
        } else {
            handleEditTodo({
                title: todoInputValue,
                date: todoToBeEdited.date,
                key: todoToBeEdited.key
            });
            
        }

        setTodoInputValue("");
        
    }

    return (
    <>
        <ModalButton onPress={() => {setModalVisible(true)}}>
            <AntDesign name="plus" size={30} color={'#4491FE'} />
        </ModalButton>
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={handleCloseModal} 
        >
        <ModalContainer>
            <HeaderTitle color={colors.primary}> Todos </HeaderTitle>
            <ModalView>
            <ModalIcon>
                <AntDesign name="edit" size={30} color={colors.tertiary} />
            </ModalIcon>
            <StyledInput
                placeholder="Add to Todo list"
                placeholderTextColor={colors.alternative}
                selectionColor={colors.secondary}
                autoFocus={true}
                onChangeText={(text) => setTodoInputValue(text)}
                value={todoInputValue}
                onSubmitEditing={handleSubmit}

            />
            <ModalActionGroup>
                <ModalAction color={colors.tertiary} onPress={handleCloseModal}>
                    <AntDesign name="close" size={28} color={colors.red} />
                </ModalAction>
                <ModalAction color={colors.tertiary} onPress={handleSubmit}>
                    <AntDesign name="check" size={28} color={colors.green} />
                </ModalAction>
            </ModalActionGroup>
            </ModalView>
        </ModalContainer>
        </Modal>
        
    </>
    
  )

}

export default InputModal;