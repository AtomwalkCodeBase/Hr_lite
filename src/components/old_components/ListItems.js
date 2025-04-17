import React, {useState} from 'react'
import {
    ListView,
    ListViewHidden,
    ListButton,
    TodoText,
    TodoDate,
    HiddenButton,
    SwipedTodoText,
    ListRowView,
    colors
} from './../Styles/appStyle';
import {Ionicons} from "@expo/vector-icons";
import { MaterialIcons } from '@expo/vector-icons';
import {SwipeListView } from 'react-native-swipe-list-view';

const ListItems = ({todos, setTodos, handleTriggerEdit, navigation }) => {

    const [swipedRow, setSwipedRow] = useState(null); 

    const handleDeleteTodo= (rowMap, rowKey) => {
        const newTodos = [...todos];
        const todoIndex = todos.findIndex((todo) => todo.key === rowKey);
        newTodos.splice(todoIndex, 1);
        setTodos(newTodos);
    }  

  return (
    <SwipeListView 
        data={todos}
        renderItem={(data) => {
            const RowText = data.item.key == swipedRow ? SwipedTodoText : TodoText;
            return(
                <ListView
                    underlayColor={colors.white}
                    onPress={() => {
                        handleTriggerEdit(data.item)
                    }}
                >
                    <>
                        <RowText>{data.item.title}</RowText>
                        <TodoDate>{data.item.date}</TodoDate>
                        <ListRowView>
                        <ListButton onPress={() => navigation.navigate("AddLead", {task: data.item.title},)}>
                            <Ionicons name="person-add" size={24} color={'#4491FE'} />
                        </ListButton>
                        <ListButton onPress={() => navigation.navigate("AddTodoTask", {task: data.item.title},)}>
                            <MaterialIcons name="add-task" size={24} color={'#4491FE'}  />
                        </ListButton>
                        </ListRowView>
                    </>    
                </ListView>
                
            )
        }}
        renderHiddenItem={(data, rowMap) => {
            return(
                <>
                <ListViewHidden>
                    <HiddenButton
                        onPress={() => handleDeleteTodo(rowMap, data.item.key)}
                    >
                    <Ionicons name="trash" size={25} color={'#4491FE'} />
                    </HiddenButton>
                    
                </ListViewHidden>
                </>
            )
        }}
        leftOpenValue={80}
        previewRowKey={"1"}
        previewOpenValue={80}
        previewOpenDelay={3000}
        disableLeftSwipe={true}
        showsVerticalScrollIndicator={false}
        style={{
            flex: 1, paddingBottom: 30, marginBottom: 40,margin:8,
        }}
        onRowOpen={(rowKey) => {
            setSwipedRow(rowKey);

        }}
        onRowClose={() => {
            setSwipedRow(null);

        }}
    />
    
  )
}

export default ListItems