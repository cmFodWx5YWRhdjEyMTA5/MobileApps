
//Dashboard

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
  RefreshControl,
  BackHandler,
  Linking,
} from 'react-native';

import Colors from './../Utils/Colors';
import Fonts from './../Utils/Fonts';
import { deviceHeight, deviceWidth } from './../Utils/DeviceDimensions';
import DeviceInfo from 'react-native-device-info';
import { NavigationActions } from 'react-navigation';
import * as firebase from 'firebase';
import Strings from './../Utils/Strings';
import HeaderStyle from './../Utils/HeaderStyle';
import Stars from 'react-native-stars';
import Spinner from 'react-native-loading-spinner-overlay';
import * as FirebaseUtils from './../Utils/FirebaseUtils';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import LocalNotification from 'react-native-local-notification';
//import FCM, { NotificationActionType } from "react-native-fcm";
// import Permissions from 'react-native-permissions';

const ModelIphoneX = 'iPhone X';
const StatusBarHeightIos = DeviceInfo.getModel() === ModelIphoneX ? 30 : 20;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? StatusBarHeightIos : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
var moment = require('moment');


const MyStatusBar = ({ backgroundColor, ...props }) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);


class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      curLatitude: '',
      curLongitude: '',
      arrTempGymData: [],
      arrMainGymData: [],
      displayNoData: false,
      currentCoin: '0',
      refreshing: false,
    }
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  _onRefresh() {
    this.setState({ refreshing: true });
    this.getCurrentLocation()

    setTimeout(() => {
      this.getGymData()
    }, 1000)
  }
  //handle Internetconnection
  handleConnectionChange = (isConnected) => {
    this.setState({ netStatus: isConnected });
    console.log(`is connected: ${this.state.netStatus}`);
  }
  async requestPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the ACCESS_FINE_LOCATION")
        this.fetchContacts()
      } else {
        console.log("ACCESS_FINE_LOCATION permission denied")
      }
    } catch (err) {
      console.warn(err)
    }
  }

  getCurrentLocation() {

    // navigator.geolocation.requestAuthorization()
    navigator.geolocation.getCurrentPosition((position) => {
      console.log("getCurrentLocation Latitude is", position.coords.latitude);
      this.setState({
        curLatitude: position.coords.latitude,
        curLongitude: position.coords.longitude
      });
    },
      (error) => {
        console.log("error is:-", error.message);
        if (error.message === "User denied access to location services.") {
          if (Platform.OS === 'ios') {
            Alert.alert(Strings.gymonkee, "Location service is turn off.\nWould you like to turn on?",
              [
                { text: 'Yes', onPress: () => { Linking.openURL('app-settings:') } },
                { text: 'No', style: 'cancel' }
              ],
              { cancelable: false }
            )
          }
        }
        else if (error.message === "Location request timed out") {
          this.getCurrentLocation()
        }
        else if (error.message === "No location provider available.") {

        }
      }, );


  }

  _startGpsLocation() {
    if (Platform.OS === 'android') {
      LocationServicesDialogBox.checkLocationServicesIsEnabled({
        message: "<h2>Use Your Current Location ?</h2>Gymonkee wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/>",
        ok: "YES",
        cancel: "NO",
        enableHighAccuracy: false, // true => GPS AND NETWORK PROVIDER, false => GPS OR NETWORK PROVIDER
        showDialog: true, // false => Opens the Location access page directly
        openLocationServices: true, // false => Directly catch method is called if location services are turned off
        preventOutSideTouch: false, //true => To prevent the location services popup from closing when it is clicked outside
        preventBackClick: false //true => To prevent the location services popup from closing when it is clicked back button
      }).then((success) => {
        // success => {alreadyEnabled: true, enabled: true, status: "enabled"}
        //this.getCurrentLocation()
        console.log("Success Start", "Location");

        this.getCurrentLocation()

        setTimeout(() => {
          this.getGymData()
        }, 2000)



      }
      ).catch((error) => {
        console.log(error.message);
      });

      BackHandler.addEventListener('hardwareBackPress', () => { //(optional) you can use it if you need it
        LocationServicesDialogBox.forceCloseDialog();
      });
    }

  }
  //Life Cycle Methods
  async componentWillMount() {
    await this.requestPermission()

    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    NetInfo.isConnected.fetch().done((isConnected) => { this.setState({ netStatus: isConnected }); });
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

  }

  componentDidMount() {
    this.getCurrentLocation()
    this._startGpsLocation()

    

    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    NetInfo.isConnected.fetch().done((isConnected) => { this.setState({ netStatus: isConnected }); });

    AsyncStorage.setItem(Strings.AsyncStorage_Key_isLogin, 'success');
    AsyncStorage.getItem("isLogin").then((value) => {
      console.log("componentDidMount -> Dashboard -> AsyncStorage.getItem() : ", value);
    }).done();

    var user = firebase.auth().currentUser;
    var currentUserRef = firebase.database().ref('User').child(user.uid);
    AsyncStorage.setItem("user_id", user.uid);

    // console.log("User Friends:",currentUserRef);
    currentUserRef.on('value', (data) => {
      // console.log("Data from login",data);
      var userData = data.val();
      var keys = Object.keys(userData);
      if (keys.length > 0) {
        var checkCoin = userData.hasOwnProperty('coinBalance')
        if (checkCoin === true) {
          this.setState({
            currentCoin: userData.coinBalance
          })
        }
        if (userData.hasOwnProperty('inviteURL')) {
          AsyncStorage.setItem("inviteURL", userData.inviteURL);
        }
      }
    })


    if (Platform.OS === 'ios') {
      setTimeout(() => {
        this.getGymData()

        console.log("Coin balance from utils", FirebaseUtils.getCurrenCoinUsingUid(user.uid));
      }, 1000)

    }

    // setTimeout(()=>{
    //       console.log("Deduct user coin from utils",FirebaseUtils.deductUserCoin(user.uid,10));
    // },1000)
   
    // const { state } = this.props.navigation;

    // if (state !== undefined || state !== null) {
    //   // if(state.params.comingFrom!==undefined){
    //   //   if (state.params.comingFrom === 'splash') {
    //   //     this.props.navigation.navigate('Scanner', {
    //   //       comingFrom: 'splash', checkinKey: state.params.checkinKey,
    //   //       afterCheckInUserCoins: state.params.afterCheckInUserCoins, afterCheckInPaygCoin: state.params.afterCheckInPaygCoin, afterCheckInMonthlyCoin: state.params.afterCheckInMonthlyCoin,
    //   //       gymId: state.params.gymId, checkinGymKey: state.params.checkinGymKey, userKeyInGym: state.params.userKeyInGym,
    //   //       barcodeId: state.params.barcodeId, barcodeURL: state.params.barcodeURL, gymName: state.params.gymName
    //   //     });
    //   // }
     
    //   // }
    // console.log("Coming From :", state.params.comingFrom);
   
     
    // }



  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  //true disable back
  //false unable back
  handleBackButtonClick() {
    console.log("Dashboard", "Device Back Button Pressed");
    return false;
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

  getGymData() {
    this.setState({ refreshing: false })
    NetInfo.isConnected.fetch().done((isConnected) => {
      this.setState({ netStatus: isConnected });

      if (isConnected) {
        this.setState({ loader: true, arrMainGymData: [], arrTempGymData: [] });
        var url = Strings.base_URL + 'getGymsHome?latitude=' + this.state.curLatitude + '&longitude=' + this.state.curLongitude
        console.log("CUrrent URL", url);
        fetch(url, {
          method: 'GET',
        }).then((response) => response.json())
          .then((responseData) => {
            //Alert.alert("KK",JSON.stringify(data))
            this.setState({ loader: false });
            //console.log("Response Gyms:",responseData);
            if (responseData.data.length > 0) {
              for (var i = 0; i < JSON.stringify(responseData.data.length); i++) {
                this.state.arrTempGymData.push(responseData.data[i])
                if (i === responseData.data.length - 1) {
                  this.setState({
                    arrMainGymData: this.state.arrTempGymData
                  })
                  setTimeout(() => {
                    //console.log("Array Gym Data is:",this.state.arrMainGymData);
                  }, 700)
                }
              }
            } else {
              this.setState({
                displayNoData: true
              })
              this.props.navigation.navigate('GymFinderScreen');
            }

          }).catch((error) => {
            this.setState({ loader: false });
            console.log("Error is:", error);
            // setTimeout(()=>{
            //   Alert.alert(Strings.gymonkee,error.message);
            // },1000)
          }).done();

      }
      else {
        Alert.alert(Strings.avanza, Strings.internet_offline);
      }
    });
  }

  // <Image source={{uri:'juice_white'}} resizeMode="contain" style={{height:35,width:30}} />
  //
  // <Image source={{uri:'bike_white'}} resizeMode="contain" style={{height:35,width:30}} />
  //
  //  <Image source={{uri:'pool_white'}} resizeMode="contain" style={{height:35,width:30}} />
  //
  // <Image source={{uri:'yoga_white'}} resizeMode="contain" style={{height:35,width:30}} />

  displayGymRender() {
    const { arrMainGymData } = this.state

    if (arrMainGymData.length > 0) {
      return arrMainGymData.map((data, index) => {
        var checkImg = data.hasOwnProperty('img');
        console.log("gym:" + data.name, "Rate:" + data.avgRate);
        return (
          <TouchableOpacity style={{ flex: 3, marginRight: 10, marginLeft: 10, marginTop: (Platform.OS === 'android') ? 0 : (DeviceInfo.getModel() === ModelIphoneX) ? 0 : 0, marginBottom: 10 }} onPress={() => this._gotoViewGym(index)}>
            <View style={{ flex: 3, }}>
              <ImageBackground borderRadius={8} source={{ uri: (checkImg === true) ? data.img[0] : 'near_me_img1' }} resizeMode="cover" style={{ flex: 3, }}>

                <ImageBackground borderRadius={8} source={{ uri: 'home_shadow_img' }} resizeMode="cover" style={{ flex: 3, marginTop: (Platform.OS === 'android') ? 0 : 0, }}>
                  <View style={{ flex: 1, marginTop: (Platform.OS === 'android') ? 0 : (DeviceInfo.getModel() === ModelIphoneX) ? 10 : (DeviceInfo.getModel() === 'iPhone SE') ? 0 : 0, paddingLeft: 16, marginBottom: (Platform.OS === 'android') ? 10 : (DeviceInfo.getModel() === ModelIphoneX) ? 18 : 12, paddingLeft: 16, paddingTop: 12, }}>

                    <View style={{ flex: 0.1 }}>
                      <Text style={styles.gym_name_text}>{data.name}</Text>
                    </View>
                    <View style={{ flex: 0.2, flexDirection: 'row', alignItems: 'center', marginLeft: -6, marginTop: 4, }}>

                      <Image source={{ uri: 'location_icon_yellow' }} resizeMode="contain" style={{ height: 25, width: 20, marginBottom: (Platform.OS === 'android') ? 0 : 4 }} />
                      <Text style={styles.miles_away_text}>{data.distance.toFixed(2)} miles away</Text>
                    </View>
                    <View style={{ flex: 0.09 }}>
                    </View>
                    <View style={{ flex: 0.2, alignItems: 'flex-start', marginLeft: -4, marginTop: 10 }}>
                      <Stars
                        half={true}
                        value={data.avgRate}
                        spacing={4}
                        count={5}
                        opacity={true}
                        starSize={30}
                        backingColor='transparent'
                        fullStar={{ uri: 'rating_fill' }}
                        halfStar={{ uri: 'rating_half_fill' }}
                        emptyStar={{ uri: 'rating_outer' }} />

                    </View>
                    <View style={{ flex: 0.45, }}>
                      <View style={{ flex: 2 }}>
                        <Text style={styles.coin_count_text_white}>{data.coins}</Text>
                      </View>
                      <View style={{ flex: (Platform.OS === 'android') ? 0 : 0 }}>
                      </View>
                      <View style={{ flex: 1.2, marginLeft: 8, marginTop: (Platform.OS === 'android') ? -14 : -8, flexDirection: 'row' }}>
                        <Text style={styles.coin_text_white}>{Strings.coins}</Text>
                        <View style={{ justifyContent: 'flex-start', flexDirection: 'row', marginTop: -16, marginLeft: 40 }}>
                          <FlatList
                            horizontal={true}
                            data={data.Services}
                            renderItem={({ item }) =>
                              <Image
                                source={{ uri: (item === 'Juice bar') ? 'juice_white' : (item === 'Cycle room') ? 'bike_white' : (item === 'Pool') ? 'pool_white' : (item === 'Yoga') ? 'yoga_white' : (item === 'Sauna') ? 'sauna_white' : (item === 'Basketball') ? 'basketball_white' : (item === 'Classes') ? 'classes_white' : '' }} resizeMode="contain" style={{ height: 35, width: 30 }} />}>
                          </FlatList>
                        </View>
                      </View>
                      <View style={{ flex: (Platform.OS === 'android') ? 0.2 : (DeviceInfo.getModel() === 'iPhone SE') ? 0.5 : (DeviceInfo.getModel() === ModelIphoneX) ? 1.5 : 1 }}>

                      </View>

                    </View>

                  </View>
                </ImageBackground>
              </ImageBackground>
            </View>
          </TouchableOpacity>
        )
      })
    } else {
      if (this.state.displayNoData === true) {
        return (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 25, marginTop: 100, fontFamily: Fonts.bold, color: Colors.header_red + '40' }}>Gyms coming soon...!</Text>
          </View>
        )
      }
    }
  }

  _onClickGetCoins() {
    //this.props.navigation.navigate('GetCoins');
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'GetCoins' })],
    });
    this.props.navigation.dispatch(resetAction);

    // this.scheduleLocalNotification()
  }
  // scheduleLocalNotification() {
  //   FCM.scheduleLocalNotification({
  //     id: "testnotif",
  //     fire_date: new Date().getTime() + 5000,
  //     vibrate: 500,
  //     title: "Hello",
  //     body: "Test Scheduled Notification",
  //     sub_text: "sub text",
  //     priority: "high",
  //     show_in_foreground: true,
  //     wake_screen: true,
  //     extra1: { a: 1 },
  //     extra2: 1
  //   });
  // }
  _gotoViewGym(index) {
    var arrData = this.state.arrMainGymData[index]
    console.log("Arrayy Dataa is:", arrData);
    AsyncStorage.setItem('gymDetail', JSON.stringify(arrData))
    AsyncStorage.setItem('gym_id', arrData.id)
    // AsyncStorage.setItem('gymBarCode',arrData.gymBarCode)

    this.props.navigation.navigate('ViewGym');

  }

  static navigationOptions = ({ navigation, screenProps }) => {
    const params = navigation.state.params || {};
    return {
      title: Strings.home,
      headerStyle: { backgroundColor: Colors.header_red, borderBottomWidth: 0, shadowColor: 'transparent', elevation: 0, marginTop: (Platform.OS === 'android') ? 20 : 0 },
      headerTitleStyle: { color: '#ffffff', alignSelf: 'center', textAlign: 'center', fontSize: 18, marginRight: (Platform.OS === 'ios') ? 20 : 0, justifyContent: 'center', fontWeight: '400', fontFamily: Fonts.SFU_REGULAR, },
      headerRight: <TouchableOpacity onPress={() => navigation.navigate('GymFinderScreen')}><View style={styles.icon_padding}><Image source={{ uri: "search_icon_white" }} style={styles.search_icon} /></View></TouchableOpacity>
    }
  }
  _onClickSearch() {
    //Alert.alert(Strings.gymonkee,"Under Implementation")
    this.props.navigation.navigate('GymFinderScreen');
  }

  showLongNotification() {
    this.refs.localNotification.showNotification({
      title: 'Notification title',
      text: 'This is a long notification. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam iaculis, mi ut vehicula hendrerit, neque justo scelerisque mi, sed finibus eros libero sit amet libero. Nam sed facilisis ante.',
      onPress: () => alert('hello long'),

    });
  }


  //Main View Rendering

  render() {
    return (
      <View style={styles.container}>
        
        <View style={{ alignItems: 'center' }}>
          {this.loader()}

        </View>


        <View style={{ flex: 10, backgroundColor: Colors.theme_background, }}>

          <View style={{ flex: 3, borderWidth: 0 }}>
            <ImageBackground source={ require('../../assets/Home-01/01.png')} resizeMode="contain" style={{ height: null, width: null, flex: 3, marginTop: (DeviceInfo.getModel() === ModelIphoneX) ? -55 : (DeviceInfo.getModel() === 'iPhone 8 Plus') ? -20 : (DeviceInfo.getModel() === 'iPhone 6 Plus') ? -20 : (Platform.OS === 'android') ? -40 : -10 }}>

            </ImageBackground>
          </View>
          <View>
            <TextInput
                  placeholder='Password'
                  style={{ fontFamily: Fonts.regular, fontSize: 15, color: Colors.white, borderWidth: 0, marginLeft: 5, marginTop: 12, flex: 1 }}
                  ref='password'
                  placeholderTextColor="rgb(241, 248, 247)"
                  secureTextEntry={true}
                  underlineColorAndroid='transparent'
                  onChangeText={(text) => this.setState({ password: text })}
                  value={this.state.password}
                  onFocus={() => this.onFocusText("password")}
                  onBlur={() => this.onBlurText("password")}
                  borderColor='#000'
                />
          </View>
          <View style={{ flex: 7, marginTop: (Platform.OS === 'android') ? -60 : (DeviceInfo.getModel() === ModelIphoneX) ? -90 : -40 }}>
            <View style={{ flex: 1, padding: (Platform.OS === 'android') ? 20 : 20, flexDirection: 'row' }}>

              <View style={{ flex: 1, borderWidth: 0, flexDirection: 'column' }}>
                <View style={{ flex: 0.5 }}>
                  <Text style={styles.current_balance_text}>{Strings.current_balance}</Text>
                </View>

                <View style={{ flex: 1, flexDirection: 'row' }}>
                  <View style={{ marginRight: 12 }}>
                    <Text style={styles.coin_count_text}>{this.state.currentCoin}</Text>
                  </View>
                  <View style={{ justifyContent: 'flex-end', marginBottom: (DeviceInfo.getModel() === ModelIphoneX) ? 10 : 0 }}>
                    <Text style={styles.coin_text}>{Strings.coins}</Text>
                  </View>
                </View>
              </View>

              <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
                <TouchableOpacity style={{ height: 40, width: 120, borderWidth: 1, borderRadius: 20, borderColor: Colors.header_red, alignItems: 'center', justifyContent: 'center', }} onPress={() => this._onClickGetCoins()}>
                  <Text style={{ fontFamily: Fonts.regular, fontSize: (DeviceInfo.getModel() === ModelIphoneX) ? 20 : (DeviceInfo.getModel() === 'iPhone 8 Plus') ? 18 : 16, color: Colors.header_red, marginTop: (Platform.OS === 'android') ? 0 : 4 }}>Buy Coins</Text>
                </TouchableOpacity>
              </View>

            </View>
            <View style={{ flex: 6 }}>

              <View style={{ flex: (DeviceInfo.getModel() === ModelIphoneX) ? 0 : 0.2, marginTop: (DeviceInfo.getModel() === ModelIphoneX) ? -50 : 0 }}>
              </View>

              <ScrollView refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this._onRefresh.bind(this)}
                />
              } showsVerticalScrollIndicator={false} style={{ marginTop: (DeviceInfo.getModel() === ModelIphoneX) ? 60 : 10 }}>

                {this.displayGymRender()}
              </ScrollView>

              <View style={{ flex: 3, borderWidth: 0 }}>
              </View>
            </View>


          </View>

        </View>



        <LocalNotification
          textStyle={{ color: Colors.header_red }}
          duration={10000}
          ref="localNotification" />

      </View>
    )
  }

}
const styles = StyleSheet.create({
  container: {
    flex: 10,
    marginTop: (Platform.OS === 'android') ? -140 : ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c')) ? -120 : -150,

  },
  statusBar: {
    height: STATUSBAR_HEIGHT,

  },
  appBar: {
    backgroundColor: '#79B45D',
    height: APPBAR_HEIGHT,
  },
  content: {
    flex: 1,
    backgroundColor: '#33373B',
  },
  current_balance_text: {
    fontSize: (deviceHeight > 600) ? 20 : 18,
    fontFamily: Fonts.regular,
    color: Colors.redcolor,

  },
  coin_count_text: {
    fontSize: (deviceHeight > 600) ? 40 : 30,
    fontFamily: Fonts.SFU_BOLD,
    color: Colors.orange_text,
  },
  coin_text: {
    fontSize: 22,
    fontFamily: Fonts.regular,
    color: Colors.redcolor,
  },
  gym_name_text: {
    fontSize: 22,
    fontFamily: Fonts.regular,
    color: Colors.white,
  },
  miles_away_text: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.white,
  },
  coin_count_text_white: {
    fontSize: 40,
    fontFamily: Fonts.SFU_BOLD,
    color: Colors.white,
  },
  coin_text_white: {
    fontSize: 16,
    fontFamily: Fonts.SFU_THIN,
    color: Colors.white,
  },
  icon_padding: {
    padding: 10,
  },
  search_icon: {
    height: (deviceHeight > 600) ? 20 : 18,
    width: (deviceHeight > 600) ? 20 : 18,
    marginRight: 10,
  },
})
module.exports = Dashboard

