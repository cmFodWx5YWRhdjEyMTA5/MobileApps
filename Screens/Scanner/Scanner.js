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
  AppState,
  BackHandler,
} from 'react-native';

import Colors from './../Utils/Colors';
import Fonts from './../Utils/Fonts';
import HeaderStyle from './../Utils/HeaderStyle';
import DeviceInfo from 'react-native-device-info';
import { NavigationActions } from 'react-navigation';
import * as firebase from 'firebase';
import Strings from './../Utils/Strings';
import { AccessToken, LoginManager } from 'react-native-fbsdk';
import { GoogleSignin } from 'react-native-google-signin';
import Spinner from 'react-native-loading-spinner-overlay';
import { RNCamera } from 'react-native-camera';

const ModelIphoneX = 'iPhone X';
const StatusBarHeightIos = DeviceInfo.getModel() === ModelIphoneX ? 30 : 20;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? StatusBarHeightIos : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

var deviceHeight = Dimensions.get('window').height;
var deviceWidth = Dimensions.get('window').width;

const MyStatusBar = ({ backgroundColor, ...props }) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);


class Scanner extends Component {

  constructor(props) {
    super(props);
    {
      this.state = {
        gymName: '',
        barcodeUrl: '',
        barcodeId: '',
        gym_id: '',
        isOkBtnClickable: false,
        user_id: '',
        appState: AppState.currentState,
        gymChargeCoin: '',
        comingFrom: ''

      }
    }
  }

  static navigationOptions = ({ navigation, screenProps }) => {
    const params = navigation.state.params || {};
    return {
      title: '',
      gesturesEnabled: true,
      headerStyle: { backgroundColor: Colors.theme_background, borderBottomWidth: 0, shadowColor: 'transparent', elevation: 0, marginTop: (Platform.OS === 'android') ? 20 : 0 },
      headerTitleStyle: HeaderStyle.titleCenter_black,
      headerLeft: <TouchableOpacity onPress={() => params.gotoBackS()}><View style={{ marginRight: 10 }}><Image source={{ uri: "back_arrow_red" }} style={{ height: (DeviceInfo.getModel() === ModelIphoneX) ? 30 : 23, width: (DeviceInfo.getModel() === ModelIphoneX) ? 30 : 23, marginLeft: 10, }} /></View></TouchableOpacity>
      // headerLeft: <TouchableOpacity onPress={()=> navigation.goBack()}><View style={{marginRight:10}}><Image source={{uri: "back_arrow_white"}} style={{height: (DeviceInfo.getModel() === ModelIphoneX)?30:23, width: (DeviceInfo.getModel() === ModelIphoneX)?30:23,marginLeft:10,}} /></View></TouchableOpacity>
    }
  }

  //Life Cycle Methods
  componentWillMount() {

  }

