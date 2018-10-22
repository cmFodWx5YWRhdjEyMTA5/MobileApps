//PaymentDetailsAddCard

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
import {deviceHeight,deviceWidth} from './../Utils/DeviceDimensions';
import stripe from 'tipsi-stripe';
import ModalDropdown from 'react-native-modal-dropdown';

const ModelIphoneX = 'iPhone X';
const StatusBarHeightIos = DeviceInfo.getModel() === ModelIphoneX ? 30 : 20;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? StatusBarHeightIos : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
var moment = require('moment');
var isFromBuyCoins=false;

const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);
//Development Key Stripe : pk_test_h1OytUtRZVA0lSiMRkdkmU5P
//Production Key Stripe :  pk_live_TBsKU1DBuknrbB6YUT3KrcNH
stripe.setOptions({ publishableKey: Strings.stripe_key})
class PaymentDetailsAddCard extends Component{

  constructor(props) {
    super(props);
    this.state={
      loader:false,
      number:'',
      expMonth:0,
      expYear:0,
      cvc:'',
      stripe_cust_id:'',
      stripe_card_token:'',
      monthData:['01','02','03','04','05','06','07','08','09','10','11','12'],
      yearData:['18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40'],
      currentMonth:'',
      currentYear:'',


    }
  }

  //handle Internetconnection
  handleConnectionChange = (isConnected) => {
      this.setState({ netStatus: isConnected });
      console.log(`is connected: ${this.state.netStatus}`);
  }

