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
import DeviceInfo from 'react-native-device-info';
import { NavigationActions } from 'react-navigation';
import Strings from './../Utils/Strings';

var ViewPager = require('react-native-viewpager');

const ds = new ViewPager.DataSource({pageHasChanged: (r1, r2) => r1 !== r2});

const ModelIphoneX = 'iPhone X';
const StatusBarHeightIos = DeviceInfo.getModel() === ModelIphoneX ? 30 : 20;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? StatusBarHeightIos : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;

const xChecker = DeviceInfo.getModel() === ModelIphoneX ? deviceHeight + 100  : deviceHeight;

const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);

var IMGS = [
  'onboarding1',
  'onboarding2',
  'onboarding3'
];

class Walkthrough extends Component{

  _renderPage(
      data: Object,
      pageID: number | string,) {
      return (
        <Image
          source={{uri: data}}
          style={styles.page}
          resizeMode="contain"
          />
      );
    }
  constructor(props) {
    super(props);
    this.state={
      dataSource: ds.cloneWithPages(IMGS)
    }

  }

  //Life Cycle Methods
  componentWillMount()
  {
    AsyncStorage.setItem(Strings.AsyncStorage_Key_installApp, 'success');
  }
  componentDidMount()
  {

  }

  //User Define Functions
  gotoLogin()
  {
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Login' })],
    });
    this.props.navigation.dispatch(resetAction);
  }

  //Main View Rendering
  render(){
    return(
        <View style={styles.container}>
            <StatusBar hidden={true}/>
              <View style={{flex:9}}>
                  <ViewPager
                            style={this.props.style}
                            dataSource={this.state.dataSource}
                            renderPage={this._renderPage}
                            animation = {(animatedValue, toValue, gestureState) => {
                          return Animated.timing(animatedValue,
                          {
                            toValue: toValue,
                            duration: 500,
                            easing: Easing.out(Easing.exp)
                          });
                      }}
                        isLoop={false}
                        autoPlay={false}
                  />
              </View>
              <View style={{flex:1,backgroundColor:'#b34700'}}>
                  <TouchableOpacity onPress={()=> this.gotoLogin()} style={{flex:(DeviceInfo.getModel() === ModelIphoneX)?2.5:2.2,height:null,width:null}}>
                    <View style={{flex:1,justifyContent:'center',alignItems:'center',borderWidth:0,marginTop:30}}>
                      <Text style={{color:Colors.white,fontFamily:Fonts.regular,fontSize:(DeviceInfo.getModel() === ModelIphoneX)?26:(DeviceInfo.getModel() === 'iPhone 6')?24:20}}>Next</Text>
                    </View>
                  </TouchableOpacity>
              </View>
        </View>
    )
  }

}
const styles = StyleSheet.create({
  container: {
   flex: 1,
   backgroundColor:Colors.theme_old_background,
 },
 page: {
   borderWidth:0,
   width: deviceWidth,
   height:deviceHeight ,
   marginTop:DeviceInfo.getModel() === ModelIphoneX ? -70 : 0

 },
})
module.exports = Walkthrough
