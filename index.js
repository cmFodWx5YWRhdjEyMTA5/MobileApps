import React, { Component } from 'react';
import { AppRegistry, StatusBar, StyleSheet, Platform, View, SafeAreaView, Linking, WebView, AppState, Alert, AsyncStorage, DeviceEventEmitter } from 'react-native';
import App from './App';

import KeyboardManager from 'react-native-keyboard-manager';
import * as firebase from 'firebase';

import Strings from './Screens/Utils/Strings';
import firebaseConfig from './Screens/Utils/firebaseConfig';
import RNFirebaseDynamicLinks from './Screens/Utils/RNFirebaseDynamicLinks';

const MyStatusBar = ({ backgroundColor, ...props }) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);

export default class Gymonkee extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentAppState: AppState.currentState,
      inviteCode: '',
      isLogin: '',
    };
    // this._handleAppStateChange = this._handleAppStateChange.bind(this);
    this._handleOpenURL = this._handleOpenURL.bind(this);
  }

  componentDidMount() {
    if (Platform.OS === "ios") {
      Linking.addEventListener('url', this._handleOpenURL);
    } else {
      RNFirebaseDynamicLinks.addListener(this._handleOpenURL);
    }

    if (Platform.OS === 'ios') {
      KeyboardManager.setToolbarPreviousNextButtonEnable(true);
      KeyboardManager.setShouldResignOnTouchOutside(true);
    }

    if (firebase.apps.length === 0) {
      /*
        Note:-
        =====

        Change Productions to Development Or Productions to Development

        1)Change in index.js file
        2)Change in Utils/Strings.js file
        3)Change google-service.json file in android in app folder
        4)Change Linked In details from Strings.Js file
        5)Change Google Details From Strings.Js file
        6)For Facebook Android:-
            Change in String.xml file
          For Facebook Ios:-
            info.plist file
        7)Google Map Android:-
            Android MainFest file
          Google Map iOS:-
            AppDelegate.m file

        Credintials :-
        ===========

        Firebase,PlayStore:- 

        gymonkees@gmail.com
        lt2206@$

      */


      //Production
      // const firebaseConfig = {
      //       apiKey: "AIzaSyDA4hJI_eGiyBPmvfj3I3T-y3Grm7oB3Bg",
      //       authDomain: "gymonkee-8b57b.firebaseapp.com",
      //       databaseURL: "https://gymonkee-8b57b.firebaseio.com",
      //       storageBucket: "gymonkee-8b57b.appspot.com",
      //     };


      //Development
      const firebaseConfig = {
        apiKey: "AIzaSyC1F9blvs2HnQUlDtJsmI50xpDyCn1IGPg",
        authDomain: "gymonkeetest-adcd6.firebaseapp.com",
        databaseURL: "https://gymonkeetest-adcd6.firebaseio.com",
        storageBucket: "gymonkeetest-adcd6.appspot.com"
      };
      
      const firebaseApp = firebase.initializeApp(firebaseConfig);
    }

    AsyncStorage.getItem('inviteCode').then((value) => {
      if (value !== null) {
        this.setState({ inviteCode: value })
      }
    }).done();

    // // IOS Working CODE
    if (Platform.OS === "ios") {
      Linking.getInitialURL().then((url) => {
        console.log("URL is:", url)
        if (url) {
          this._handleOpenURL({ url });
        }
      }).catch(err => console.error('An error occurred', err));
    }
  }

  componentWillUnmount() {
    // if(Platform.OS==="ios"){
    //     Linking.removeEventListener('url', this._handleOpenURL);
    // }else{
    //     RNFirebaseDynamicLinks.removeListener();
    // }
  }

  _handleOpenURL(event) {
    var url = (Platform.OS === 'ios') ? event.url : event
    if (url) {
      // console.log("Data", url.replace(/.*?:\/\//g, ''));
      // console.log("Split",url.replace(/.*?:\/\//g, '').split('&'));
      const utm_campaign = url.replace(/.*?:\/\//g, '').split('&')[1];
      if (utm_campaign != null) {
        // console.log("utm_campaign value",utm_campaign.split('=')[1]);
        var friendUTMCode = utm_campaign.split('=')[1];
        // console.log("Friend UTM Code =",friendUTMCode);
        if (friendUTMCode.length > 0) {
          AsyncStorage.getItem('inviteCode').then((value) => {
            if (value !== null) {
              if (value === friendUTMCode) {
                console.log("Same User Found while checking the parameter");
              } else {
                AsyncStorage.getItem(Strings.AsyncStorage_Key_isLogin).then((value) => {
                  console.log("Check whether user is logged in or not", value);
                  if (value === 'success') {
                    this._inviteFriendCode(friendUTMCode);
                  }
                }).done();
              }
            }
          }).done();
        }
      }
    }
  }

  //Adding an Entry in user table
  _inviteFriendCode(friendUTMCode) {
    console.log("Inside Invite Friend function");
    var userRef = firebase.database().ref('User').orderByChild('inviteCode').equalTo(friendUTMCode);
    userRef.on('value', (snapshot) => {
      if (snapshot.exists()) {
        var userId = Object.keys(snapshot.val());
        var userData = snapshot.val()[userId];

        if (userData.profileImage != undefined) {
          console.log("User profileImage", userData.profileImage);
        }

        var CurrentuserId = firebase.auth().currentUser.uid;
        console.log("CurrentuserId : ", CurrentuserId);
        if (userData.profileImage != undefined) {
          var frndDict = {
            email: userData.email,
            name: userData.firstname,
            profileImage: userData.profileImage
          }
        }
        else {
          var frndDict = {
            email: userData.email,
            name: userData.firstname,
            profileImage: Strings.profile_pic_url_storage
          }
        }
        var friendUserId = userId.toString();
        var frndRef = firebase.database().ref('Friendship').child(CurrentuserId);
        frndRef.child(friendUserId).set(frndDict);
        var currentUserRef = firebase.database().ref('User').child(CurrentuserId);

        currentUserRef.on('value', (data) => {
          var userData = data.val();
          var keys = Object.keys(userData);

          var friendEmail = '';
          var friendName = '';
          var friendProfileImage = '';

          if (keys.length > 0) {
            if (userData.hasOwnProperty('email')) {
              friendEmail = userData.email;
            }

            if (userData.hasOwnProperty('firstname')) {
              friendName = userData.firstname;
            }

            if (userData.hasOwnProperty('profileImage')) {
              friendProfileImage = userData.profileImage;
            }

            var userDict = {
              email: friendEmail,
              name: friendName,
              profileImage: friendProfileImage
            }

            var frndRef = firebase.database().ref('Friendship').child(friendUserId);
            frndRef.child(CurrentuserId).set(userDict);
          }
        })
      }
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <App />
      </View>
    );
  }
}

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
});

AppRegistry.registerComponent('Gymonkee', () => Gymonkee);