  //Life Cycle Methods
  componentWillMount()
  {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    NetInfo.isConnected.fetch().done((isConnected) => {this.setState({netStatus: isConnected});});

  }
  componentDidMount()
  {
    console.log("Current Month",moment().format('MM'));
    console.log("Current Year",moment().format('YY'));

    this.setState({
      currentMonth:moment().format('MM'),
      currentYear:moment().format('YY')
    })

    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    NetInfo.isConnected.fetch().done((isConnected) => {this.setState({netStatus: isConnected});});

    AsyncStorage.setItem(Strings.AsyncStorage_Key_isLogin, 'success');

    AsyncStorage.getItem("stripe_cust_id").then((value) => {
      console.log("stripe_cust_id: ",value);
      this.setState({
        stripe_cust_id:value
      })
    }).done();

    var user = firebase.auth().currentUser;
    var currentUserRef = firebase.database().ref('User').child(user.uid);

    // console.log("User Friends:",currentUserRef);
      currentUserRef.on('value',(data)=>{
        // console.log("Data from login",data);
        var userData = data.val();
        var keys = Object.keys(userData);
        if(keys.length>0)
        {

        }
      })
      const { state } = this.props.navigation;
      console.log("state",state.params);

        if(state.params!=undefined)
        {
          isFromBuyCoins=state.params.isFromBuyCoins;
          console.log("isFromBuyCoins Params:-",state.params.isFromBuyCoins);
        }
        setTimeout(()=>{
          console.log("isFromBuyCoins State:-",isFromBuyCoins);


        },1000)
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

  // <Image source={{uri:'juice_white'}} resizeMode="contain" style={{height:35,width:30}} />
  //
  // <Image source={{uri:'bike_white'}} resizeMode="contain" style={{height:35,width:30}} />
  //
  //  <Image source={{uri:'pool_white'}} resizeMode="contain" style={{height:35,width:30}} />
  //
  // <Image source={{uri:'yoga_white'}} resizeMode="contain" style={{height:35,width:30}} />


  _gotoViewGym(index)
  {
    var arrData = this.state.arrMainGymData[index]
    AsyncStorage.setItem('gymDetail',JSON.stringify(arrData))
    AsyncStorage.setItem('gym_id',arrData.id)
    this.props.navigation.navigate('ViewGym');

  }

  static navigationOptions = ({navigation, screenProps}) => {
      const params = navigation.state.params || {};
     return {
           title:'Add New Card',
           headerStyle:{ backgroundColor: Colors.header_red,borderBottomWidth: 0,shadowColor: 'transparent',elevation:0,marginTop: (Platform.OS==='android')?20:0},
           headerTitleStyle:HeaderStyle.titleCenter,

       }
    }
    //email vadidation
      validateForNumeric = (value) =>
      {
          var re = /^[0-9\b]+$/;
          return re.test(value);
      };

    _saveCard = async () => {
     try {



      const { number, expMonth,expYear,cvc,currentYear,currentMonth} = this.state;
      var  mnth = parseInt(expMonth)
      var year= parseInt(expYear)
      var cmnth=parseInt(currentMonth)
      var cyear=parseInt(currentYear)
      console.log("Current Month:",currentMonth);
      console.log("select Month:",expMonth);
      if(number==='' || expMonth==='' || expYear==='' || cvc==='')
      {
        Alert.alert(Strings.gymonkee,"Please enter details")
      }
      else if(number.length < 19)
      {
        Alert.alert(Strings.gymonkee,"Please enter minimum 16 digits card number")
      }
      else if(expMonth===0)
      {
          Alert.alert(Strings.gymonkee,"Please select expiry month")
      }
      else if(expYear===0)
      {
          Alert.alert(Strings.gymonkee,"Please select expiry year")
      }
      else if(mnth < cmnth && year === cyear)
      {
        Alert.alert(Strings.gymonkee,"Please select valid month")
      }
      else if(mnth < cmnth && year < cyear)
      {
        Alert.alert(Strings.gymonkee,"Please select valid month")
      }
      else if(year < cyear)
      {
        Alert.alert(Strings.gymonkee,"Please select valid year")
      }
      else if(cvc.length <= 2 || cvc.length > 4)
      {
        Alert.alert(Strings.gymonkee,"Please enter valid CVV")
        this.refs['CVV'].focus()
      }
      else if(!this.validateForNumeric(cvc))
      {
        Alert.alert(Strings.gymonkee,"Please enter valid CVV")
      }
      else {
            this.setState({loader:true});
            const params = {
               // mandatory
               number: number,
               expMonth:Number(expMonth),
               expYear: Number(expYear),
               cvc: cvc

             }

            var token = await stripe.createTokenWithCard(params)
            console.log("Stripe Token",token.tokenId);
            this.setState({loader:false,stripe_card_token:token.tokenId});

            this._addCardToStripeForCustomer();

          }
      }
      catch (error) {
        console.log("Create card Error",error);

        this.setState({loader:false});

        setTimeout(()=>{
          Alert.alert(Strings.gymonkee,"Your card was declined. Your request was in live mode, but used a known test card.")
        },500)

      }

   }
   _navigateToScreen(routename)
   {
     if(isFromBuyCoins)
     {
       const resetAction = NavigationActions.reset({
             index: 0,
             actions: [NavigationActions.navigate({ routeName: 'GetCoins' })],
           });
           this.props.navigation.dispatch(resetAction);
     }
     else {
       const resetAction = NavigationActions.reset({
             index: 0,
             actions: [NavigationActions.navigate({ routeName: routename })],
           });
           this.props.navigation.dispatch(resetAction);
     }



   }

   _addCardToStripeForCustomer()
   {

     NetInfo.isConnected.fetch().done((isConnected) => {
                       this.setState({ netStatus: isConnected });

                           if(isConnected)
                           {
                               this.setState({loader:true});
                               //https://us-central1-gymonkee-3cad2.cloudfunctions.net/createStripeCustomer?email=jaydeep.patel@bypt.n
                                 var url = Strings.base_URL + 'addCreditCard?customerId='+this.state.stripe_cust_id+'&cardToken='+this.state.stripe_card_token
                                 console.log("addCreditCard url",url);
                                 fetch(url, {
                                   method: 'GET',
                                 }).then((response) => response.json())
                                     .then((responseData) => {
                                      //Alert.alert("KK",JSON.stringify(data))
                                      console.log("Add Credit Card Response",responseData);
                                      console.log("Card Id",responseData.id);
                                      this.setState({loader:false});
                                      setTimeout(()=>{
                                        Alert.alert(Strings.gymonkee,"Card added successfully...",
                                        [
                                          {text:"OK",onPress:()=>{this._navigateToScreen('PaymentDetails')}}
                                        ])
                                      },700)

                                     }).catch((error) => {
                                         this.setState({loader:false});
                                         console.log("Error is:",error);

                                      }).done();

                       }
               else
               {
                   Alert.alert(Strings.gymonkee,Strings.internet_offline);
               }
         });

   }

  //Main View Rendering
  typeNumber(text)
  {
        // if(this.state.number==='')
        // {
        //   this.setState({
        //       number: text.replace(/\s/g, '')
        //   })
        // }else{
        //   if(text.length===16)
        //   {
        //       this.setState({number: text})
        //
        //   }else{
        //       this.setState({number: text})
        //   }
        // }
        let formattedText = text.split(' ').join('');
          if (formattedText.length > 0) {
            formattedText = formattedText.match(new RegExp('.{1,4}', 'g')).join(' ');
          }
          this.setState({ number: formattedText });
          }

  typeMonth(text)
  {

    if(this.state.expMonth==='')
    {
      this.setState({
          expMonth: text.replace(/\s/g, '')
      })
    }else{
      if(text.length===2)
      {
          this.setState({expMonth: text})

      }else{
          this.setState({expMonth: text})
      }
    }

  }

  typeYear(text)
  {
    if(this.state.expYear==='')
    {
      this.setState({
          expYear: text.replace(/\s/g, '')
      })
    }else{
      if(text.length===2)
      {
          this.setState({expYear: text})
          this.refs['CVV'].focus()
      }else{
          this.setState({expYear: text})
      }
    }
  }

  typeCVV(text)
  {
    if(this.state.cvc==='')
    {
      this.setState({
       cvc: text.replace(/\s/g, '')
      })
    }else{
      this.setState({cvc: text})
    }

  }
  _dropdown_month_row(rowData, rowID, highlighted) {
            console.log("CC:",rowData + rowID + highlighted);
          return (
            <TouchableHighlight underlayColor='#a5a5a4'>
              <View style={[styles.dropdown_2_row, {backgroundColor: 'white'}]}>

                <Text style={[styles.dropdown_month_text, {color: '#a5a5a4'}]}>
                  {`${rowData}`}
                </Text>
              </View>
            </TouchableHighlight>
          );
        }

        _dropdownMonth_onSelect(idx, value,key) {
          console.log("Month",value);
          // var tempArr = [...this.state.arrAllLeaveData]
          // var id = tempArr[idx].leave_type_id
          this.setState({
            expMonth: value,
          });
          // setTimeout(()=>{
          //   console.log("Category Data is",this.state.category);
          // },1000)
        }

        _dropdown_year_row(rowData, rowID, highlighted) {
                  console.log("CC:",rowData + rowID + highlighted);
                return (
                  <TouchableHighlight underlayColor='#a5a5a4'>
                    <View style={[styles.dropdown_2_row, {backgroundColor: 'white'}]}>

                      <Text style={[styles.dropdown_month_text, {color: '#a5a5a4'}]}>
                        {`${rowData}`}
                      </Text>
                    </View>
                  </TouchableHighlight>
                );
              }

              _dropdownYear_onSelect(idx, value,key) {
                console.log("Year",value);
                // var tempArr = [...this.state.arrAllLeaveData]
                // var id = tempArr[idx].leave_type_id
                this.setState({
                  expYear: value,
                });
                // setTimeout(()=>{
                //   console.log("Category Data is",this.state.category);
                // },1000)
              }



  render(){
    return(
        <View style={styles.container}>
        
        
              <View style={{alignItems:'center'}}>
                  {this.loader()}
              </View>

            <View style={{flex:10,backgroundColor:Colors.theme_background,}}>
            <ImageBackground source={ require('../../assets/Home-01/06.png')}  style={{ height: '100%', width: '100%'}}>
                  <View style={{flex:3,borderWidth:0}}>

                  </View>

                  <View style={{flex:7,borderWidth:0,marginTop: (Platform.OS==='android')?-60:(DeviceInfo.getModel() === ModelIphoneX)?-90:-40}}>
                      <View style={{flex:3,borderWidth:0,margin:20}}>

                              <View style={{flex:1,borderWidth:0}}>

                                    <TextInput
                                        placeholder='Card number'
                                        style={{fontFamily:Fonts.regular,fontSize:(deviceHeight>600)?20:18,backgroundColor:'white',color:Colors.orange_text,borderWidth:1,borderColor:Colors.placeholdar,paddingHorizontal:10,marginTop:10,flex:(DeviceInfo.getModel() === ModelIphoneX)?0.7:0.8}}
                                        ref='number'
                                        placeholderTextColor="rgb(115,119,118)"
                                        underlineColorAndroid='transparent'
                                        onChangeText={(text) => this.typeNumber(text)}
                                        value={this.state.number}
                                        keyboardType="numeric"
                                        returnKeyType="next"
                                        maxLength={19}

                                    />

                              </View>

                                  <View style={{flex:(DeviceInfo.getModel() === ModelIphoneX)?0.5:0.7,flexDirection:'row'}}>
                                        <View style={{flex:0.5,flexDirection:'row',borderWidth:1,borderColor:Colors.placeholdar}}>
                                            <View style={{flex:0.4,borderWidth:0,justifyContent:'center',backgroundColor:'white'}}>
                                              <Text style={{marginLeft:10,color:Colors.placeholdar,fontSize:(deviceHeight>600)?16:14}}>Expiry</Text>
                                            </View>

                                            <View style={{flex:0.3,borderRightWidth:0.5,alignItems:'center',justifyContent:'center',backgroundColor:Colors.white}}>
                                            <ModalDropdown
                                                ref={el => this._dropdown_month = el}
                                                textStyle={styles.dropdown_month_text}
                                                dropdownStyle={styles.dropdown_month_style}
                                                dropdownTextStyle={styles.dropdown_month_text}
                                                options={this.state.monthData}
                                                defaultValue='MM'
                                                renderRow={this._dropdown_month_row.bind(this)}
                                                onSelect={(idx, value) => this._dropdownMonth_onSelect(idx, value)}
                                                value={this.state.expMonth}
                                                //renderSeparator={(sectionID, rowID, adjacentRowHighlighted) => this._dropdown_2_renderSeparator(sectionID, rowID, adjacentRowHighlighted)}
                                                />




                                            </View>

                                            <View style={{flex:0.3,borderLeftWidth:0.5,alignItems:'center',justifyContent:'center',backgroundColor:Colors.white}}>
                                                <ModalDropdown
                                                    ref={el => this._dropdown_year = el}
                                                    textStyle={styles.dropdown_month_text}
                                                    dropdownStyle={styles.dropdown_month_style}
                                                    dropdownTextStyle={styles.dropdown_month_text}
                                                    options={this.state.yearData}
                                                    defaultValue='YY'
                                                    renderRow={this._dropdown_year_row.bind(this)}
                                                    onSelect={(idx, value) => this._dropdownYear_onSelect(idx, value)}
                                                    value={this.state.expMonth}
                                                    //renderSeparator={(sectionID, rowID, adjacentRowHighlighted) => this._dropdown_2_renderSeparator(sectionID, rowID, adjacentRowHighlighted)}
                                                    />

                                            </View>
                                        </View>

                                        <View style={{flex:0.5,flexDirection:'row',borderWidth:1,borderColor:Colors.placeholdar,marginLeft:20}}>
                                                <View style={{flex:0.7}}>
                                                    <TextInput
                                                        placeholder='CVV'
                                                        style={{fontFamily:Fonts.regular,backgroundColor:'white',fontSize:(deviceHeight>600)?20:18,color:Colors.orange_text,paddingHorizontal:10,borderWidth:0,borderColor:Colors.placeholdar,flex:1}}
                                                        ref='CVV'
                                                        placeholderTextColor="rgb(115,119,118)"
                                                        underlineColorAndroid='transparent'
                                                        onChangeText={(text) => this.typeCVV(text)}
                                                        value={this.state.cvc}
                                                        keyboardType="numeric"
                                                        maxLength={4}
                                                        returnKeyType="done"
                                                    />
                                                </View>

                                                <View style={{flex:0.3,justifyContent:'center',alignItems:'center',backgroundColor:'white'}}>
                                                    <Image source={{uri:'cvv_card'}} style={{height:30,width:30}} resizeMode="contain"/>
                                                </View>
                                        </View>
                                  </View>
                              <View style={{flex:1,borderWidth:0}}>
                                <View style={{flex:(DeviceInfo.getModel() === ModelIphoneX)?0.4:0.3}}/>
                                    <TouchableOpacity style={{flex:0.6,borderWidth:0,backgroundColor:Colors.header_red,borderRadius:6,justifyContent:'center',alignItems:'center'}} onPress={this._saveCard}>
                                        <Text style={{fontSize:18,color:'white',fontFamily:Fonts.regular}}>SAVE CARD</Text>
                                    </TouchableOpacity>
                              </View>
                      </View>

                      <View style={{flex:4,borderWidth:0}}/>
                  </View>
            </ImageBackground>
            </View>
            
        </View>
    )
  }

}
const styles = StyleSheet.create({
  container: {
   flex: 10,
   marginTop: (Platform.OS==='android')?-140:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?-120:-150,

 },
 statusBar: {
    height: STATUSBAR_HEIGHT,

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
    fontFamily:Fonts.SFU_BOLD,
    color:Colors.redcolor,
  },
  coin_text:{
    fontSize: 22,
    fontFamily:Fonts.regular,
    color:Colors.redcolor,
  },
  gym_name_text:{
    fontSize: 22,
     fontFamily:Fonts.regular,
    color:Colors.white,
  },
   miles_away_text:{
    fontSize: 16,
     fontFamily:Fonts.regular,
    color:Colors.white,
  },
coin_count_text_white:{
    fontSize: 40,
    fontFamily:Fonts.SFU_BOLD,
    color:Colors.white,
  },
  coin_text_white:{
    fontSize: 18,
    fontFamily:Fonts.SFU_THIN,
    color:Colors.white,
  },
  dropdown_month_text: {

  fontSize: 20,
  color: Colors.orange_text,
  textAlignVertical: 'center',
  fontFamily:Fonts.regular,
  borderWidth:0
},
dropdown_month_style: {
  width: 80,
  //flex:1,
  marginTop:-10,
  paddingHorizontal: 7,
  flexDirection:'row',
  borderColor: '#a5a5a4',
  borderWidth: 1,
  marginLeft:-20,



  //borderRadius: 3,
},

dropdown_2_row:{
    alignItems:'center',
    width:50,
    height:30,
    justifyContent:'center'
},
})
module.exports = PaymentDetailsAddCard
