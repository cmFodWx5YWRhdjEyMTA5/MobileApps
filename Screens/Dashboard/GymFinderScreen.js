
//GymFinder

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
import { deviceHeight, deviceWidth } from './../Utils/DeviceDimensions';
import DeviceInfo from 'react-native-device-info';
import { NavigationActions } from 'react-navigation';
import * as firebase from 'firebase';
import Strings from './../Utils/Strings';
import HeaderStyle from './../Utils/HeaderStyle';
import Stars from 'react-native-stars';
import Spinner from 'react-native-loading-spinner-overlay';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

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

const DEFAULT_PADDING = { top: 40, right: 40, bottom: 40, left: 40 };
const defaultLat = 35.18816400000001
const defaultLong = -80.879526

class GymFinderScreen extends Component {

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
      markers: [],
      region: {
        latitude: 36.778259,
        longitude: -119.417931,
        latitudeDelta: 0,
        longitudeDelta: 0,
      },
      search_text: '',
      srchData: [],
      searchCancelVisible: false,
    }
    this.mapRef = null;
  }

  //handle Internetconnection
  handleConnectionChange = (isConnected) => {
    this.setState({ netStatus: isConnected });
    console.log(`is connected: ${this.state.netStatus}`);
  }

  getCurrentLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log("Latitude is", position.coords.latitude);
      this.setState({
        curLatitude:position.coords.latitude,
        curLongitude:position.coords.longitude
      });
    },
      (error) => {

        console.log("error is:-", error.message);

        if (error.message === "User denied access to location services.") {

        }
        else if (error.message === "No location provider available.") {

        }
      });
  }

  //Life Cycle Methods
  componentWillMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    NetInfo.isConnected.fetch().done((isConnected) => { this.setState({ netStatus: isConnected }); });

  }
  componentDidMount() {
    this.getCurrentLocation()
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
      }
    })

    setTimeout(() => {
      this.getGymData()
    }, 1000)

    // setTimeout(()=>{
    //   this.mapRef.fitToCoordinates(this.state.markers, {
    //         edgePadding: DEFAULT_PADDING,
    //         animated: true,
    //       });
    //     },5000)


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
    NetInfo.isConnected.fetch().done((isConnected) => {
      this.setState({ netStatus: isConnected });

      if (isConnected) {
        console.log("CurLatitude:",this.state.curLatitude)
        this.setState({ loader: true });
        var url = Strings.base_URL + 'getGyms?latitude=' + this.state.curLatitude + '&longitude=' + this.state.curLongitude
        console.log("URL is::", url);
        fetch(url, {
          method: 'GET',
        }).then((response) => response.json())
          .then((responseData) => {
            //Alert.alert("KK",JSON.stringify(data))
            this.setState({ loader: false });
            console.log("Response:", responseData);
            if (responseData.data.length > 0) {
              for (var i = 0; i < JSON.stringify(responseData.data.length); i++) {
                this.state.arrTempGymData.push(responseData.data[i])
                if (i === responseData.data.length - 1) {
                  this.setState({
                    arrMainGymData: this.state.arrTempGymData,
                    srchData: this.state.arrTempGymData,
                  })

                  setTimeout(() => {
                    console.log("Array Gym Data is:", this.state.arrMainGymData);
                    for (let i = 0; i < this.state.arrMainGymData.length; i++) {
                      let placeMarker = {
                        latitude: parseFloat(this.state.arrMainGymData[i].latitude),
                        longitude: parseFloat(this.state.arrMainGymData[i].longitude),
                        title: this.state.arrMainGymData[i].name,
                        key: i + 1
                      };
                      this.state.markers.push(placeMarker);

                      console.log("Markers:", this.state.markers);
                      if(!this.state.displayNoData){
                        setTimeout(() => {
                          this.mapRef.fitToCoordinates(this.state.markers, {
                            edgePadding: DEFAULT_PADDING,
                            animated: true,
                          });
                        }, 100)
                      }                      
                    };


                  }, 700)
                }
              }
            } else {
              this.setState({
                displayNoData: true,
                curLatitude:defaultLat,
                curLongitude:defaultLong
              },()=>{
                this.getGymData()
              })
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
                        value={data.avgRate - 1}
                        spacing={4}
                        count={5}
                        starSize={30}
                        backingColor='transparent'
                        fullStar={require('./rating_fill.png')}
                        emptyStar={require('./rating_outer.png')} />

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
          <View style={{ alignItems: 'center', justifyContent: 'center', borderWidth: 0 }}>
            <Text style={{ fontSize: 25, marginTop: (Platform.OS === 'android') ? 70 : ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c')) ? 40 : 115, fontFamily: Fonts.bold, color: Colors.header_red + '40' }}>No Gym Found...!</Text>
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
  }

  _gotoViewGym(index) {
    var arrData = this.state.arrMainGymData[index]
    AsyncStorage.setItem('gymDetail', JSON.stringify(arrData))
    AsyncStorage.setItem('gym_id', arrData.id)
    // AsyncStorage.setItem('gymBarCode',arrData.gymBarCode)

    this.props.navigation.navigate('ViewGym');

  }

  static navigationOptions = ({ navigation, screenProps }) => {
    const params = navigation.state.params || {};
    return {
      title: 'Gym Finder',
      headerStyle: { backgroundColor: Colors.header_red, borderBottomWidth: 0, shadowColor: 'transparent', elevation: 0, marginTop: (Platform.OS === 'android') ? 20 : 0 },
      headerTitleStyle: HeaderStyle.titleCenter,

    }
  }

  _callSearchGymApi(searchKey) {

    NetInfo.isConnected.fetch().done((isConnected) => {
      this.setState({ netStatus: isConnected });

      if (isConnected) {
        this.setState({

          arrMainGymData: [],
          srchData: [],
          arrTempGymData: [],
          markers: [],
        })

        this.setState({ loader: true });
        var url = encodeURI(Strings.base_URL + 'searchGym?searchKey=' + searchKey + '&latitude=' + this.state.curLatitude + '&longitude=' + this.state.curLongitude)


        console.log("Search Gym Url", url);
        fetch(url, {
          method: 'GET',
        }).then((response) => response.json())
          .then((responseData) => {
            //Alert.alert("KK",JSON.stringify(data))

            this.setState({ loader: false });
            console.log("searchGym Response:", responseData);
            if (responseData.data.length > 0) {

              for (var i = 0; i < JSON.stringify(responseData.data.length); i++) {
                this.state.arrTempGymData.push(responseData.data[i])
                if (i === responseData.data.length - 1) {
                  this.setState({
                    arrMainGymData: this.state.arrTempGymData,
                    srchData: this.state.arrTempGymData,
                  })
                  setTimeout(() => {
                    console.log("Array Gym Data is:", this.state.arrMainGymData);

                    for (let i = 0; i < this.state.arrMainGymData.length; i++) {
                      let placeMarker = {
                        latitude: parseFloat(this.state.arrMainGymData[i].latitude),
                        longitude: parseFloat(this.state.arrMainGymData[i].longitude),
                        title: this.state.arrMainGymData[i].name,
                        key: i + 1
                      };
                      this.state.markers.push(placeMarker);
                      setTimeout(() => {
                        this.mapRef.fitToCoordinates(this.state.markers, {
                          edgePadding: DEFAULT_PADDING,
                          animated: true,
                        });
                      }, 100)
                      console.log("Markers:", this.state.markers);
                    };

                  }, 700)
                }
              }
            } else {
              this.setState({
                displayNoData: true,

              })
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
        Alert.alert(Strings.gymonkee, Strings.internet_offline);
      }
    });
  }

  _onSearchGym(searchText) {

    // this.setState({
    //         search_text:searchText
    //       })
    //       if(searchText === '')
    //       {
    //         this.setState({
    //           arrMainGymData: this.state.srchData
    //         })
    //
    //       }
    //
    //       const { arrMainGymData } = this.state;
    //       var temp = this.state.srchData;
    //       var d =  temp.filter(temp => temp.address.search(searchText.trim()) >= 0);
    //
    //       if(d.length > 0)
    //       {
    //         this.setState({
    //           arrMainGymData: d
    //         })
    //
    //       }else{
    //         this.setState({
    //           arrMainGymData: this.state.srchData
    //         })
    //
    //       }

    this.setState({
      search_text: searchText
    })
    // if(searchText !== '')
    // {
    //     this._callSearchGymApi(searchText);
    // }



  }

  searchSubmit = () => {
    console.log("search_text", this.state.search_text);
    if (this.state.search_text !== '') {
      this._callSearchGymApi(this.state.search_text);
    }
    else {
      //Alert.alert(Strings.gymonkee,"Please enter something....")
      this.setState({

        arrMainGymData: [],
        srchData: [],
        arrTempGymData: [],
        markers: [],
        displayNoData: true,
      })
    }
  };
  
  onRegionChange(region) {
    console.log("region", region);
    this.setState({ region });
  }
  
  _changeSearchText(text) {

    if (text === '') {
      this.setState({
        search_text: '',
        searchCancelVisible: false,

      })
    }
    else {
      this.setState({
        search_text: text,
        searchCancelVisible: true,

      })
    }
  }
  _clearSearch() {
    this.setState({
      search_text: '',
      searchCancelVisible: false,
    })
  }
  //Main View Rendering

  render() {
    return (
      <View style={styles.container}>
        
        <View style={{ alignItems: 'center' }}>
          {this.loader()}
        </View>

        <View style={{ flex: 10,}}>
          <View style={{ flex: 3, borderWidth: 0 }}>
            <ImageBackground source={ require('../../assets/Home-01/01.png')} resizeMode="contain" style={{ height: null, width: null, flex: 3, marginTop: (DeviceInfo.getModel() === ModelIphoneX) ? -55 : (DeviceInfo.getModel() === 'iPhone 8 Plus') ? -20 : (DeviceInfo.getModel() === 'iPhone 6 Plus') ? -20 : (Platform.OS === 'android') ? -40 : -10 }}>

            </ImageBackground>
          </View>

          <View style={{ flex: 7, marginTop: (Platform.OS === 'android') ? -60 : (DeviceInfo.getModel() === ModelIphoneX) ? -90 : -40 }}>
            <View style={{ flex: 1, padding: (Platform.OS === 'android') ? 20 : 20, flexDirection: 'row' }}>

              <View style={{ flex: 1, flexDirection: 'column' }}>
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
              <View style={{ flex: 1, height: 50, borderWidth: 0, alignItems: 'flex-end', justifyContent: 'center' }}>

                <View style={{ flex: 1, borderWidth: 1, borderRadius: 40, borderColor: Colors.header_red, flexDirection: 'row' }}>
                  <View style={{ borderRadius: 20, borderWidth: 2,borderColor: '#ff3300', }}>
                    
                    <TextInput
                      placeholder='Search by City/State/ Zip code'
                      style={{ flex: 1, borderWidth: 1, fontFamily: Fonts.regular, fontSize: (Platform.OS === 'android') ? 14 : 15, color: 'black', borderWidth: 0, paddingTop: 5, paddingBottom: 5, marginTop: (Platform.OS === 'android') ? 0 : (DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c') ? 0 : -10,marginLeft:20 }}
                      ref='search_text'
                      placeholderTextColor="rgb(115,119,118)"
                      underlineColorAndroid='transparent'
                      onChangeText={(text) => this._changeSearchText(text)}
                      onSubmitEditing={this.searchSubmit}
                      value={this.state.search_text}
                      returnKeyType="search"
                    />
                  </View>
                  <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                    {
                      (this.state.searchCancelVisible) ?
                        <TouchableOpacity onPress={() => this._clearSearch()}>
                          <Image source={{ uri: 'cancel_icon' }} resizeMode="contain" style={{ height: 18, width: 18, marginRight: 4 }} />
                        </TouchableOpacity> :
                        <View>
                        </View>
                    }
                  </View>




                </View>
              </View>

            </View>
            <View style={{ flex: 6 }}>

              <View style={{ flex: (DeviceInfo.getModel() === ModelIphoneX) ? 0 : 0.2, marginTop: (DeviceInfo.getModel() === ModelIphoneX) ? -50 : 0 }}>
              </View>

              <ScrollView style={{ marginTop: (DeviceInfo.getModel() === ModelIphoneX) ? 60 : 10 }}>
                <View style={{ height: 220, borderWidth: 1, marginBottom: 10, marginLeft: 10, marginRight: 10, borderColor: Colors.placeholdar_color, borderRadius: 10, overflow: 'hidden' }}>

                  <MapView                    
                    region={this.state.region}
                    style={styles.map}
                    zoomEnabled={true}
                    onRegionChangeComplete={(region) => this.onRegionChange.bind(this)}                    
                    ref={(ref) => { this.mapRef = ref }}
                  >
                    {this.state.arrMainGymData.map((marker, i) => (
                      <MapView.Marker
                        key={i}
                        coordinate={{
                          latitude: parseFloat(marker.latitude),
                          longitude: parseFloat(marker.longitude),
                        }}
                        title={marker.title}
                        image={{ uri: 'location_pin' }}
                        onPress={() => this._gotoViewGym(i)}
                      />
                    ))}


                  </MapView>
                </View>
                {this.displayGymRender()}
              </ScrollView>

              <View style={{ flex: 3, borderWidth: 0 }}>
              </View>
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
    fontSize: (deviceHeight > 600) ? 20 : 16,
    fontFamily: Fonts.regular,
    color: Colors.redcolor,

  },
  coin_count_text: {
    fontSize: (deviceHeight > 600) ? 40 : 30,
    fontFamily: Fonts.SFU_BOLD,
    color: Colors.redcolor,
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
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,





  },
})
module.exports = GymFinderScreen
