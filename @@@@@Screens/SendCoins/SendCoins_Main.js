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

var moment = require('moment');

var deviceHeight = Dimensions.get('window').height;
var deviceWidth = Dimensions.get('window').width;

const MyStatusBar = ({ backgroundColor, ...props }) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);


class SendCoins_Main extends Component {

  constructor(props) {
    super(props);
    this.frndId = firebase.database().ref().child('User');
    this.state = {
      frndName: '',
      frndId: '',
      coin: '',
      userCoins: '',
      userId: '',
      isNullCoinKey: false,
      frndCoin: '',
      isNullFriendPaygKey:false,
      friendPayGCoin:'',
      paygCoin: '',
      monthlyCoin: '',
      monthlyUsableCoin: 0,
      paygUsableCoin: 0,
    }
  }

  static navigationOptions = ({ navigation, screenProps }) => {
    const params = navigation.state.params || {};
    return {
      title: '',
      gesturesEnabled: true,
      headerStyle: { backgroundColor: Colors.theme_background, borderBottomWidth: 0, shadowColor: 'transparent', elevation: 0, marginTop: (Platform.OS === 'android') ? 20 : 0 },
      headerTitleStyle: HeaderStyle.titleCenter_black,
      headerLeft: <TouchableOpacity onPress={() => navigation.goBack()}><View style={{ marginRight: 10 }}><Image source={{ uri: "back_arrow_white" }} style={{ height: (DeviceInfo.getModel() === ModelIphoneX) ? 30 : 23, width: (DeviceInfo.getModel() === ModelIphoneX) ? 30 : 23, marginLeft: 10, }} /></View></TouchableOpacity>
    }
  }

  //Life Cycle Methods
  componentWillMount() {

  }
  componentDidMount() {
    const { state } = this.props.navigation;
    this.setState({
      frndName: state.params.userFrndName,
      frndId: state.params.userFrndId
    })
    setTimeout(() => {
      this.getUserCoins()
    }, 700)

  }

  getUserCoins() {
    var currentUser = firebase.auth().currentUser;
    var currentUserRef = firebase.database().ref('User').child(currentUser.uid);

    // console.log("User Friends:",currentUserRef);
    currentUserRef.on('value', (data) => {
      // console.log("Data from login",data);
      var userData = data.val();
      var keys = Object.keys(userData);
      if (keys.length > 0) {
        this.setState({
          userId: currentUser.uid,
          userCoins: userData.coinBalance,
          paygCoin: userData.paygCoin,
          monthlyCoin: userData.monthlyCoin,
        })

        if (this.state.paygCoin === undefined) {
          this.setState({
            paygCoin: 0
          })
        }
        if (this.state.monthlyCoin === undefined) {
          this.setState({
            monthlyCoin: 0
          })
        }
        console.log("Keys are", keys);
        console.log("UserCoin", this.state.userCoins);
        console.log("paygCoin", this.state.paygCoin);
        console.log("monthlyCoin", this.state.monthlyCoin);
      }
    })


    var frndData = firebase.database().ref('User').child(this.state.frndId);
    frndData.on('value', (data) => {
      var frndData = data.val();
      var keys = Object.keys(frndData);

      console.log("Frnd Coins:", frndData.coinBalance);
      if (frndData.coinBalance === undefined) {
        this.setState({
          isNullCoinKey: true,
        })
      } else {
        this.setState({
          frndCoin: frndData.coinBalance
        })
      }

      if(frndData.paygCoin===undefined){
        this.setState({
          friendPayGCoin:0,
        })
      } else {
        this.setState({
          friendPayGCoin: frndData.paygCoin
        })
      }

    })
  }

