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
  PixelRatio,
  PermissionsAndroid,

} from 'react-native';

import Colors from './../Utils/Colors';
import Fonts from './../Utils/Fonts';
import Strings from './../Utils/Strings';
import DeviceInfo from 'react-native-device-info';
import { NavigationActions } from 'react-navigation';
import * as firebase from 'firebase';
import Spinner from 'react-native-loading-spinner-overlay';
import HeaderStyle from './../Utils/HeaderStyle';
var moment = require('moment');



const ModelIphoneX = 'iPhone X';
const StatusBarHeightIos = DeviceInfo.getModel() === ModelIphoneX ? 50 : 20;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? StatusBarHeightIos : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

var deviceHeight = Dimensions.get('window').height;
var deviceWidth = Dimensions.get('window').width;

const MyStatusBar = ({ backgroundColor, ...props }) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);


class TermsAndConditionsDrawer extends Component {

  constructor(props) {
    super(props);
    this.state = {

    }
    // this.userRef = firebase.database().ref().child('User');
  }


  //Life Cycle Methods
  componentWillMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    NetInfo.isConnected.fetch().done((isConnected) => { this.setState({ netStatus: isConnected }); });
  }

  //Life Cycle Methods
  componentDidMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    NetInfo.isConnected.fetch().done((isConnected) => { this.setState({ netStatus: isConnected }); });

    NetInfo.isConnected.fetch().done((isConnected) => {
      this.setState({ netStatus: isConnected });
      console.log("this.state.arrContactUploadArr", this.state.arrContactUploadArr);
      if (isConnected) {
        this.setState({
          loader: true
        })
      }
      else {
        Alert.alert(Strings.gymonkee, Strings.internet_offline);
     }
    });
  }
  //handle Internetconnection
  handleConnectionChange = (isConnected) => {
    this.setState({ netStatus: isConnected });
    console.log(`is connected: ${this.state.netStatus}`);
  }
  //loader
  loader() {
    if (this.state.loader) {
      return (
        <View>
          <Spinner visible={this.state.loader} textContent={""} textStyle={{ color: '#c32439' }} color="#c32439" />
        </View>
      )
    }
  }

  _loaderOff() {
    this.setState({
      loader: false
    })
  }
  //User Define Functions

  static navigationOptions = ({ navigation, screenProps }) => {
    const params = navigation.state.params || {};
    return {
      title: "Terms & Conditions",
      headerStyle: { backgroundColor: Colors.header_red, borderBottomWidth: 0, shadowColor: 'transparent', elevation: 0, marginTop: (Platform.OS === 'android') ? 20 : 0 },
      headerTitleStyle: HeaderStyle.titleCenter,

    }
  }

 
  render() {
    return (
      <View style={styles.container}>
      <ImageBackground source={ require('../../assets/Home-01/06.png')}  style={{ height: '100%', width: '100%'}}>
        <View style={{ alignItems: 'center' }}>
          {this.loader()}
        </View>



        <View style={{ flex: 7, borderWidth: 0, marginTop: (DeviceInfo.getModel() === ModelIphoneX) ? 80 : 160 }}>

          <View style={{ flex: 1, marginTop: 10 }}>
            <WebView
              automaticallyAdjustContentInsets={true}
              javaScriptEnabled={true}
              source={{ uri: 'http://www.gymonkee.com/terms-of-use/' }}
              style={{ backgroundColor: 'rgba(211, 211, 211 , 0)' }}
              onLoad={() => this._loaderOff()}
            />
          </View>


        </View>
        </ImageBackground>
      </View>
    )
  }

}
const styles = StyleSheet.create({
  container: {
    flex: 10,
    marginTop: ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c')) ? -120 : (DeviceInfo.getModel() === 'iPhone X') ? -170 : -150,
    backgroundColor: Colors.theme_background,
  },
  statusBar: {
    height: STATUSBAR_HEIGHT
  },
  appBar: {
    backgroundColor: '#79B45D',
    height: APPBAR_HEIGHT,
  },

  menu_icon: {
    height: 20,
    width: 20,

  },

})
module.exports = TermsAndConditionsDrawer
