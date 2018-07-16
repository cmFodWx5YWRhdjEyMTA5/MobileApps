
//TrendingGymsScreen

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
import * as firebase from 'firebase';
import Strings from './../Utils/Strings';
import HeaderStyle from './../Utils/HeaderStyle';
import Stars from 'react-native-stars';
import Spinner from 'react-native-loading-spinner-overlay';

const ModelIphoneX = 'iPhone X';
const StatusBarHeightIos = DeviceInfo.getModel() === ModelIphoneX ? 30 : 20;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? StatusBarHeightIos : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
var moment = require('moment');


const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);


class TrendingGymsScreen extends Component{

  constructor(props) {
    super(props);
    this.state={
      loader:false,
      curLatitude:'23.05',
      curLongitude:'72.51',
      arrTempGymData:[],
      arrMainGymData:[],
      displayNoData:false,
    }

  }

  //handle Internetconnection
  handleConnectionChange = (isConnected) => {
      this.setState({ netStatus: isConnected });
      console.log(`is connected: ${this.state.netStatus}`);
  }
  //loader
  loader()
  {
   if(this.state.loader)
     {
         return(
             <View>
                  <Spinner visible={this.state.loader} textContent={""} textStyle={{color: '#3e4095'}} color={Colors.header_red}/>
             </View>
        )
     }
  }
  //Life Cycle Methods
  componentWillMount()
  {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    NetInfo.isConnected.fetch().done((isConnected) => {this.setState({netStatus: isConnected});});
  }
  componentDidMount()
  {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    NetInfo.isConnected.fetch().done((isConnected) => {this.setState({netStatus: isConnected});});

    AsyncStorage.setItem(Strings.AsyncStorage_Key_isLogin, 'success');

    AsyncStorage.getItem("isLogin").then((value) => {
      console.log("componentDidMount -> Dashboard -> AsyncStorage.getItem() : ",value);
    }).done();

    var user = firebase.auth().currentUser;

    if (user) {
      // User is signed in.
      console.log("currentUser : ",user.uid,user.email);
    } else {
      // No user is signed in.
    }

    this.getGymData()
  }


  getGymData()
  {
    NetInfo.isConnected.fetch().done((isConnected) => {
                      this.setState({ netStatus: isConnected });

                          if(isConnected)
                          {
                              this.setState({loader:true});
                                var url = Strings.base_URL + 'getGyms?latitude='+this.state.curLatitude+'&longitude='+this.state.curLongitude
                                fetch(url, {
                                  method: 'GET',
                                }).then((response) => response.json())
                                    .then((responseData) => {
                                     //Alert.alert("KK",JSON.stringify(data))
                                      this.setState({loader:false});
                                      console.log("Response:",responseData);
                                      if(responseData.data.length>0)
                                      {
                                        for(var i=0;i < JSON.stringify(responseData.data.length);i++)
                                        {
                                          this.state.arrTempGymData.push(responseData.data[i])
                                          if(i===responseData.data.length-1)
                                          {
                                            this.setState({
                                              arrMainGymData:this.state.arrTempGymData
                                            })
                                            setTimeout(()=>{
                                              console.log("Array Gym Data is:",this.state.arrMainGymData);
                                            },700)
                                          }
                                        }
                                      }else{
                                        this.setState({
                                          displayNoData:true
                                        })
                                      }

                                    }).catch((error) => {
                                        this.setState({loader:false});
                                        console.log("Error is:",error);
                                          // setTimeout(()=>{
                                          //   Alert.alert(Strings.gymonkee,error.message);
                                          // },1000)
                                     }).done();

                      }
              else
              {
                  Alert.alert(Strings.avanza,Strings.internet_offline);
              }
        });
  }

  // <FlatList
  //    horizontal={true}
  //    data={data.Services}
  //    renderItem={({item}) =>
  //           <Image source={{uri:(item==='Juice bar')?'juice_white':(item==='Cycle room')?'bike_white':(item==='Pool')?'pool_white':(item==='Yoga')?'yoga_white':''}} resizeMode="contain" style={{height:35,width:30}} />
  //      }
  //  />
  _gotoViewGym(index)
  {
    var arrData = this.state.arrMainGymData[index]
    AsyncStorage.setItem('gymDetail',JSON.stringify(arrData))
    AsyncStorage.setItem('gym_id',arrData.id)
    this.props.navigation.navigate('ViewGym');
  }

