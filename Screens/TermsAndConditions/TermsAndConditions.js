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

var user;
var cur_user_id;
var serverTime;

class TermsAndConditions extends Component {

  constructor(props) {
    super(props);
    this.userRef = firebase.database().ref().child('User');
    this.gymRef = firebase.database().ref().child('Gyms');
    // var temp = this.userRef.child(user.uid)
    // console.log("Temp isss:",temp);
    // temp.set({ email: email, firstname:fname, lastname:lname, state:state, city:city,gender:gender,birthdate:bdayMain,stripe_cust_id:responseData.id,coinBalance:0,createdAt:firebase.database.ServerValue.TIMESTAMP,createdBy:user.uid,status:1,updatedAt:firebase.database.ServerValue.TIMESTAMP,updatedBy:user.uid,lastLoginAt:firebase.database.ServerValue.TIMESTAMP});

    this.state = {
      tempPushData: [],
      dataGymDetails: [],
      barcodeFoundData: [],
      gym_id: '',
      profileImage: '',
      city: '',
      state: '',
      userCoin: '',
      user_id: '',
      loader: false,

    }
  }

  static navigationOptions = ({ navigation, screenProps }) => {
    const params = navigation.state.params || {};
    return {
      title: 'Liability & Waiver',
      gesturesEnabled: true,
      headerStyle: { backgroundColor: Colors.theme_background, borderBottomWidth: 0, shadowColor: 'transparent', elevation: 0, marginTop: (Platform.OS === 'android') ? 20 : 0 },
      headerTitleStyle: HeaderStyle.titleCenter_black,
      headerLeft: <TouchableOpacity onPress={() => navigation.goBack()}><View style={{ padding: 10 }}><Image source={{ uri: "back_arrow_red" }} style={{ height: (DeviceInfo.getModel() === ModelIphoneX) ? 30 : 23, width: (DeviceInfo.getModel() === ModelIphoneX) ? 30 : 23, }} /></View></TouchableOpacity>
    }
  }

  //Life Cycle Methods
  componentWillMount() {
    console.log("=====> You are in : ", this.props.navigation.state.routeName);
  }
  componentDidMount() {

    AsyncStorage.getItem("gym_id").then((value) => {
      console.log("Gym_Id: ", value);
      this.setState({
        gym_id: value
      })
    }).done();

    // AsyncStorage.getItem("gymDetail").then((value) => {
    //   // console.log("Detail Data ",JSON.parse(value));
    //   var data = JSON.parse(value)
    //   this.state.tempPushData.push(data)
    //   console.log("Gym Detail Data is:",data);
    //
    //   setTimeout(()=>{
    //     this.setState({
    //       dataGymDetails:this.state.tempPushData,
    //     })
    //   },700)
    //
    // }).done();



    AsyncStorage.getItem("city").then((value) => {
      this.setState({ city: value })
    }).done();

    AsyncStorage.getItem("state").then((value) => {
      this.setState({ state: value })
    }).done();

    AsyncStorage.getItem("profileImage").then((value) => {
      this.setState({ profileImage: value })
    }).done();

    AsyncStorage.getItem("user_id").then((value) => {
      this.setState({ user_id: value })
    }).done();


    setTimeout(() => {
      firebase.database().ref('User').child(this.state.user_id).on('value', (data) => {

        var userData = data.val();
        this.setState({
          userCoin: userData.coinBalance
        });
        console.log("UserCoin", this.state.userCoin);

      })

      this.getGymDataByGymId()
    }, 700)
  }


  getGymDataByGymId() {
    var gymData = firebase.database().ref().child('Gyms').child(this.state.gym_id)
    gymData.on('value', (data) => {
      this.setState({
        dataGymDetails: [],
      })
      var gymData = data.val();
      var gymkeys = Object.keys(gymData);

      if (gymkeys.length > 0) {
        this.setState({
          dataGymDetails: gymData,
        })
        setTimeout(() => {
          console.log("Gym data iss:-", this.state.dataGymDetails);
        }, 700)
      }
    })
  }


