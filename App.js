import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TouchableOpacity, View, Text, TextInput, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import tw, { useDeviceContext } from 'twrnc';
import { Provider } from 'react-redux';
import { store } from './store';
import MasonryList from '@react-native-seoul/masonry-list'
import { useSearchNotesQuery, useAddNoteMutation, useDeleteNoteMutation, useUpdateNoteMutation } from './db';

function HomeScreen({ navigation }) {
  
  const [ addNote, { data: addNoteData, error: addNoteError }] = useAddNoteMutation();

  /**
   * Switch to edit screen when adding a note
   */
  useEffect(() => {
    if (addNoteData != undefined) {
      
      navigation.navigate("Note", {data: addNoteData});
    }
  }, [addNoteData]);

  /**
   * To render the notes in notes home screen
   * @param {*} param0 a note
   * @returns 
   */
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("Note", {data: item}) } style={tw` m-0.5 bg-purple-400 rounded-sm px-1`}> 
      <Text>{item.title}</Text>
      <Text>{item.content}</Text>      
    </TouchableOpacity>
  )
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current.focus();
  };
  const [searchText,setSearchText] = useState("")
  const { data: searchData, error, isLoading } = useSearchNotesQuery(searchText);

  return (
  
    
    <View style={tw`w-full h-full bg-purple-700`}>
    <TouchableOpacity onPress={focusInput}>
     <TextInput ref={inputRef} defaultValue={searchText} placeholder="Search" placeholderTextColor={'gray'} onChangeText={(newValue)=>{setSearchText(newValue)}} style={tw`h-12 p-2 m-2 bg-blue-100 rounded-lg`} />
    </TouchableOpacity>

      {searchData ? 
        <MasonryList
          style={tw`w-full h-full`}
          
          data={searchData}
          numColumns={2}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.1}
        />  
        : <></>
      }
      <TouchableOpacity onPress={() => { addNote({title: "", content: ""}); }} style={tw`bg-blue-500 rounded-full absolute bottom-[10%] right-8 mx-auto items-center flex-1 justify-center w-12 h-12`}>
        <Text style={tw`text-white text-center text-3xl mt--1`}>+</Text>
      </TouchableOpacity>
    </View>

  );
}

function EditScreen({ route, navigation }) {
  const [updateNote]= useUpdateNoteMutation()
  const [ deleteNote ] = useDeleteNoteMutation();
  const {data} = route.params
  const [textTitle,setTextTitle] = useState(data.title)
  const [text,setText] =useState(data.content)
/*
 The delete button
*/
  useEffect(() => {
    updateNote({id: data.id, title: textTitle, content: text });
    navigation.setOptions({  headerRight: () => ( <TouchableOpacity onPress={() => {deleteNote({id: data.id, title: textTitle, content: text});console.log("Logo") }}>
    <Text style={tw`text-white text-center text-3xl mt--1`}>🗑️</Text>
  </TouchableOpacity> ) });
  console.log("When saving "+textTitle)
  
  
  }, [text, textTitle]);
 
  /*
  Delete empty note
  */
  useEffect(() => {
     console.log("before"+ textTitle)
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      updateNote({id: data.id, title: textTitle, content: text})
      console.log('perform actions before leaving screen');
      if (data.id == data.id && textTitle == ""){
      deleteNote({id: data.id, title: textTitle, content: text})
      }
    });

    return unsubscribe;
  }, [navigation, text, textTitle]);
  
/** 
 const unsubscribe =()=>{navigation}
if(data.title == "" && data.text==""){
  
  deleteNote({id:data.id, title: data.title, content: data.content})
}
*/

  

  
  return (
    <View style={tw`h-full w-full bg-purple-700`}>
      <TextInput cursorColor={'#2563eb'}  placeholder='Title' placeholderTextColor={'gray'} defaultValue={textTitle} onChangeText={(newValue)=>{setTextTitle(newValue)}}  style={tw`h-20 w-full px-2`} />
      <TextInput scrollEnabled={false} multiline defaultValue={text} onChangeText={(newValue)=>{setText(newValue)}} style={tw`h-full w-full px-2`} />
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  useDeviceContext(tw);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            options={{
              headerStyle: tw`bg-purple-700 border-0`,
              headerTintColor: '#fff',
              headerTitleStyle: tw`font-bold`,
              headerShadowVisible: false, // gets rid of border on device
              headerTitle: "Notes",
              headerTitleAlign: 'center'
            }}
            name="Home"
            component={HomeScreen}
          />
          <Stack.Screen
            options={{
              headerStyle: tw`bg-purple-700 border-0 text-center`,
              headerTintColor: '#fff',
              headerTitleStyle: tw`font-bold`,
              headerShadowVisible: false, // gets rid of border on device
              headerTitle:"Notes",
              headerTitleAlign:'center'
            }}
            name="Note"
            component={EditScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}