  // Go back to previous screen
  gotoBackScreen() {
    if (!this.state.isOkBtnClickable) {
      const { state } = this.props.navigation;
      console.log("Call BackScreen Func");
      var barcodeRef = firebase.database().ref('Gyms').child(this.state.gym_id).child('Barcodes').child(this.state.barcodeId);
      var userRef = firebase.database().ref('Gyms').child(this.state.gym_id).child('Users')
      console.log("barcodeRef : ", barcodeRef.toString());

      //change barcode status as non used when user back
      var updateDict1 = {
        status: 0,
        updatedAt: firebase.database.ServerValue.TIMESTAMP,
      };

      //delete entry from user/user_id/checkin/checkinkey
      var checkInUserRef = firebase.database().ref('User').child(this.state.user_id).child('CheckIn');
      checkInUserRef.child(state.params.checkinKey).remove();

      //delete from gyms/users/userKeyInGym
      barcodeRef.update(updateDict1).then(() => {
        userRef.child(state.params.userKeyInGym).remove().then(() => {
          AsyncStorage.removeItem("check-in-time")
          if (this.state.comingFrom === "splash") {
            AsyncStorage.setItem("isAppKill", 'false');
            const resetAction = NavigationActions.reset({
              index: 0,
              key: null,
              actions: [NavigationActions.navigate({ routeName: 'Home' })],
            });
            this.props.navigation.dispatch(resetAction);
          } else {
            this.props.navigation.goBack()
          }

        })
      })

    }


  }
  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
    BackHandler.removeEventListener('hardwareBackPress', this.onClickHardwareBackBtn)
  }

  _handleAppStateChange = (nextAppState) => {
    // if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
    //   console.log('App has come to the foreground!')
    // }
    const { state } = this.props.navigation;
    this.setState({ appState: nextAppState });
    console.log("Application State is::", nextAppState);
    if (nextAppState === 'background') {
      AsyncStorage.setItem("isAppKill", 'true');
      AsyncStorage.setItem("gymId", state.params.gymId)
      AsyncStorage.setItem("checkinGymKey", state.params.checkinGymKey)
      AsyncStorage.setItem("userKeyInGym", state.params.userKeyInGym)
      AsyncStorage.setItem("barcodeId", state.params.barcodeId)
      AsyncStorage.setItem("barcodeURL", state.params.barcodeURL)
      AsyncStorage.setItem("gymName", state.params.gymName)
      AsyncStorage.setItem("checkinKey", state.params.checkinKey)
      AsyncStorage.setItem("afterCheckInUserCoins", state.params.afterCheckInUserCoins)
      AsyncStorage.setItem("afterCheckInPaygCoin", state.params.afterCheckInPaygCoin)
      AsyncStorage.setItem("afterCheckInMonthlyCoin", state.params.afterCheckInMonthlyCoin)

    } else {
      AsyncStorage.removeItem("isAppKill");
    }
  }

  onClickHardwareBackBtn = () => {
    const { state } = this.props.navigation;
    console.log("Call BackScreen Func");
    var barcodeRef = firebase.database().ref('Gyms').child(this.state.gym_id).child('Barcodes').child(this.state.barcodeId);
    var userRef = firebase.database().ref('Gyms').child(this.state.gym_id).child('Users')
    console.log("barcodeRef : ", barcodeRef.toString());

    //change barcode status as non used when user back
    var updateDict1 = {
      status: 0,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
    };

    //delete entry from user/user_id/checkin/checkinkey
    var checkInUserRef = firebase.database().ref('User').child(this.state.user_id).child('CheckIn');
    checkInUserRef.child(state.params.checkinKey).remove();

    //delete from gyms/users/userKeyInGym
    barcodeRef.update(updateDict1).then(() => {
      userRef.child(state.params.userKeyInGym).remove().then(() => {
        AsyncStorage.removeItem("check-in-time")
        if (this.state.comingFrom === "splash") {
          AsyncStorage.setItem("isAppKill", 'false');
          const resetAction = NavigationActions.reset({
            index: 0,
            key: null,
            actions: [NavigationActions.navigate({ routeName: 'Home' })],
          });
          this.props.navigation.dispatch(resetAction);
        } else {
          this.props.navigation.goBack()
        }

      })
    })
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    BackHandler.addEventListener('hardwareBackPress', this.onClickHardwareBackBtn)

    this.props.navigation.setParams({
      gotoBackS: this.gotoBackScreen.bind(this)
    })

    const { state } = this.props.navigation;

    this.setState({
      gymName: state.params.gymName,
      barcodeUrl: state.params.barcodeURL,
      barcodeId: state.params.barcodeId,
      gym_id: state.params.gymId,
      gymChargeCoin: state.params.gymChargeCoin,
      comingFrom: state.params.comingFrom,
    });
    console.log("Coming From :", state.params.comingFrom);

    AsyncStorage.getItem("user_id").then((value) => {
      this.setState({ user_id: value })
    }).done();

    setTimeout(() => {
      var currentUserRef = firebase.database().ref('Gyms').child(this.state.gym_id + '/Users')
      currentUserRef.on('value', (data) => {
        if (data.exists()) {
          var userData = data.val();
          var keys = Object.keys(userData);
          console.log("User Data:", userData);
          if (keys.length > 0) {
            for (var i = 0; i < keys.length; i++) {
              var isCheckInKeyAvailable = userData[keys[i]].hasOwnProperty("barcodeId")
              if (isCheckInKeyAvailable) {
                if (userData[keys[i]].barcodeId === state.params.barcodeId) {
                  console.log("Match Barcode in Users in Gym");
                  if (userData[keys[i]].checkInStatus === 1) {
                    this.setState({
                      isOkBtnClickable: false
                    })
                  } else {
                    this.setState({
                      isOkBtnClickable: true
                    })
                    var balance = parseInt(state.params.afterCheckInUserCoins)
                    var paygBalance = parseInt(state.params.afterCheckInPaygCoin)
                    var monthlyBalance = parseInt(state.params.afterCheckInMonthlyCoin)

                    console.log("Balance iss::", balance);
                    firebase.database().ref('User').child(this.state.user_id).update({ coinBalance: balance, paygCoin: paygBalance, monthlyCoin: monthlyBalance }); // update user coin after check in success
                  }
                  return;
                }
              }
            }
            console.log("Gym User Data");
          }
        }
      })


    }, 700)

  }
  _navigateToOtherScreen(screen) {
    const { state } = this.props.navigation;
    console.log("Scanner checkinKey", state.params.checkinKey);
    console.log("Scanner checkinGymKey", state.params.checkinGymKey);
    AsyncStorage.removeItem("isAppKill")
    firebase.database().ref('CoinTransaction').push({ coins: this.state.gymChargeCoin, createdAt: firebase.database.ServerValue.TIMESTAMP, frinedId: "", planType: "", trxType: 'CHECKIN', userId: this.state.user_id, createdAt: firebase.database.ServerValue.TIMESTAMP, createdBy: this.state.user_id, status: 1, updatedAt: firebase.database.ServerValue.TIMESTAMP, updatedBy: this.state.user_id, subscriptionId: "" });


    this.props.navigation.navigate(screen, { comingFrom: state.params.comingFrom, comeFrom: 'scanner', checkinKey: state.params.checkinKey, checkinGymKey: state.params.checkinGymKey });
  }

  gotoCamera() {
    const { state } = this.props.navigation
    this.props.navigation.navigate("OpenCameraView", { gymBarCode: state.params.gymBarCode })
  }

  onClickOk() {
    console.log("Click Ok");
  }
  _goToDashBoard() {


    const { state } = this.props.navigation;
    console.log("Call BackScreen Func");
    var barcodeRef = firebase.database().ref('Gyms').child(this.state.gym_id).child('Barcodes').child(this.state.barcodeId);
    var userRef = firebase.database().ref('Gyms').child(this.state.gym_id).child('Users')
    console.log("barcodeRef : ", barcodeRef.toString());

    //change barcode status as non used when user back
    var updateDict1 = {
      status: 0,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
    };

    //delete entry from user/user_id/checkin/checkinkey
    var checkInUserRef = firebase.database().ref('User').child(this.state.user_id).child('CheckIn');
    checkInUserRef.child(state.params.checkinKey).remove();

    //delete from gyms/users/userKeyInGym
    barcodeRef.update(updateDict1).then(() => {
      userRef.child(state.params.userKeyInGym).remove().then(() => {
        AsyncStorage.removeItem("check-in-time")
        AsyncStorage.setItem("isAppKill", 'false');
        const resetAction = NavigationActions.reset({
          index: 0,
          key: null,
          actions: [NavigationActions.navigate({ routeName: 'Home' })],
        });
        this.props.navigation.dispatch(resetAction);
      })
    })



  }
  render() {
    return (
      <View style={styles.container}>

        {(this.state.comingFrom === "splash") ?
          <TouchableOpacity onPress={() => this._goToDashBoard()}>
            <View style={{ marginRight: 10 }}><Image source={{ uri: "back_arrow_red" }} style={{ height: (DeviceInfo.getModel() === ModelIphoneX) ? 30 : 23, width: (DeviceInfo.getModel() === ModelIphoneX) ? 30 : 23, marginLeft: 10, }} /></View>
          </TouchableOpacity> : <View></View>
        }

        <View style={{ flex: 1, borderWidth: 0, justifyContent: 'center', alignItems: 'center', }}>


          <View style={{ flex: 0.8, borderWidth: 0, flexDirection: 'row', alignItems: 'center', marginLeft: 20, marginRight: 20 }}>
            <Text style={{ color: Colors.title_text, fontFamily: Fonts.regular, fontSize: (deviceHeight >= 600) ? 30 : 26, textAlign: 'center' }}>Check in at the {this.state.gymName}</Text>
          </View>

        </View>

        <View style={{ flex: 1.5, borderWidth: 0, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#d86a1d', fontFamily: Fonts.regular, fontSize: (deviceHeight >= 600) ? 26 : 20, textAlign: 'center' }}>{Strings.you_will_have_to}</Text>
        </View>

        <View style={{ flex: 4.5, borderWidth: 0, justifyContent: 'center', alignItems: 'center' }}>
          <Image style={{ height: 35, width: 35, borderWidth: 0 }} source={{ uri: (this.state.isOkBtnClickable === true) ? 'accept_icon' : 'denied_icon' }} resizeMode="contain" />
          <Image style={{ height: (deviceHeight >= 600) ? 100 : 50, width: (deviceHeight >= 600) ? 250 : 200, borderWidth: 0 }} source={{ uri: this.state.barcodeUrl }} resizeMode="contain" />

        </View>

        <View style={{ flex: 1.9, borderWidth: 0 }}>
         
            <View style={{ flex: 1, justifyContent: 'center',backgroundColor:'#d86a1d' }}>
      
              <View style={{ flex: 0.2, alignItems: 'center' }}>
                {(this.state.isOkBtnClickable === true) ? <Text onPress={() => this._navigateToOtherScreen("Rating")} style={{ color: Colors.white, fontFamily: Fonts.semi_bold, fontSize: (deviceHeight >= 600) ? 26 : 22 }}>OK</Text> : <Text style={{ color: Colors.white, fontFamily: Fonts.semi_bold, fontSize: (deviceHeight >= 600) ? 26 : 22 }}>OK</Text>}
              </View>
              <View style={{ alignItems: 'center', flex: 0.27, justifyContent: 'flex-end' }}>
                <Text style={{ color: Colors.black, fontFamily: Fonts.regular, fontSize: (deviceHeight >= 600) ? 20 : 16 }} onPress={() => this.gotoBackScreen()}>Terms & Conditions</Text>
              </View>
              <View style={{ flex: 0.03 }}>
              </View>
            </View>

        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 10,
    backgroundColor: Colors.theme_background,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  statusBar: {
    height: STATUSBAR_HEIGHT
  },
  appBar: {
    backgroundColor: '#79B45D',
    height: APPBAR_HEIGHT,
  },
})

module.exports = Scanner
