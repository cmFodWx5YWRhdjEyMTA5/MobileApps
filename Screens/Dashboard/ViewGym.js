//View gym
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
  Linking
} from 'react-native';

var ViewPager = require('react-native-viewpager');
const ds = new ViewPager.DataSource({pageHasChanged: (r1, r2) => r1 !== r2});


import Colors from './../Utils/Colors';
import Fonts from './../Utils/Fonts';
import DeviceInfo from 'react-native-device-info';
import { NavigationActions } from 'react-navigation';
import * as firebase from 'firebase';
import Strings from './../Utils/Strings';
import HeaderStyle from './../Utils/HeaderStyle';
import Stars from 'react-native-stars';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Spinner from 'react-native-loading-spinner-overlay';
const ModelIphoneX = 'iPhone X';
const StatusBarHeightIos = DeviceInfo.getModel() === ModelIphoneX ? 30 : 20;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? StatusBarHeightIos : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
var moment = require('moment');
var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;

var IMGS = [];

const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);


class ViewGym extends Component{

  _renderPage(
      data: Object,
      pageID: number | string,) {
      return (
        <Image
          source={{uri: data}}
          style={styles.page}
          resizeMode="cover"
          />
      );
    }
  constructor(props) {
    super(props);
    this.state={
      dataSource: ds.cloneWithPages(IMGS),
      region: {
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        },
      tempPushData:[],
      dataGymDetails:[],
      imges:[],
      loader:false,
      gym_id:'',
      user_id:'',
      expandHours:false,
    }

  }




