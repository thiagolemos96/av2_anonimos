import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

//expo install expo-image-picker
import * as ImagePicker from 'expo-image-picker';

import {
  View, TextInput, Text, Button, Image, StyleSheet
} from 'react-native';

import firebaseConfig from '../config/firebase';

import firebase from 'firebase';

import { WrapperView, CorrecaoView, Header, Content, Footer, Avatar } from './styles';


export default function Home() {

  const [imagem, setImagem] = useState(null);
  const [login, setlogin] = useState(false);
  const [textEmail, setTextEmail] = React.useState('')
  const [textPassword, setTextPassword] = React.useState('')
  
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const emailProvider = new firebase.auth.EmailAuthProvider();

  async function uploadImagem(uri) {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = new Date().getTime();

    var ref = firebaseConfig.storage().ref().child('upload/' + filename);

    ref.put(blob).then(function (snapshot) {

      snapshot.ref.getDownloadURL().then(function (downloadURL) {
        setImagem(downloadURL)
      })

    })
  }

  async function escolherImagem() {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.cancelled) {
        // setImagem(result.uri)
        uploadImagem(result.uri);

      }

      console.log(result);
    } catch (E) {
      console.log(E);
    }
  };

  async function logar(provider) {
    if(provider == 'email'){
      await firebase.auth().signInWithPopup(emailProvider);
    } else {
      await firebase.auth().signInWithPopup(googleProvider);
    }
    
    setlogin(true)
    console.log(await firebase.auth().currentUser);
  }

  return (
    // <CorrecaoView>
    //   <WrapperView>
    //     <Header>
    //       <Text>Sou texto Um</Text>
    //     </Header>
        <Content>
          {!login &&
            <>
            <View style={styles.container}>
              <View style={styles.view_fields}>
                <TextInput
                  style={styles.input_auth}
                  onChangeText={text => setTextEmail(text.toLowerCase())}
                  value={textEmail} />

                <TextInput
                  placeholder="Digite sua senha"
                  style={styles.input_auth}
                  onChangeText={text => setTextPassword(text)}
                  value={textPassword} secureTextEntry={true} />
              </View>
              <Button style={styles.button} title="Logar" onPress={() => logar('email')} />
              <Button style={styles.button2} title="Logar com conta google" onPress={() => logar('google')} >Entrar com google</Button>
            </View> 
            </>
            
          }
          {login &&
            <>
            <Image
                style={styles.avatar}
                source={{ uri: firebase.auth().currentUser.photoURL }} />
            <Text style={styles.nome_usuario}>Bem-Vindo {firebase.auth().currentUser.displayName}</Text>

            </>
          }
        </Content>
    //     <Footer>
    //       <Text>Sou texto Tres</Text>
    //     </Footer>
    //   </WrapperView>
    // </CorrecaoView>
  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  input_auth: {
    borderColor: '#ccc',
    borderWidth: 1,
    flex: 1,
    borderRadius: 3,
    margin: 10,
    marginTop: 0,
    padding: 4
  },
  view_fields: {
    flexDirection: 'column',
    width: '100%',
    height: 100
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#333'
  },
  nome_usuario: {
    fontSize: 25,
    color: '#999'
  },
});
