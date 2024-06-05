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

  
  useEffect(() => {
    if (addNoteData != undefined) {
      console.log(addNoteData.title);
      navigation.navigate("Edit", {data: addNoteData});
    }
  }, [addNoteData]);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("Edit", {data: item}) } style={tw`w-[98%] mb-0.5 mx-auto bg-purple-300 rounded-sm px-1`}> 
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
  <View style={tw`w-full h-full`}>
    <TouchableOpacity onPress={focusInput}>
     <TextInput ref={inputRef} defaultValue={searchText} placeholder="Enter text" onChangeText={(newValue)=>{setSearchText(newValue)}} style={tw`h-12 px-2 bg-blue-100 rounded-lg`} />
    </TouchableOpacity>
    <View style={tw`flex-1 items-center justify-center bg-gray-400`}>

      {searchData ? 
        <MasonryList
          style={tw`px-0.5 pt-0.5 pb-20`}
          
          data={searchData}
          numColumns={2}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />  
        : <></>
      }
      <TouchableOpacity onPress={() => { addNote({title: "test", content: "content"}); }} style={tw`bg-blue-500 rounded-full absolute bottom-[5%] right-8 mx-auto items-center flex-1 justify-center w-12 h-12`}>
        <Text style={tw`text-white text-center text-3xl mt--1`}>+</Text>
      </TouchableOpacity>
    </View>
  </View> 
  );
}

function EditScreen({ route, navigation }) {
  const [updateNote]= useUpdateNoteMutation()
  const [ deleteNote ] = useDeleteNoteMutation();
  const {data} = route.params
  const [textTitle,setTextTitle] = useState(data.title)
  const [text,setText] =useState(data.content)

  useLayoutEffect(() => {
    navigation.setOptions({ title: route.params.data.title, headerRight: () => ( <TouchableOpacity onPress={() => {deleteNote({id: data.id, title: textTitle, content: text}); navigation.navigate("Home") }}>
    <Text style={tw`text-white text-center text-3xl mt--1`}>🗑️</Text>
  </TouchableOpacity> ) });
  updateNote({id: data.id, title: textTitle, content: text });
  }, [textTitle, text]);
  
  
  
  
  return (
    <View style={tw`h-full w-full bg-purple-400`}>
      <TextInput  defaultValue={textTitle} onChangeText={(newValue)=>{setTextTitle(newValue)}}  style={tw`h-20 w-full px-2`} />
      <TextInput multiline defaultValue={text} onChangeText={(newValue)=>{setText(newValue); updateNote({id: data.id, title: textTitle, content: text })}} style={tw`h-full w-full px-2`} />
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
              headerStyle: tw`bg-purple-300 border-0`,
              headerTintColor: '#fff',
              headerTitleStyle: tw`font-bold`,
              headerShadowVisible: false, // gets rid of border on device
            }}
            name="Home"
            component={HomeScreen}
          />
          <Stack.Screen
            options={{
              headerStyle: tw`bg-purple-300 border-0`,
              headerTintColor: '#fff',
              headerTitleStyle: tw`font-bold`,
              headerShadowVisible: false, // gets rid of border on device
              
            }}
            name="Edit"
            component={EditScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}