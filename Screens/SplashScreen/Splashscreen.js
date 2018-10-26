import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableHighlight,
  WebView,
  KeyboardAvoidingView,
  Alert,
  Keyboard,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
  Easing,
  AsyncStorage,
  NetInfo,
  Platform,
  StatusBar,
  SafeAreaView,
  ImageBackground,
} from 'react-native';

import { NavigationActions } from 'react-navigation';
import * as firebase from 'firebase';
import Strings from './../Utils/Strings';
var moment = require("moment");

class SplashScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLogin: '',
      installApp: '',
      isAppKill: 'false',
      gymId: '',
      checkinGymKey: '',
      userKeyInGym: '',
      barcodeId: '',
      barcodeURL: '',
      gymName: '',
      afterCheckInUserCoins: '',
      afterCheckInPaygCoin:'',
      afterCheckInMonthlyCoin:'',
      checkinKey: '',
    }
  }

  //Life Cycle Methods
  componentWillMount() {
    if (Platform.OS === 'ios') {
      navigator.geolocation.requestAuthorization()
    }
    /*
    console.log("Firebase App length:",firebase.apps.length);

    if(firebase.apps.length === 0)
    {
      const firebaseConfig = {
            apiKey: "AIzaSyDuYKBrXUmY1oXQrdf-sorEhbvWoTw79rM",
            authDomain: "gymonkee-3cad2.firebaseapp.com",
            databaseURL: "https://gymonkee-3cad2.firebaseio.com",
            storageBucket: "gymonkee-3cad2.appspot.com"
          };
      const firebaseApp = firebase.initializeApp(firebaseConfig);
      // console.log("Firebase config is:",firebaseConfig);
      // console.log("Firebase config",firebaseApp);
    }

    var user = firebase.auth().currentUser;
    console.log("firebase.auth().currentUser : ",user);
    if (user) {
      // User is signed in.
      console.log("SplashScreen currentUser : ",user.uid,user.email);
    } else {
      // No user is signed in.
    }
*/

    AsyncStorage.getItem('isAppKill').then((value) => {
      console.log("componentDidMount -> SplashScreen -> AsyncStorage Check isAppKill From Barcode: ", value);
      if (value !== null) {
        this.setState({
          isAppKill: value
        });
      } else {

      }
      setTimeout(() => {
        console.log("this.state.isAppKill : ", this.state.isAppKill);
      }, 600)
    }).done();

    AsyncStorage.getItem(Strings.AsyncStorage_Key_isLogin).then((value) => {
      console.log("componentDidMount -> SplashScreen -> AsyncStorage.getItem() : ", value);

      this.setState({
        isLogin: value
      });
      setTimeout(() => {
        console.log("this.state.isLogin : ", this.state.isLogin);
      }, 600)
    }).done();
  }
  componentDidMount() {
    setTimeout(() => {

      //get AsyncStorage store data here...
      AsyncStorage.getItem('isAppKill').then((value) => {
        console.log("componentDidMount -> SplashScreen -> AsyncStorage Check isAppKill From Barcode: ", value);
        if (value !== null) {
          this.setState({
            isAppKill: value
          });
        } else {

        }
        setTimeout(() => {
          console.log("this.state.isAppKill : ", this.state.isAppKill);
        }, 600)
      }).done();

      AsyncStorage.getItem(Strings.AsyncStorage_Key_isLogin).then((value) => {
        console.log("componentDidMount -> SplashScreen -> AsyncStorage.getItem() : ", value);

        this.setState({
          isLogin: value
        });
        setTimeout(() => {
          console.log("this.state.isLogin : ", this.state.isLogin);
        }, 600)
      }).done();

      AsyncStorage.getItem(Strings.AsyncStorage_Key_installApp).then((value) => {
        console.log("componentDidMount -> SplashScreen -> AsyncStorage.getItem() : ", value);

        this.setState({
          installApp: value
        });
        setTimeout(() => {
          console.log("this.state.installApp : ", this.state.installApp);
        }, 600)
      }).done();

      //navigate to Home screen if islogin success
      var navigator = this.props.navigator;
      setTimeout(() => {
        console.log("this.state.isAppKill : ", this.state.isAppKill);
        if (this.state.isAppKill === 'true') {
          AsyncStorage.multiGet(['gymId', 'checkinGymKey', 'userKeyInGym', 'barcodeId', 'barcodeURL', 'gymName', 'afterCheckInUserCoins','afterCheckInPaygCoin','afterCheckInMonthlyCoin', 'checkinKey'], (err, stores) => {
            stores.map((result, i, store) => {  // get at each store's key/value so you can work with it
              let key = store[i][0];
              let value = store[i][1];
              if (key === 'gymId') {
                this.setState({
                  gymId: value
                });
              }
              if (key === 'checkinGymKey') {
                this.setState({
                  checkinGymKey: value
                });
              }
              if (key === 'userKeyInGym') {
                this.setState({
                  userKeyInGym: value
                });
              }
              if (key === 'barcodeId') {
                this.setState({
                  barcodeId: value
                });
              }
              if (key === 'barcodeURL') {
                this.setState({
                  barcodeURL: value
                });
              }
              if (key === 'gymName') {
                this.setState({
                  gymName: value
                });
              }
              if (key === 'afterCheckInUserCoins') {
                this.setState({
                  afterCheckInUserCoins: value
                });
              }
              if (key === 'afterCheckInPaygCoin') {
                this.setState({
                  afterCheckInPaygCoin: value
                });
              }
              if (key === 'afterCheckInMonthlyCoin') {
                this.setState({
                  afterCheckInMonthlyCoin: value
                });
              }
              if (key === 'checkinKey') {
                console.log("CHeck in Key:", value);
                this.setState({
                  checkinKey: value
                });
              }

            })
          })

          setTimeout(() => {
            // AsyncStorage.setItem("gymId",state.params.gymId)
            // AsyncStorage.setItem("checkinGymKey",state.params.checkinGymKey)
            // AsyncStorage.setItem("userKeyInGym",state.params.userKeyInGym)
            // AsyncStorage.setItem("barcodeId",state.params.barcodeId)
            // AsyncStorage.setItem("barcodeURL",state.params.barcodeURL)
            const resetAction = NavigationActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({ routeName: 'Scanner', params: { comingFrom: 'splash', checkinKey: this.state.checkinKey, 
              afterCheckInUserCoins: this.state.afterCheckInUserCoins, afterCheckInPaygCoin: this.state.afterCheckInPaygCoin,afterCheckInMonthlyCoin: this.state.afterCheckInMonthlyCoin,
              gymId: this.state.gymId, checkinGymKey: this.state.checkinGymKey, userKeyInGym: this.state.userKeyInGym,
               barcodeId: this.state.barcodeId, barcodeURL: this.state.barcodeURL, gymName: this.state.gymName } })],
            });
            this.props.navigation.dispatch(resetAction);
          }, 800)

        } else {
          if (this.state.isLogin === 'success') {
            // AsyncStorage.setItem("check-in-time",getTime.toString())            
            AsyncStorage.getItem("check-in-time").then((value) => {
              console.log("Check in value", value)
              if (value !== null) {
                AsyncStorage.getItem("checkinKey").then((value) => {
                  console.log("checkinKey", value)
                  this.setState({
                    checkinKey: value
                  });
                })
                AsyncStorage.getItem("checkinGymKey").then((value) => {
                  console.log("checkinGymKey", value)
                  this.setState({
                    checkinGymKey: value
                  });
                })

                setTimeout(() => {
                  var data = moment(new Date()).diff(moment(value), 'hours')
                  console.log("Inside check-in-time compare values:", data)
                  if (data >= 2) {
                    const resetAction = NavigationActions.reset({
                      index: 0,
                      actions: [NavigationActions.navigate({ routeName: 'Rating', params: { comingFrom: 'splash', checkinKey: this.state.checkinKey, checkinGymKey: this.state.checkinGymKey } })],
                    });
                    this.props.navigation.dispatch(resetAction);
                  } else {
                    const resetAction = NavigationActions.reset({
                      index: 0,
                      actions: [NavigationActions.navigate({ routeName: 'Home' })],
                    });
                    this.props.navigation.dispatch(resetAction);
                  }
                }, 500)
              } else {
                const resetAction = NavigationActions.reset({
                  index: 0,
                  actions: [NavigationActions.navigate({ routeName: 'Home' })],
                });
                this.props.navigation.dispatch(resetAction);
              }
            })

          }
          //else navigate to LoginScreen
          else if (this.state.isLogin === null) {
            if (this.state.installApp === 'success') {
              const resetAction = NavigationActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'Login' })],
              });
              this.props.navigation.dispatch(resetAction);
            }
            else {
              const resetAction = NavigationActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'Walkthrough' })],
              });
              this.props.navigation.dispatch(resetAction);
            }
          }
        }
      }, 3000);

    }, 3000);
  }

  //User Define Functions


  //Main View Rendering

  render() {
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <ImageBackground source={ require('../../assets/Splash/02.png') } style={{ height: null, width: null, flex: 10 }}>
          <View style={styles.topview}></View>
          <View style={styles.middleview}>
            <Image source={ require('../../assets/splash_logo.png') } style={styles.logo} resizeMode="contain" />
          </View>
          <View style={styles.bottomview}>
          </View>
        </ImageBackground>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 10,
  },
  topview: {
    flex: 3,
  },
  middleview: {
    flex: 4,
    alignItems: 'center',
  },
  bottomview: {
    flex: 3,
  },
  logo: {
    flex: 1,
    width: (Dimensions.get('window').width - 90),
    height: 120,
  },

})
module.exports = SplashScreen
