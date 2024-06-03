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
  const { data: searchData, error, isLoading } = useSearchNotesQuery("");
  const [ addNote, { data: addNoteData, error: addNoteError }] = useAddNoteMutation();
  const [ deleteNote ] = useDeleteNoteMutation();

  
  
  useEffect(() => {
    if (addNoteData != undefined) {
      console.log(addNoteData.title);
      navigation.navigate("NewNote", {data: addNoteData});
    }
  }, [addNoteData]);
3
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("Edit", {note: item})} style={tw`w-[98%] mb-0.5 mx-auto bg-purple-300 rounded-sm px-1`}> 
      <Text>{item.title} {item.id}</Text>
    </TouchableOpacity>
  )

  return (
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
      <TouchableOpacity onPress={() => { addNote({title:"NewNote", content:"" }) }} style={tw`bg-blue-500 rounded-full absolute bottom-[5%] right-8 mx-auto items-center flex-1 justify-center w-12 h-12`}>
        <Text style={tw`text-white text-center text-3xl mt--1`}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function EditScreen({ route, navigation }) {
  const [updateNewNote, {data: uND, error: uNDE}] = useUpdateNoteMutation()
  
  const {note} = route.params
  console.log(note.title)
  useLayoutEffect(() => {
    navigation.setOptions({ title: note.title });
  }, []);
  
  const [text,setText]= useState(note.content)
  
  
  console.log(text)

  

  return (
    <View style={tw`bg-gray-400 h-full w-full`}>
      <TextInput defaultValue={route.params.note.title} value={text} onChangeText={(newValue)=>setText(newValue)}style={tw`bg-gray-300 w-full h-20`}/>
      <TextInput multiline value={text} onChangeText={(newValue) =>setText(text) } style={tw`bg-gray-300 w-full h-full`}/>
      <TouchableOpacity onPress={()=>updateNewNote({id:note.id, title: note.title, content:text})} style={tw`w-20 h-30`}>
        <Text style={tw`text-white text-center text-3xl mt--1`}>+</Text>

      </TouchableOpacity>
    </View>

  );
}

function NewNoteScreen({route, navigation}){
  const [updateNote]=useUpdateNoteMutation()
  const {newNote}=route.params
  useLayoutEffect(() => {
    navigation.setOptions({ title: route.params.data.title });
  }, []);

 const [text,setText]=useState("")
 
  return (
    <View style={tw`bg-gray-400 h-full w-full`}>
      <TextInput defaultValue={route.params.note.title} value={text} onChangeText={(newValue)=>setText(newValue)}style={tw`bg-gray-300 w-full h-20`}/>
      <TextInput multiline value={text} onChangeText={(newValue) =>setText(newValue) } style={tw`bg-gray-300 w-full h-full`}/>
      
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
              headerStyle: tw`bg-gray-300 border-20`,
              headerTintColor: '#fff',
              headerTitleStyle: tw`font-bold`,
              headerShadowVisible: true, // gets rid of border on device
            }}
            name="Home"
            component={HomeScreen}
          />
          <Stack.Screen
            options={{
              headerStyle: tw`bg-gray-300 border-20`,
              headerTintColor: '#fff',
              headerTitleStyle: tw`font-bold`,
              headerShadowVisible: false, // gets rid of border on device
              headerRight: () => ( <TouchableOpacity onPress={() => { }}>
              <Text style={tw`text-white text-center text-3xl mt--1`}>🗑️</Text>
            </TouchableOpacity> )
            }}
            name="Edit"
            component={EditScreen}
          />
                    <Stack.Screen
            options={{
              headerStyle: tw`bg-gray-300 border-20`,
              headerTintColor: '#fff',
              headerTitleStyle: tw`font-bold`,
              headerShadowVisible: false, // gets rid of border on device
            }}
            name="NewNote"
            component={NewNoteScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}