  //Life Cycle Methods
  componentWillMount()
  {


  }
  componentDidMount()
  {
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

    AsyncStorage.getItem("gymDetail").then((value) => {
      // console.log("Detail Data ",JSON.parse(value));
      var data = JSON.parse(value)
      this.state.tempPushData.push(data)
      console.log("Gym Detail Data is:",data);
      IMGS = data.img

      setTimeout(()=>{
        const region = Object.assign({}, this.state.region, { latitude: parseFloat(data.latitude),longitude:parseFloat(data.longitude) });
        console.log("Region is:",region);
        // this.setState({ User });
        this.setState({
          dataGymDetails:this.state.tempPushData,
          dataSource: this.state.dataSource.cloneWithPages(IMGS),
          region,
        })
        this.displayGymData()
      },700)
    }).done();

    AsyncStorage.getItem("gym_id").then((value) => {
      console.log("Gym_Id: ",value);
      this.setState({
        gym_id:value
      })
    }).done();

    AsyncStorage.getItem("user_id").then((value) => {
      console.log("user_id: ",value);
      this.setState({
        user_id:value
      })
    }).done();
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

_checkIn(gymName)
{

      var gymCode = this.state.dataGymDetails[0].gymBarCode
      console.log("Gym Code:",gymCode);
      this.props.navigation.navigate('TermsAndConditions',{gymBarCode:gymCode,gymName:gymName});
      //this.props.navigation.navigate('TermsAndConditions');


}

 static navigationOptions = ({navigation, screenProps}) => {
      const params = navigation.state.params || {};
     return {
           title:Strings.view_gym,
           header:<View style={{marginTop:(DeviceInfo.getModel() === 'iPhone 7')?-24:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?-28:-14,}}><ImageBackground source={ require('../../assets/Home-01/01.png')} resizeMode="contain" style={{height:(DeviceInfo.getModel() === ModelIphoneX)?150:100,width:deviceWidth}}>

           <View style={{flexDirection:'row',alignItems:'center'}}>
           <TouchableOpacity onPress={()=> navigation.goBack()} style={{flex:0.1,alignItems:'center',borderWidth:0,marginTop:(DeviceInfo.getModel() === ModelIphoneX)?50:40,justifyContent:'center',padding:10}}><Image source={{uri: "back_arrow"}} style={styles.back_icon} /></TouchableOpacity>
           <View style={{flex:0.9,alignItems:'flex-end',justifyContent:'center',marginTop:(DeviceInfo.getModel() === ModelIphoneX)?50:40}}>

           <Text style={{color: '#ffffff',alignSelf: 'center',textAlign:'center',fontSize:(deviceHeight>600)?18:16,justifyContent:'center',fontWeight:'400',fontFamily:Fonts.SFU_REGULAR,paddingRight:40}}>View Gym</Text>
           </View>
           </View>
           </ImageBackground></View>,
           headerStyle:{ backgroundColor: Colors.header_red,borderBottomWidth: 0,shadowColor: 'transparent',elevation:0,marginTop: (Platform.OS==='android')?20:0},
           headerTitleStyle:HeaderStyle.titleCenter,

       }
    }

    mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
]

_expandCollapseHours()
{
  console.log("Current Day",moment(new Date()).format('dddd'));
  if(!this.state.expandHours)
  {
    this.setState({
      expandHours:true
    })
  }
  else {
    this.setState({
      expandHours:false
    })
  }

}

_openMapWithLatLong(latitude,longitude,gymName)
{
   console.log("_openMapWithLatLong lat",latitude);
   console.log("_openMapWithLatLong long",longitude);
   const scheme = Platform.OS === 'ios' ? 'maps:0,0?q=' : 'geo:0,0?q=';
   const latLng = `${latitude},${longitude}`;
   const label = gymName;
   const url = Platform.OS === 'ios' ? `${scheme}${label}@${latLng}` : `${scheme}${latLng}(${label})`;
   console.log("_openMapWithLatLong URL",url);
  if(Platform.OS==='android'){
    // Linking.openURL('http://maps.google.com/maps?daddr='+latLng)
      Linking.openURL(url);
  }
  else {
      Linking.openURL(url);
  }
}

//
// <View style={{alignItems:'center'}}>
//     <Image source={{uri:'pool_red'}} resizeMode="contain" style={styles.small_image}/>
//     <Text style={styles.small_image_text}>{Strings.pool}</Text>
// </View>
//
// <View style={{alignItems:'center'}}>
//     <Image source={{uri:'yoga_red'}} resizeMode="contain" style={styles.small_image}/>
//     <Text style={styles.small_image_text}>{Strings.yoga}</Text>
// </View>
displayGymData()
{
  const {dataGymDetails} = this.state
  if(dataGymDetails.length>0)
  {

    return dataGymDetails.map((data,index)=>{


      console.log("Image array is:",data.img);
      return(
        <View>
        <View style={{height:480,width:deviceWidth,marginTop:(DeviceInfo.getModel() === ModelIphoneX)?0:(DeviceInfo.getModel() === 'iPhone 8 Plus')?-16:(DeviceInfo.getModel() === 'iPhone 6 Plus')?-20:(Platform.OS==='android')?-24:-40}}>
        <View style={{alignItems:'center'}}>
            {this.loader()}
        </View>


                  <View style={{flex:3,height:280,width:deviceWidth,marginTop:(DeviceInfo.getModel() === ModelIphoneX)?80:90,position:'absolute'}}>
                        <ViewPager
                                  isViewGymScreen={true}
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



              </View>
              <View style={{flex:7}}>

                  <View style={{alignItems:'center',flex:0.5,marginTop:(DeviceInfo.getModel() === ModelIphoneX)?-95:-85}}>
                      <Text style={styles.gym_name_text}>{data.name}</Text>
                  </View>
                  <View style={{flex:1,marginTop:10,}}>
                  <Stars
                       half={true}
                       value={data.avgRate}
                       spacing={4}
                       count={5}
                       opacity={true}
                       starSize={30}
                       backingColor='transparent'
                       fullStar={{uri:'rating_fill'}}
                       halfStar={{uri:'rating_half_fill'}}
                       emptyStar= {{uri:'rating_outer'}}/>


                  </View>
                  <View style={{flex:0.5}}>
                  </View>
                  <View style={{alignItems:'center',marginTop:40}}>
                      <Text onPress={() => this._openMapWithLatLong(data.latitude,data.longitude,data.name)} style={styles.gym_address_text}>{data.address}</Text>
                  </View>
                  <View style={{marginTop:16,height:120,width:Dimensions.get('window').width}}>
                  <MapView
                      scrollEnabled={false}
                      style={ styles.map }
                      region={this.state.region}
                      customMapStyle={this.mapStyle}>

                    <MapView.Marker
                        coordinate={{
                          latitude:this.state.region.latitude,
                          longitude:this.state.region.longitude,
                        }}
                        image={{uri:'location_red'}}
                    />

                  </MapView>

                  </View>
                    <TouchableOpacity onPress={() => this._expandCollapseHours()}>
                      <View style={{marginTop:50,alignItems:'center',flexDirection:'row',justifyContent:'center'}}>
                          <Text style={styles.gym_name_text}>Hours of operation</Text>
                          <Image source={{uri:(this.state.expandHours)?'up_arrow_red':'down_arrow_red'}} resizeMode="contain" style={styles.expand_image}/>

                      </View>
                  </TouchableOpacity>
                  <View style={{marginTop:10,alignItems:'center'}}>
                    {(this.state.expandHours)
                      ?
                      <FlatList
                       contentContainerStyle={{alignItems:'center'}}
                       horizontal={false}
                       bounces={false}
                       showsHorizontalScrollIndicator={false}
                       data={data.hoursOfOperation}
                       renderItem={({item}) =>
                               <View style={{borderWidth:0,alignItems:'center'}}>
                                  <Text style={styles.gym_name_text}>{item}</Text>

                               </View>
                         }
                     />:
                     <View/>
                   }

                  </View>
                  <View style={{alignItems:'center',marginTop:40}}>
                      <Text style={styles.gym_name_text}>Services</Text>
                  </View>
                  <View style={{marginTop:10,flexDirection: 'row',justifyContent:'center',marginBottom:-30}}>
                    <View style={{flex:1,borderWidth:0}}/>
                      <View style={{alignItems:'center'}}>
                      <FlatList
                         contentContainerStyle={{alignItems:'center'}}
                         horizontal={true}
                         bounces={false}
                         showsHorizontalScrollIndicator={false}
                         data={data.Services}
                         renderItem={({item}) =>
                                 <View style={{borderWidth:0,alignItems:'center'}}>

                                     <Image source={{uri:(item==='Juice bar')?'juice_red':(item==='Cycle room')?'bike_red':(item==='Pool')?'pool_red':(item==='Yoga')?'yoga_red':(item==='Sauna')?'sauna_red':(item==='Basketball')?'basketball_red':(item==='Classes')?'classes_red':''}} resizeMode="contain" style={styles.small_image}/>

                                     <Text style={styles.small_image_text}>{(item==='Juice bar')?Strings.juice_bar:(item==='Cycle room')?Strings.cycle_room:(item==='Pool')?Strings.pool:(item==='Yoga')?Strings.yoga:(item==='Sauna')?Strings.sauna:(item==='Basketball')?Strings.basketball:(item==='Classes')?Strings.classes:''}</Text>

                                 </View>
                           }
                       />
                       </View>
                   <View style={{flex:1,borderWidth:0}}/>
                  </View>
                  <View>
                      <TouchableOpacity onPress={()=> this._checkIn(data.name)} style={{width:Dimensions.get('window').width,height:150,marginTop:20,borderWidth:0,borderColor:'grey'}}>
                          
                                <View style={{flexDirection:'row',marginTop:70}}>
                                    <View style={{alignItems:'center',flex:0.5}}>
                                      <ImageBackground source={require('../../assets/Home-01/coins.png')} resizeMode="contain" style={{height:90,width:120}}>    
                                          <Text style={styles.coin_count_text_white}>{data.coins}</Text>
                                          <View style={{marginTop:(Platform.OS==='android')?-10:-10}}>
                                              <Text style={styles.coin_text}>Coins</Text>
                                          </View>
                                          </ImageBackground>  
                                        
                                    </View>
                                    
                                    <View style={{justifyContent:'center',flex:0.5}}>
                                      <Image source={ require('../../assets/Home-01/swing.png')} resizeMode="contain" style={{height:90,width:120}}/>   
                                    </View>
                      
                                </View>

                      </TouchableOpacity>
                  </View>

              </View>
              </View>
      )
    })
  }
}



