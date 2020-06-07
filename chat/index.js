import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet, View, Text, YellowBox, Image, ScrollView,
  TextInput, TouchableOpacity
} from 'react-native';
import firebaseConfig from '../config/firebase';
import api from '../services/axios';
import axios from 'axios';

import firebase from 'firebase';

export default function Chat() {

  const [user, setUser] = useState(null)
  const [mensagens, setMensagens] = useState([])
  const [caixaTexto, setCaixaTexto] = useState('')
  const [scrollview, setScrollview] = useState('')
  const [mensagensPrivadas, setMensagensPrivadas] = useState([])
  const [isPrivate, setPrivate] = useState(false)
  const [otherUser, setOtherUser] = useState(null)
  const [isLogado, setLogado] = useState(false)


  const db = firebaseConfig.firestore()
  let mensagens_enviadas = []
  const salvar = (nomeDaSala) => {
    api.post('/enviarMensagem', {
      mensagem: caixaTexto,
      usuario: user.name,
      avatar: user.picture,
      nomeDoBanco: nomeDaSala
    })
      .then(function () {
        setMensagens([...mensagens, caixaTexto])
        setCaixaTexto('')
        scrollview.scrollToEnd({ animated: true })
      }).catch(function () {

      })
  }

  useEffect( async () => {
    if(await firebase.auth().currentUser){
      setLogado(true)
    }
    carregaUsuarioAnonimo()
    let mensagens_enviadas = []
    const unsubscribe = db.collection("chats")
      .doc("sala_01").collection('mensagens')
      .onSnapshot({ includeMetadataChanges: false }, function (snapshot) {
        snapshot.docChanges().forEach(function (change) {
          if (change.type === "added") {
            const { mensagem, usuario, avatar } = change.doc.data()
            const id = change.doc.id
            mensagens_enviadas.push({ mensagem, usuario, avatar, id })
          }
        })
        setMensagens([...mensagens_enviadas])
        scrollview ? scrollview.scrollToEnd({ animated: true }) : null;
      })
    return () => {
      unsubscribe()
    }
  }, [])

  function carregaUsuarioAnonimo() {
    if(isLogado){
      setUser({
        name: firebase.auth().currentUser.displayName,
        picture: firebase.auth().currentUser.photoURL
      })
    } else {
      axios.get('https://randomuser.me/api/')
      .then(function (response) {
        const user = response.data.results[0];
        // setDistance(response.data.distance)
        setUser({
          name: `${user.name.first} ${user.name.last}`,
          picture: user.picture.large
        })
        console.log('user', user)
      })
      .catch(function (error) {
        console.log(error);
      });
    }
    
  }

  const carregaMensagensPrivadas = (nomeDaSala) => {
    let mensagens_enviadas = [];
    console.log(nomeDaSala)
    const unsubscribe = db.collection("chats")
      .doc(nomeDaSala).collection('mensagens')
      .onSnapshot({ includeMetadataChanges: false }, function (snapshot) {
        snapshot.docChanges().forEach(function (change) {
          if (change.type === "added") {
            const { mensagem, usuario, avatar } = change.doc.data()
            const id = change.doc.id
            mensagens_enviadas.push({ mensagem, usuario, avatar, id })
          }
        })
        setMensagensPrivadas([...mensagens_enviadas])
        //scrollview ? scrollview.scrollToEnd({ animated: true }) : null;
      })
    return () => {
      unsubscribe()
    }
  }

  const chatGrupo = (usuario) => {
    let nomeUser = usuario.usuario.replace(" ", "_");
    let nomeDaSala = "sala_" + nomeUser;
    usuario.nomeDaSala = nomeDaSala;
    setPrivate(true); 
    setOtherUser(usuario)
    carregaMensagensPrivadas(nomeDaSala)
  }

  return (
    <View style={styles.view}>
      { !isPrivate && !firebase.auth().currentUser &&
        <>
        {user &&
          <>
            <TouchableOpacity onPress={carregaUsuarioAnonimo}>

              <Image
                style={styles.avatar}
                source={{ uri: user.picture }} />
            </TouchableOpacity>

            <Text style={styles.nome_usuario}>{user.name}</Text>
          </>

        }



        <ScrollView style={styles.scrollview} ref={(view) => { setScrollview(view) }}>
          {
            mensagens.length > 0 && mensagens.map(item => (
              <TouchableOpacity onPress={() => {chatGrupo(item)}}>
              <View key={item.id} style={styles.linha_conversa}>
                <Image style={styles.avatar_conversa} source={{ uri: item.avatar }} />
                <View style={{ flexDirection: 'column', marginTop: 5 }}>
                  <Text style={{ fontSize: 12, color: '#999' }}>{item.usuario}</Text>
                  <Text>{item.mensagem}</Text>
                </View>

              </View>
              </TouchableOpacity>
            ))
          }
        </ScrollView>


        <View style={styles.footer}>
          <TextInput
            style={styles.input_mensagem}
            onChangeText={text => setCaixaTexto(text)}
            value={caixaTexto} />

          <TouchableOpacity onPress={ () => {salvar('sala_01')}}>
            <Ionicons style={{ margin: 3 }} name="md-send" size={32} color={'#999'} />
          </TouchableOpacity>
        </View>
        </>
      }
      {!isPrivate && firebase.auth().currentUser &&
        <>
        {user &&
          <>
            <TouchableOpacity onPress={carregaUsuarioAnonimo}>

              <Image
                style={styles.avatar}
                source={{ uri: firebase.auth().currentUser.photoURL }} />
            </TouchableOpacity>

            <Text style={styles.nome_usuario}>{firebase.auth().currentUser.displayName}</Text>
          </>

        }



        <ScrollView style={styles.scrollview} ref={(view) => { setScrollview(view) }}>
          {
            mensagens.length > 0 && mensagens.map(item => (
              <TouchableOpacity onPress={() => {chatGrupo(item)}}>
              <View key={item.id} style={styles.linha_conversa}>
                <Image style={styles.avatar_conversa} source={{ uri: item.avatar }} />
                <View style={{ flexDirection: 'column', marginTop: 5 }}>
                  <Text style={{ fontSize: 12, color: '#999' }}>{item.usuario}</Text>
                  <Text>{item.mensagem}</Text>
                </View>

              </View>
              </TouchableOpacity>
            ))
          }
        </ScrollView>


        <View style={styles.footer}>
          <TextInput
            style={styles.input_mensagem}
            onChangeText={text => setCaixaTexto(text)}
            value={caixaTexto} />

          <TouchableOpacity onPress={ () => {salvar('sala_01')}}>
            <Ionicons style={{ margin: 3 }} name="md-send" size={32} color={'#999'} />
          </TouchableOpacity>
        </View>
        </>

      }
      { isPrivate &&
        <>
          {user &&
          <>
            <TouchableOpacity onPress={carregaUsuarioAnonimo}>
            <TouchableOpacity onPress={ () => {setPrivate(false);}}>
              <Ionicons style={styles.back} name="md-arrow-back" size={32} color={'#999'} />
            </TouchableOpacity>
              <Image
                style={styles.avatar}
                source={{ uri: otherUser.avatar }} />
            </TouchableOpacity>

            <Text style={styles.nome_usuario}>Sala {otherUser.usuario}</Text>
          </>

        }



        <ScrollView style={styles.scrollview} ref={(view) => { setScrollview(view) }}>
          {
            mensagensPrivadas.length > 0 && mensagensPrivadas.map(item => (
              <View key={item.id} style={styles.linha_conversa}>
                <Image style={styles.avatar_conversa} source={{ uri: item.avatar }} />
                <View style={{ flexDirection: 'column', marginTop: 5 }}>
                  <Text style={{ fontSize: 12, color: '#999' }}>{item.usuario}</Text>
                  <Text>{item.mensagem}</Text>
                </View>

              </View>
            ))
          }
        </ScrollView>


        <View style={styles.footer}>
        <Image style={styles.avatar_conversa} source={{ uri: firebase.auth().currentUser ? firebase.auth().currentUser.photoURL : user.picture }} />
          <TextInput
            style={styles.input_mensagem}
            onChangeText={text => setCaixaTexto(text)}
            value={caixaTexto} />

          <TouchableOpacity onPress={ () => {salvar(otherUser.nomeDaSala)}}>
            <Ionicons style={{ margin: 3 }} name="md-send" size={32} color={'#999'} />
          </TouchableOpacity>
        </View>
        </>
        
      }


    </View>
    )
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    alignItems: 'center',
    alignContent: 'center',
    width: '100%',
    paddingTop: 50,
    borderBottomWidth: 1,
    borderColor: '#000'
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#333'
  },

  avatar_conversa: {
    width: 40,
    height: 40,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 10
  },

  nome_usuario: {
    fontSize: 25,
    color: '#999'
  },

  footer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 50
  },
  input_mensagem: {
    borderColor: '#e6e6e6',
    borderWidth: 1,
    flex: 1,
    borderRadius: 4,
    margin: 10,
    marginTop: 0,
    padding: 4
  },
  scrollView: {
    backgroundColor: '#fff',
    width: '100%',
    borderTopColor: '#e6e6e6',
    borderTopWidth: 1,
  },
  linha_conversa: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingTop: 10,
    marginRight: 60,
  },
  back: {
    position: "relative",
    right: 100
  }
})