  _onClickAgree() {
    const { state } = this.props.navigation;
    const { dataGymDetails } = this.state;

    console.log("Gym Charge Coin", this.state.dataGymDetails.coins);
    console.log("Current User Coin", this.state.userCoin);
    var userCoin = this.state.userCoin;
    var gymChargeCoin = this.state.dataGymDetails.coins;
    if (userCoin >= gymChargeCoin) {
      this.setState({ loader: true });
      var gymCode = state.params.gymBarCode;
      var gymName = state.params.gymName;
      var checkKeys = Object.keys(this.state.dataGymDetails);
      console.log("Gym Code", gymCode);
      console.log("Gym Code keys", checkKeys);

      //Check whether Barcode Key is available in the database
      if (dataGymDetails.hasOwnProperty('Barcodes')) {
        var getBarcodeKeys = Object.keys(dataGymDetails.Barcodes)
        console.log("Check Log", dataGymDetails.Barcodes);


        for (var i = 0; i < JSON.stringify(getBarcodeKeys.length); i++) {
          console.log("Dataaaa>>>>", dataGymDetails.Barcodes[getBarcodeKeys[i]]);
          if (dataGymDetails.Barcodes[getBarcodeKeys[i]].status === 0) {
            user = firebase.auth().currentUser;
            cur_user_id = this.userRef.child(user.uid)
            serverTime = firebase.database.ServerValue.TIMESTAMP

            var barcodeRef = firebase.database().ref('Gyms').child(this.state.gym_id).child('Barcodes').child(getBarcodeKeys[i]);

            console.log("barcodeRef : ", barcodeRef.toString());

            var updateDict1 = {
              status: 1,
              updatedAt: serverTime,
              updatedBy: user.uid,
            };
            barcodeRef.update(updateDict1).then(() => {
              console.log("Successfully updated to status 1:::");

              console.log("Found Barcode With 0 Status", dataGymDetails.Barcodes[getBarcodeKeys[i]]);
              console.log("Found Barcode With Id", getBarcodeKeys[i]);
              var data = dataGymDetails.Barcodes[getBarcodeKeys[i]]

              //Set Data to user check in data


              var userCheckInDict = {
                gymId: this.state.gym_id,
                gymName: this.state.dataGymDetails.name,
                gymAmount: this.state.dataGymDetails.coins,
                dateTime: serverTime,
                status: 1,
                createdAt: serverTime,
                createdBy: user.uid,
                checkInStatus: 1,
                gymCoins: gymChargeCoin
              }


              var currentUserRef = this.userRef.child(user.uid)
              var gymCheckInDict;

              currentUserRef.once('value', (data) => {

                var userData = data.val();
                var keys = Object.keys(userData);
                if (keys.length > 0) {
                  var checkFName = userData.hasOwnProperty('firstname')
                  var checkLName = userData.hasOwnProperty('lastname')

                  if (checkFName === true) {
                    //Set data to Gym User check in
                    var username = userData.firstname + (checkLName === false ? '' : ' ' + userData.lastname)
                    console.log("user name is:", username);
                    gymCheckInDict = {
                      userId: user.uid,
                      userName: username,
                      userProfileImage: this.state.profileImage,
                      userCity: this.state.city,
                      userState: this.state.state,
                      dateTime: serverTime,
                      status: 1,
                      createdAt: serverTime,
                      createdBy: user.uid,
                      checkInStatus: 1,
                      barcodeId: getBarcodeKeys[i],
                      barcodeVal: dataGymDetails.Barcodes[getBarcodeKeys[i]].barcodeVal,
                      gymCoins: gymChargeCoin,
                      barcodeURL: dataGymDetails.Barcodes[getBarcodeKeys[i]].barcodeURL
                    }
                  }
                }
              }).then(() => {
                console.log("Success block");

                var pushKey;
                var userKeyInGym;
                firebase.database().ref('Gyms').child(this.state.gym_id + '/Users').push(gymCheckInDict).then((data) => {
                  console.log("Successfully pushed to Gym Table", data.key);
                  userKeyInGym = data.key

                  userCheckInDict.checkInId_Gym = data.key;
                  console.log("User Dictionary::", userCheckInDict);
                  firebase.database().ref('User').child(user.uid + '/CheckIn').push(userCheckInDict).then((data) => {
                    console.log("Successfully pushed to User Table", data.key);
                    //Push Data to Gym Table
                    pushKey = data.key
                    var afterCheckInUserCoins = parseInt(userCoin) - parseInt(gymChargeCoin);
                    this.setState({ loader: false });
                    this.props.navigation.navigate('Scanner', { comingFrom: 'normal', userKeyInGym: userKeyInGym, gymBarCode: gymCode, gymName: gymName, gymId: this.state.gym_id, checkinKey: pushKey, checkinGymKey: userKeyInGym, barcodeId: getBarcodeKeys[i], barcodeURL: dataGymDetails.Barcodes[getBarcodeKeys[i]].barcodeURL, afterCheckInUserCoins: afterCheckInUserCoins.toString() });
                  })
                })
                console.log("Gym Check in Dict", gymCheckInDict);
              })
            })



            return;

            //Set Check in Data to the Firebase Database Name ::- "User"
            // setTimeout(()=>{
            //   //Push Data to User Table
            //   firebase.database().ref('User').child(user.uid+'/CheckIn').push(userCheckInDict).then((data)=>{
            //     console.log("Successfully pushed to User Table",data.key);
            //       //Push Data to Gym Table
            //       pushKey = data.key
            //       firebase.database().ref('Gyms').child(this.state.gym_id+'/Users').push(gymCheckInDict).then((data)=>{
            //         console.log("Successfully pushed to Gym Table",data.key);
            //
            //         var barcodeRef = firebase.database().ref('Gyms').child(this.state.gym_id).child('Barcodes').child(getBarcodeKeys[i]);
            //
            //         console.log("barcodeRef : ", barcodeRef.toString());
            //
            //         var updateDict1 = {
            //           status : 1,
            //           updatedAt : serverTime,
            //           updatedBy : user.uid,
            //         };
            //
            //         barcodeRef.update(updateDict1);
            //         var afterCheckInUserCoins = parseInt(userCoin) - parseInt(gymChargeCoin);
            //
            //         this.setState({loader:false});
            //         this.props.navigation.navigate('Scanner',{gymBarCode:gymCode,gymName:gymName,gymId:this.state.gym_id,checkinKey:pushKey,checkinGymKey:data.key,barcodeId:getBarcodeKeys[i],barcodeURL:dataGymDetails.Barcodes[getBarcodeKeys[i]].barcodeURL,afterCheckInUserCoins:afterCheckInUserCoins});
            //       })
            //   })
            // },1000)


          } else {
            if (i === getBarcodeKeys.length - 1) {
              if (dataGymDetails.Barcodes[getBarcodeKeys[i]].status === 1 || dataGymDetails.Barcodes[getBarcodeKeys[i]].status === -1) {
                this.setState({ loader: false });
                setTimeout(() => {
                  Alert.alert(Strings.gymonkee, "There is no barcodes available for this gym.")
                }, 700)
              }
              return;
            }
          }
        }
      } else {
        this.setState({ loader: false });
        setTimeout(() => {
          Alert.alert(Strings.gymonkee, "There is no barcodes available for this gym.")
        }, 700)
      }
    }
    else {


      Alert.alert(Strings.gymonkee, "You don’t have enough coins available to swing in. Would you like to purchase coins?",
        [
          { text: "Yes", onPress: () => this._navigateToScreen('GetCoins') },
          { text: 'No', onPress: () => this._navigateToScreen('Dashboard'), style: 'cancel' }
        ],
        { cancelable: false }
      )
    }


  }