  //Main View Rendering

  render(){
    return(
        <View style={styles.container}>
                

                <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                    {this.displayGymData()}
                </ScrollView>
        </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
   flex: 10,
   marginTop: ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?-120:(DeviceInfo.getModel() === 'iPhone 7' || DeviceInfo.getModel() === 'iPhone 7 Plus')?-120:-150,
   backgroundColor:Colors.theme_background,
 },
 map: {
   position: 'absolute',
   top: 0,
   left: 0,
   right: 0,
   bottom: 0,
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
  gym_name_text:{
    fontSize: 22,
     fontFamily:Fonts.regular,
    color:'#000',

  },
  gym_address_text:{
    fontSize: 22,
     fontFamily:Fonts.regular,
    color:Colors.redcolor,
    textAlign:'center',
  },
  small_image:{
    height: 50,
    width:50,
  },
  expand_image:{
    height: 20,
    width:20,
    marginLeft:10
  },
  small_image_text:{
    fontSize: 16,
     fontFamily:Fonts.regular,
    color:Colors.redcolor,
    textAlign: "center",
  },
  coin_count_text_white:{
      fontSize: 30,
      fontFamily:Fonts.regular,
      color:Colors.white,
      marginLeft:50,
      marginTop:26

    },
    coin_text:{
      fontSize: 17,
      fontFamily:Fonts.regular,
      color:Colors.white,
      marginLeft:50,
    
    },
    check_in_text:{
      fontSize: (deviceHeight>600)?30:25,
      fontFamily:Fonts.regular,
      color:Colors.white,
    },
    page: {

      width: deviceWidth,
      height:280 ,


    },
    back_icon:{
        height: 20,
        width: 20,

    },

})
module.exports = ViewGym