  gotoDashboard() {
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Dashboard' })],
    });
    this.props.navigation.dispatch(resetAction);
  }
  _displaySendCoinsAlert() {
    Alert.alert(Strings.gymonkee, "Are you sure want to send coins?",
      [
        { text: "Yes", onPress: () => this._sendCoins() },
        { text: 'No', style: 'cancel' }
      ],
      { cancelable: false }
    )
  }
  _sendCoins() {
    // Alert.alert("Send Coins","Under Implementation");
    var coin = parseInt(this.state.coin);
    var paygCoin = this.state.paygCoin;
    var monthlyCoin = this.state.monthlyCoin;

    console.log("Coin Value", coin);
    if (coin > 0) {
      if (this.state.coin === '') {
        Alert.alert(Strings.gymonkee, "Please add coins")
      } else if (this.state.coin > this.state.userCoins) {
        Alert.alert(Strings.gymonkee, "You don't have that much coins to send")
      } else if (this.state.userCoins === 0) {
        Alert.alert(Strings.gymonkee, "You don't have that much coins to send")
      } else {

        if (monthlyCoin >= coin) {
          this.setState({
            monthlyUsableCoin: coin
          })
        } else {
          if (monthlyCoin === 0) {
            this.setState({
              paygUsableCoin: coin
            })
          } else {
            var remainCountCoin = coin - monthlyCoin;
            this.setState({
              monthlyUsableCoin: monthlyCoin,
              paygUsableCoin: remainCountCoin
            })

          }
        }

        var currentUser = firebase.auth().currentUser;
        var currentUserRef = firebase.database().ref('User').child(currentUser.uid);

        var createTransaction = firebase.database().ref('CoinTransaction')
        console.log("Temp isss:", createTransaction);
        var dt = moment(new Date()).format('MM/DD/YYYY');

        createTransaction.push({ coins: this.state.coin, createdAt: dt, frinedId: this.state.frndId, planType: 'GIFT2FRIEND', trxType: 'SEND_TO_FRIEND', userId: this.state.userId,subscriptionId:"" }).then(() => {
          //Minus Coins From User database
          var userCoins = parseInt(this.state.userCoins) - parseInt(this.state.coin)
          var afterSendPaygCoin = paygCoin - this.state.paygUsableCoin;
          var afterSendMonthlyCoin = monthlyCoin - this.state.monthlyUsableCoin;
          console.log("Minus User Coins:", userCoins);
          currentUserRef.update({ coinBalance: userCoins, paygCoin: afterSendPaygCoin, monthlyCoin: afterSendMonthlyCoin }).then(() => {
            //Plus Coins To Friend Database
            if (this.state.isNullCoinKey === true) {
              var frndData = firebase.database().ref('User').child(this.state.frndId);
              frndData.update({ coinBalance: this.state.coin ,paygCoin:this.state.coin})
            } else {
              var coinAdd = parseInt(this.state.frndCoin) + parseInt(this.state.coin)
              var coinAddPayG=parseInt(this.state.friendPayGCoin) + parseInt(this.state.coin)
              var frndData = firebase.database().ref('User').child(this.state.frndId);
              frndData.update({ coinBalance: coinAdd ,paygCoin:coinAddPayG}).then(() => {
                console.log("Successfully Send to frnd");
                Alert.alert(Strings.gymonkee, "You have Successfully sent coins to your friend.",
                  [
                    { text: 'OK', onPress: () => { this.gotoDashboard() } }
                  ]
                )
              })
            }

          })


        }).catch((error) => {
          console.log("Error Occur while transaction");
        })



      }
    }
    else {
      Alert.alert(Strings.gymonkee, "Please enter valid coins.")
    }


  }
  render() {
    return (
      <View style={styles.container}>
        <MyStatusBar backgroundColor={Colors.theme_background} barStyle="dark-content" hidden={false} />
        <View style={{ flex: 8, borderWidth: 0 }}>
          <View style={{ flex: 7 }}>

            <View style={{ flex: 5 }}>
              <ImageBackground style={{ flex: (DeviceInfo.getModel() === ModelIphoneX) ? 2.5 : 2.2, height: null, width: null }} source={{ uri: 'coins' }} resizeMode="center" />
            </View>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
              <View style={{ flex: 0.05 }} />
              <View style={{ flex: 0.9, borderWidth: 0, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ justifyContent: 'center', color: Colors.redcolor, fontFamily: Fonts.regular, fontSize: (DeviceInfo.getModel() === ModelIphoneX) ? 24 : (DeviceInfo.getModel() === 'iPhone 6') ? 26 : 22 }}>How many do you want to</Text>
                <Text style={{ justifyContent: 'center', color: Colors.redcolor, fontFamily: Fonts.regular, fontSize: (DeviceInfo.getModel() === ModelIphoneX) ? 24 : (DeviceInfo.getModel() === 'iPhone 6') ? 26 : 22 }}> send to {this.state.frndName}?</Text>
              </View>
              <View style={{ flex: 0.05 }} />
            </View>

            <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: Colors.redcolor, marginLeft: 120, marginRight: 120 }}>
              <TextInput
                style={{ fontFamily: Fonts.regular, fontSize: (deviceHeight > 600) ? 25 : 20, color: Colors.redcolor, borderWidth: 0, marginTop: 12, flex: 1 }}
                ref='coin'
                textAlign="center"
                underlineColorAndroid='transparent'
                onChangeText={(text) => this.setState({ coin: text })}
                value={this.state.coin}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>

          </View>
          <View style={{ flex: 1 }}></View>
        </View>

        <View style={{ flex: 2, borderWidth: 0 }}>
          <TouchableOpacity style={{ flex: (DeviceInfo.getModel() === ModelIphoneX) ? 2.5 : 2.2, height: null, width: null }} onPress={() => this._displaySendCoinsAlert()}>
            <ImageBackground style={{ flex: (DeviceInfo.getModel() === ModelIphoneX) ? 2.5 : 2.2, height: null, width: null }} source={{ uri: 'shape_red_bottom' }} resizeMode="stretch">
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 0, marginTop: 50 }}>
                <Text style={{ color: Colors.white, fontFamily: Fonts.regular, fontSize: (DeviceInfo.getModel() === ModelIphoneX) ? 26 : (DeviceInfo.getModel() === 'iPhone 6') ? 24 : 20 }}>Send</Text>
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
    height: STATUSBAR_HEIGHT
  },
  appBar: {
    backgroundColor: '#79B45D',
    height: APPBAR_HEIGHT,
  },
})

module.exports = SendCoins_Main