  displayGymRender()
  {
    const {arrMainGymData} = this.state

    if(arrMainGymData.length>0)
    {
       return arrMainGymData.map((data,index)=>{
            return(
              <TouchableOpacity style={{flex: 3,padding:10,}} onPress={() => this._gotoViewGym(index)}>
                    <ImageBackground borderRadius={8} source={{uri:data.img[0]}} resizeMode="cover" style={{flex: 3}}>
                    <ImageBackground borderRadius={8} source={{uri:'transparent_img'}} resizeMode="cover" style={{flex: 3}}>
                      <View style={{flex:3}}>
                        <View style={{flex:(Platform.OS==='android')?1:(DeviceInfo.getModel() === ModelIphoneX)?1.3:1}}>
                        </View>

                          <View style={{flex: 0.4,marginLeft: 20,marginTop:(Platform.OS==='android')?10:(DeviceInfo.getModel() === 'iPhone SE')?10:20}}>
                              <Text style={styles.gym_name_text}>{data.name}</Text>
                          </View>

                          <View style={{flex:0.3}}>
                          </View>


                          <View style={{flex: 0.6,marginLeft: 10,flexDirection: 'row',alignItems:  'center' }}>

                             <Image source={{uri:'location_icon_white'}} resizeMode="contain" style={{height:35,width:30}} />
                              <Text style={styles.miles_away_text}>{data.distance.toFixed(2)} miles away</Text>
                          </View>


                          <View style={{flex: 3,marginLeft: 20,marginBottom: 10}}>
                                 <View style={{flex:0.4}}>
                                 </View>


                            <View style={{flex:1.5,flexDirection: 'row'}}>
                                  <View style={{flex:1}}>

                                        <View style={{flex:0.7}}>
                                            <Text style={styles.coin_count_text_white}>{data.coins}</Text>
                                        </View>



                                     <View style={{flex:0.3,marginLeft: 8}}>
                                          <Text style={styles.coin_text_white}>{Strings.coins}</Text>
                                     </View>

                                 </View>
                                 <View style={{justifyContent: 'flex-start',flexDirection: 'row',flex:4,alignItems: 'center',marginTop:14}}>

                                       <FlatList
                                          horizontal={true}
                                          data={data.Services}
                                          renderItem={({item}) =>
                                                 <Image source={{uri:(item==='Juice bar')?'juice_white':(item==='Cycle room')?'bike_white':(item==='Pool')?'pool_white':(item==='Yoga')?'yoga_white':''}} resizeMode="contain" style={{height:35,width:30}} />
                                            }
                                        />
                                 </View>

                            </View>



                                    <View style={{flex:(Platform.OS==='android')?1:(DeviceInfo.getModel() === ModelIphoneX)?1.7:1.2}}>
                                     </View>
                          </View>
                     </View>

                      </ImageBackground>
                    </ImageBackground>
             </TouchableOpacity>
            )
       })
    }else{
      if(this.state.displayNoData===true)
      {
        return(
          <View style={{alignItems:'center',justifyContent:'center'}}>
                <Text style={{fontSize:25,marginTop:100,fontFamily:Fonts.bold,color:Colors.header_red+'40'}}>No Data...!</Text>
          </View>
        )
      }
    }
  }

  _onClickGetCoins()
  {
    Alert.alert("Get Coins","Under Implementation");
  }

  static navigationOptions = ({navigation, screenProps}) => {
      const params = navigation.state.params || {};
     return {
           title:Strings.gyms_near_me,
           headerStyle:{ backgroundColor: Colors.header_red,borderBottomWidth: 0,shadowColor: 'transparent',elevation:0,marginTop: (Platform.OS==='android')?20:0},
           headerTitleStyle:HeaderStyle.titleCenter,

       }
    }


  //Main View Rendering

  render(){
    return(
        <View style={styles.container}>
                <MyStatusBar backgroundColor={Colors.header_red} barStyle="dark-content" hidden={false}/>
                <View style={{alignItems:'center'}}>
                    {this.loader()}
                </View>
                  <View style={{flex:3,borderWidth:0}}>
                      <ImageBackground source={{uri:'shape_red_top'}} resizeMode="contain" style={{height:null,width:null,flex:3,marginTop:(DeviceInfo.getModel() === ModelIphoneX)?-55:(DeviceInfo.getModel() === 'iPhone 8 Plus')?-20:(DeviceInfo.getModel() === 'iPhone 6 Plus')?-20:(Platform.OS==='android')?-20:-10}}>

                      </ImageBackground>
                  </View>
                  <View style={{flex:7,marginTop: (DeviceInfo.getModel() === ModelIphoneX)?-180:-50}}>

                    <ScrollView style={{marginTop:(Platform.OS==='android')?0:(DeviceInfo.getModel() === ModelIphoneX)?80:20,}}>
                        {this.displayGymRender()}
                    </ScrollView>


                  </View>





        </View>
    )
  }

}
const styles = StyleSheet.create({
  container: {
   flex: 10,
   marginTop: (Platform.OS==='android')?-140:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?-120:-150,
   backgroundColor:Colors.theme_background,
 },
 statusBar: {
    height: STATUSBAR_HEIGHT
  },
  appBar: {
    backgroundColor:'#79B45D',
    height: APPBAR_HEIGHT,
  },
  content: {
    flex: 1,
    backgroundColor: '#33373B',
  },
  current_balance_text:{
    fontSize: 20,
    fontFamily:Fonts.regular,
    color:Colors.redcolor,

  },
  coin_count_text:{
    fontSize: 40,
    fontFamily:Fonts.bold,
    color:Colors.redcolor,
  },
  coin_text:{
    fontSize: 22,
    fontFamily:Fonts.regular,
    color:Colors.redcolor,
  },
  gym_name_text:{
    fontSize: 20,
     fontFamily:Fonts.regular,
    color:Colors.white,
  },
   miles_away_text:{
    fontSize: 16,
     fontFamily:Fonts.regular,
    color:Colors.white,
  },
coin_count_text_white:{
    fontSize: 36,
    fontFamily:Fonts.SFU_BOLD,
    color:Colors.white,
  },
  coin_text_white:{
    fontSize: 16,
    fontFamily:Fonts.SFU_LIGHT,
    color:Colors.white,
  },
  small_image:{
    height: 32,
    width:32,
  },
})
module.exports = TrendingGymsScreen