  _navigateToScreen(routename) {
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: routename })],
    });
    this.props.navigation.dispatch(resetAction);
  }
  //loader
  loader() {
    if (this.state.loader) {
      return (
        <View>
          <Spinner visible={this.state.loader} textContent={""} textStyle={{ color: '#3e4095' }} color={Colors.header_red} />
        </View>
      )
    }
  }
  render() {
    return (
      <View style={styles.container}>
        <MyStatusBar
          backgroundColor={Colors.theme_background}
          barStyle="light-content"
        />
        <View style={{ alignItems: 'center' }}>
          {this.loader()}
        </View>
        <View style={{ flex: 1 }}>
          <WebView
            automaticallyAdjustContentInsets={true}
            javaScriptEnabled={true}
            source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/gymonkee-3cad2.appspot.com/o/Resources%2FTermsAndCondition.html?alt=media' }}
            style={{ backgroundColor: 'rgba(211, 211, 211 , 0)' }}
          />
        </View>
        <View>
          <TouchableOpacity style={{ height: 120, width: deviceWidth }} onPress={() => this._onClickAgree()}>
            <ImageBackground style={{ flex: (DeviceInfo.getModel() === ModelIphoneX) ? 2.5 : 2.2, height: null, width: null }} source={{ uri: 'shape_red_bottom' }} resizeMode="stretch">
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 0, marginTop: 50 }}>
                <Text style={{ color: Colors.white, fontFamily: Fonts.regular, fontSize: (deviceHeight >= 600) ? 24 : 20 }}>Agree</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

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
  statusBar: {
    height: STATUSBAR_HEIGHT,

  },
  appBar: {
    backgroundColor: '#79B45D',
    height: APPBAR_HEIGHT,
  },
})

module.exports = TermsAndConditions
