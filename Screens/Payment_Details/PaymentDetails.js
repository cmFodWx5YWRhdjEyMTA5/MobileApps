
//PaymentDetails

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
import { deviceHeight, deviceWidth } from './../Utils/DeviceDimensions';
import Stars from 'react-native-stars';
import Spinner from 'react-native-loading-spinner-overlay';
import stripe from 'tipsi-stripe';

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

//Development Key Stripe : pk_test_h1OytUtRZVA0lSiMRkdkmU5P
//Production Key Stripe :  pk_live_TBsKU1DBuknrbB6YUT3KrcNH

stripe.setOptions({ publishableKey: Strings.stripe_key, merchantId: 'merchant.com.gymonkee.merchant' })

class PaymentDetails extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      number: '',
      expMonth: 0,
      expYear: 0,
      cvc: '',
      stripe_cust_id: '',
      cardList: [],
      isAlreadyCard: true,
      coin: 0,
      doller_price: 0,
      planType: '',
      oldCoin: 0,
      user_id: '',
      isFromBuyCoins: false,
      coupon_code: '',
      allowed: false,
      reedemStatus: 0,
    }
  }

  //handle Internetconnection
  handleConnectionChange = (isConnected) => {
    this.setState({ netStatus: isConnected });
    console.log(`is connected: ${this.state.netStatus}`);
  }

  //  Apple pay code
  handleApplePayPress = async () => {
    stripe.setOptions({ publishableKey: Strings.stripe_key, merchantId: 'merchant.com.gymonkee.merchant' })


    stripe.openApplePaySetup()
    await stripe.deviceSupportsApplePay()
    await stripe.canMakeApplePayPayments()
    console.log("Apple pay press")
    try {
      this.setState({
        loading: true,
        status: null,
        token: null,
      })
      const token = await stripe.paymentRequestWithApplePay([{
        label: 'Tipsi',
        amount: '110.00',
      }], {
          shippingMethods: [{
            id: 'fedex',
            label: 'FedEX',
            detail: 'Test @ 10',
            amount: '10.00',
          }],
        })

      this.setState({ loading: false, token })

      console.log("Tokenn", token);
      console.log("Tokenn Id", token.tokenId);
      if (this.state.complete) {
        await stripe.completeApplePayRequest()
        console.log("Apple pay payment completed")
      } else {
        await stripe.cancelApplePayRequest()
        console.log("Apple pay payment canceled")
      }

    } catch (error) {
      console.log("Error occur while apple pay ::", error.message)
    }

  }

  // Android pay code :
  handleAndroidPay = async () => {
    console.log("Android", "Pay Press");
    stripe.setOptions({ publishableKey: Strings.stripe_key, merchantId: 'merchant.com.gymonkee.merchant', androidPayMode: 'test', })
    try {
      this.setState({
        loading: true,
        token: null,
      })
      const token = await stripe.paymentRequestWithAndroidPay({
        total_price: '100.00',
        currency_code: 'USD',
        shipping_address_required: true,
        shipping_countries: ['US', 'CA'],
        line_items: [{
          currency_code: 'USD',
          description: 'Tipsi',
          total_price: '20.00',
          unit_price: '20.00',
          quantity: '1',
        }],
      })
      this.setState({ loading: false, token })
      console.log("Android Pay Token Response", token)
      console.log("Android Pay Token ", token.tokenId)
    } catch (error) {
      this.setState({ loading: false })
      console.log("Android Pay Error", error.message)
    }



    // try {
    //   this.setState({
    //     loading: true,
    //     token: null,
    //   })
    //   const token = await stripe.paymentRequestWithNativePay({
    //     total_price: '100.00',
    //     currency_code: 'USD',
    //     shipping_address_required: true,
    //     shipping_countries: ['US', 'CA'],
    //     line_items: [{
    //       currency_code: 'USD',
    //       description: 'Whisky',
    //       total_price: '50.00',
    //       unit_price: '50.00',
    //       quantity: '1',
    //     }, {
    //       currency_code: 'USD',
    //       description: 'Vine',
    //       total_price: '30.00',
    //       unit_price: '30.00',
    //       quantity: '1',
    //     }, {
    //       currency_code: 'USD',
    //       description: 'Tipsi',
    //       total_price: '20.00',
    //       unit_price: '20.00',
    //       quantity: '1',
    //     }],
    //   })
    //   this.setState({ loading: false, token })
    // } catch (error) {
    //   this.setState({ loading: false })

    //  console.log("Android Pay Error", error.message);
    // }
    // console.log("Android Pay Token", token);

  }

  //Life Cycle Methods
  async componentWillMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    NetInfo.isConnected.fetch().done((isConnected) => { this.setState({ netStatus: isConnected }); });
    stripe.setOptions({ publishableKey: Strings.stripe_key, merchantId: 'merchant.com.gymonkee.merchant', androidPayMode: 'test', })
    if (Platform.OS === 'ios') {
      const allowed = await stripe.deviceSupportsApplePay()
      this.setState({ allowed })
    } else {

      const allowed = await stripe.deviceSupportsNativePay()
      this.setState({ allowed })
    }


  }
  componentDidMount() {

    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    NetInfo.isConnected.fetch().done((isConnected) => { this.setState({ netStatus: isConnected }); });

    AsyncStorage.setItem(Strings.AsyncStorage_Key_isLogin, 'success');
    AsyncStorage.getItem("stripe_cust_id").then((value) => {
      console.log("stripe_cust_id: ", value);
      this.setState({
        stripe_cust_id: value

      })
      if (value != null) {
        this._getCardListFromStripeUsingApi();
      }
    }).done();

    AsyncStorage.getItem("user_id").then((value) => { this.setState({ user_id: value }) }).done();

    const { state } = this.props.navigation;
    console.log("state", state.params);

    if (state.params != undefined) {
      this.setState({
        coin: state.params.coin,
        doller_price: state.params.doller_price,
        planType: state.params.planType,
        isFromBuyCoins: state.params.isFromBuyCoins,

      })
      console.log("Param Values are:-", state.params.coin + "::" + state.params.doller_price + "::" + state.params.planType);
    }
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

  _getCardListFromStripeUsingApi() {
    NetInfo.isConnected.fetch().done((isConnected) => {
      this.setState({ netStatus: isConnected });

      if (isConnected) {
        this.setState({ loader: true });
        var url = Strings.base_URL + 'listAllCreditCards?customerId=' + this.state.stripe_cust_id
        console.log("listAllCreditCards url", url);
        fetch(url, {
          method: 'GET',
        }).then((response) => response.json())
          .then((responseData) => {
            //Alert.alert("KK",JSON.stringify(data))
            this.setState({
              loader: false
            })
            console.log("listAllCreditCards Response:", responseData.data);
            if (responseData.data.length > 0) {
              this.setState({
                cardList: responseData.data,
                isAlreadyCard: true,
              });
            } else {
              this.setState({
                isAlreadyCard: false,
              });
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
  //onPress={(Platform.OS === 'ios') ? this.handleApplePayPress : this.handleAndroidPay}
  _onClickRedeem() {
    if (this.state.coupon_code === '') {
      Alert.alert(Strings.gymonkee, "Please enter Coupon code")
    } else {
      this._redeemCouponCodeApi();
    }
  }

  _redeemCouponCodeApi() {
    NetInfo.isConnected.fetch().done((isConnected) => {
      this.setState({ netStatus: isConnected });

      if (isConnected) {
        this.setState({ loader: true });
        var url = Strings.base_URL + "redeemCoupon?customerId=" + this.state.stripe_cust_id + "&couponCode=" + this.state.coupon_code
        console.log("redeemCoupon", url);
        fetch(url, {
          method: 'GET',
        }).then((response) => response.json())
          .then((responseData) => {
            //Alert.alert("KK",JSON.stringify(data))
            this.setState({
              loader: false
            })
            console.log("redeemCoupon:", responseData.data);
            if (responseData.status === 1) {
              setTimeout(() => {
                Alert.alert(Strings.gymonkee, responseData.message);
              }, 500)


              this.setState({
                reedemStatus: 1,
                coupon_code: '',
              })
            } else {
              setTimeout(() => {
                Alert.alert(Strings.gymonkee, responseData.message);
              }, 500)


              this.setState({
                reedemStatus: 2,
                coupon_code: '',
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

  _gotoDashboard() {
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Dashboard' })],
    });
    this.props.navigation.dispatch(resetAction);
  }

  _goToPayment(cardId, e) {
    //Alert.alert("Id",id);

    if (this.state.planType === '') {

    }
    else {
      NetInfo.isConnected.fetch().done((isConnected) => {
        this.setState({ netStatus: isConnected });

        if (isConnected) {
          this.setState({ loader: true });
          //https://us-central1-gymonkee-3cad2.cloudfunctions.net/payWithStripe?cardId=card_1C8qXcFpzWlK6ATsuGRnjvOu&amount=50&description=Test&customerId=cus_CXuI6wC4ATUzqc
          var url = Strings.base_URL + 'payWithStripe?cardId=' + cardId + '&amount=' + this.state.doller_price + '&description=' + this.state.planType + '&customerId=' + this.state.stripe_cust_id
          console.log("payWithStripe url", url);
          fetch(url, {
            method: 'GET',
          }).then((response) => response.json())
            .then((responseData) => {
              //Alert.alert("KK",JSON.stringify(data))
              this.setState({ loader: false });
              console.log("Response:", responseData);


              var dt = moment(new Date()).format('MM/DD/YYYY');

              //entry in coin Transaction
              firebase.database().ref('CoinTransaction').push({ coins: this.state.coin, createdAt: firebase.database.ServerValue.TIMESTAMP, frinedId: "", planType: this.state.planType, trxType: 'CREDIT', userId: this.state.user_id, createdAt: firebase.database.ServerValue.TIMESTAMP, createdBy: this.state.user_id, status: 1, updatedAt: firebase.database.ServerValue.TIMESTAMP, updatedBy: this.state.user_id }).then(() => {


                firebase.database().ref('User').child(this.state.user_id).on('value', (data) => {

                  var userData = data.val();

                  console.log("userData", userData.coinBalance);

                  this.setState({
                    oldCoin: userData.coinBalance,
                    oldpaygCoin: userData.paygCoin,
                    oldmonthlyCoin: userData.monthlyCoin
                  });

                  if (this.state.oldpaygCoin === undefined) {
                    this.setState({
                      oldpaygCoin: 0
                    })
                  }
                  if (this.state.oldmonthlyCoin === undefined) {
                    this.setState({
                      oldmonthlyCoin: 0
                    })
                  }

                })



              })
              setTimeout(() => {
                firebase.database().ref('User').child(this.state.user_id).update({ coinBalance: this.state.oldCoin + this.state.coin })

                if (this.state.coin === 150) {
                  firebase.database().ref('User').child(this.state.user_id).update({ paygCoin: this.state.oldpaygCoin + this.state.coin })
                }
                else {
                  firebase.database().ref('User').child(this.state.user_id).update({ monthlyCoin: this.state.oldmonthlyCoin + this.state.coin });
                }

                setTimeout(() => {
                  Alert.alert(Strings.gymonkee, "Transaction successfull...",
                    [
                      { text: "OK", onPress: () => { this._gotoDashboard() } },
                    ],
                    { cancelable: false }
                  )
                }, 700)
              }, 700)





            }).catch((error) => {
              this.setState({ loader: false });
              console.log("Error is:", error);
              // setTimeout(()=>{
              //   Alert.alert(Strings.gymonkee,error.message);
              // },1000)
            }).done();

        }
        else {
          this.setState({
            isScan: false
          })
          Alert.alert(Strings.gymonkee, Strings.internet_offline);
        }
      });
    }


  }

  _displayCardListData() {
    if (this.state.cardList.length > 0) {
      return this.state.cardList.map((data, index) => {
        if (index === 0) {
          return (
            <TouchableOpacity onPress={() => this._goToPayment(data.id, index)}>
              <View style={{ height: 200, borderWidth: 0 }}>
                <View style={{ height: 70, borderWidth: 0 }}>

                  <TextInput
                    placeholder='Card number'
                    style={{ fontFamily: Fonts.regular, fontSize: (deviceHeight > 600) ? 20 : 18, backgroundColor: 'white', color: Colors.orange_text, borderWidth: 1, borderColor: Colors.placeholdar, paddingHorizontal: 10, marginTop: 10, flex: (DeviceInfo.getModel() === ModelIphoneX) ? 0.7 : 0.8 }}
                    ref='number'
                    placeholderTextColor="rgb(115,119,118)"
                    underlineColorAndroid='transparent'
                    onChangeText={(text) => this.setState({ number: text })}
                    value={'**** **** **** ' + data.last4}
                    keyboardType="numeric"
                    returnKeyType="next"
                    maxLength={19}
                    editable={false}
                    onSubmitEditing={() => this.refs['MM'].focus()}
                  />

                </View>

                <View style={{ height: 50, flexDirection: 'row', marginTop: 10 }}>
                  <View style={{ flex: 0.5, flexDirection: 'row', borderWidth: 1, borderColor: Colors.placeholdar }}>
                    <View style={{ flex: 0.4, borderWidth: 0, justifyContent: 'center', backgroundColor: 'white' }}>
                      <Text style={{ marginLeft: 10, color: Colors.placeholdar, fontSize: (deviceHeight > 600) ? 16 : 14 }}>Expiry</Text>
                    </View>

                    <View style={{ flex: 0.3, borderWidth: 0 }}>
                      <TextInput
                        placeholder='MM'
                        style={{ fontFamily: Fonts.regular, backgroundColor: 'white', fontSize: (deviceHeight > 600) ? 20 : 18, color: Colors.orange_text, borderWidth: 0, borderColor: Colors.placeholdar, flex: 1 }}
                        ref='MM'
                        textAlign="center"
                        placeholderTextColor="rgb(115,119,118)"
                        underlineColorAndroid='transparent'
                        onChangeText={(text) => this.setState({ expMonth: text })}
                        value={(data.exp_month.toString().length === 1) ? '0' + data.exp_month.toString() : data.exp_month.toString()}
                        keyboardType="numeric"
                        returnKeyType="next"
                        maxLength={2}
                        editable={false}
                        onSubmitEditing={() => this.refs['YY'].focus()}
                      />
                    </View>

                    <View style={{ flex: 0.3, borderWidth: 1, borderTopWidth: 0, borderBottomWidth: 0, borderRightWidth: 0 }}>
                      <TextInput
                        placeholder='YY'
                        style={{ fontFamily: Fonts.regular, backgroundColor: 'white', fontSize: (deviceHeight > 600) ? 20 : 18, color: Colors.orange_text, borderWidth: 0, borderColor: Colors.placeholdar, flex: 1 }}
                        ref='YY'
                        textAlign="center"
                        placeholderTextColor="rgb(115,119,118)"
                        underlineColorAndroid='transparent'
                        onChangeText={(text) => this.setState({ expYear: text })}
                        value={data.exp_year.toString().substr(data.exp_year.toString().length - 2)}
                        keyboardType="numeric"
                        returnKeyType="next"
                        maxLength={4}
                        editable={false}
                        onSubmitEditing={() => this.refs['CVV'].focus()}
                      />
                    </View>
                  </View>

                  <View style={{ flex: 0.5, flexDirection: 'row', borderWidth: 1, borderColor: Colors.placeholdar, marginLeft: 20 }}>
                    <View style={{ flex: 0.7 }}>
                      <TextInput
                        placeholder='CVV'
                        style={{ fontFamily: Fonts.regular, backgroundColor: 'white', fontSize: (deviceHeight > 600) ? 20 : 18, color: Colors.orange_text, paddingHorizontal: 10, borderWidth: 0, borderColor: Colors.placeholdar, flex: 1 }}
                        ref='CVV'
                        placeholderTextColor="rgb(115,119,118)"
                        underlineColorAndroid='transparent'
                        onChangeText={(text) => this.setState({ cvc: text })}
                        value={''}
                        keyboardType="numeric"
                        maxLength={4}
                        returnKeyType="done"
                        editable={false}
                      />
                    </View>

                    <View style={{ flex: 0.3, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                      <Image source={{ uri: 'cvv_card' }} style={{ height: 30, width: 30 }} resizeMode="contain" />
                    </View>
                  </View>
                </View>
                <View style={{ flex: 1, borderWidth: 0, marginTop: 20 }}>

                  <TouchableOpacity onPress={() => this._deleteCardConfirm(data.id, index)} style={{ flex: 1, borderWidth: 0, paddingTop: 10, paddingBottom: 10, backgroundColor: Colors.header_red, borderRadius: 6, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, color: 'white', fontFamily: Fonts.regular }}>DELETE CARD</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )
        }
      })

    } else {
      return (
        <View style={{ height: 200, borderWidth: 0, justifyContent: 'center', alignItems: 'center' }}>
          {(this.state.isAlreadyCard === false) ? <Text style={{ fontSize: 25, fontFamily: Fonts.medium, color: Colors.header_red + '70' }}>No card added...!</Text> : <Text></Text>}
        </View>
      )
    }
  }



  static navigationOptions = ({ navigation, screenProps }) => {
    const params = navigation.state.params || {};
    return {
      title: 'Payment Details',
      headerStyle: { backgroundColor: Colors.header_red, borderBottomWidth: 0, shadowColor: 'transparent', elevation: 0, marginTop: (Platform.OS === 'android') ? 20 : 0 },
      headerTitleStyle: HeaderStyle.titleCenter,

    }
  }

  _deleteCardConfirm(id, e) {
    Alert.alert(Strings.gymonkee, "Are you sure want to delete card?",
      [
        { text: "Yes", onPress: () => this._deleteCard(id, e) },
        { text: 'No', style: 'cancel' }
      ],
      { cancelable: false }
    )
  }

  _deleteCard(id, e) {

    NetInfo.isConnected.fetch().done((isConnected) => {
      this.setState({ netStatus: isConnected });

      if (isConnected) {
        this.setState({ loader: true });
        var url = Strings.base_URL + 'deleteCreditCard?customerId=' + this.state.stripe_cust_id + '&cardId=' + id
        console.log("deleteCreditCard url", url);
        fetch(url, {
          method: 'GET',
        }).then((response) => response.json())
          .then((responseData) => {
            //Alert.alert("KK",JSON.stringify(data))
            console.log("deleteCreditCard Response:", responseData);

            this.setState({ loader: false });

            // var array = this.state.cardList;
            // var index = array.indexOf(e.target.value)
            this.state.cardList.splice(e, 1);
            this.setState({ isAlreadyCard: false });


          }).catch((error) => {
            this.setState({ loader: false });
            console.log("Error is:", error);

          }).done();

      }
      else {
        Alert.alert(Strings.gymonkee, Strings.internet_offline);
      }
    });
  }
  _gotoAddNewCardScreen() {
    //Alert.alert(Strings.gymonkee,"Under Implementation");
    this.props.navigation.navigate('PaymentDetailsAddCard', { isFromBuyCoins: this.state.isFromBuyCoins });
  }

  onClickAddCoupon() {
    stripe.openApplePaySetup()
    // stripe.canMakeApplePayPayments(['american_express', 'discover'])
    // stripe.canMakeApplePayPayments()

    // Alert.alert(Strings.gymonkee,"Under implementation")
  }
  //Main View Rendering

  render() {
    return (
      <View style={styles.container}>
        <MyStatusBar backgroundColor={Colors.header_red} barStyle="dark-content" hidden={false} />
        <View style={{ alignItems: 'center' }}>
          {this.loader()}
        </View>

        <View style={{ flex: 10, backgroundColor: Colors.theme_background, }}>
          <View style={{ flex: 3, borderWidth: 0 }}>
            <ImageBackground source={{ uri: 'shape_red_top' }} resizeMode="contain" style={{ height: null, width: null, flex: 3, marginTop: (DeviceInfo.getModel() === ModelIphoneX) ? -55 : (DeviceInfo.getModel() === 'iPhone 8 Plus') ? -20 : (DeviceInfo.getModel() === 'iPhone 6 Plus') ? -20 : (Platform.OS === 'android') ? -20 : -10 }}>

            </ImageBackground>
          </View>
          <View style={{ flex: 1, borderBottomWidth: 0, borderColor: Colors.greylightOpacity, flexDirection: 'row', marginTop: (Platform.OS === 'android') ? -60 : (DeviceInfo.getModel() === ModelIphoneX) ? -90 : -40 }}>
            <View style={{ flex: 0.7, borderWidth: 0, margin: 5, marginLeft: 10 }}>
              <TextInput
                placeholder='Coupon code'
                style={{ fontFamily: Fonts.regular, fontSize: (deviceHeight > 600) ? 20 : 18, backgroundColor: 'white', color: Colors.orange_text, borderWidth: 1, borderColor: Colors.placeholdar, paddingHorizontal: 10, marginTop: 10, flex: (DeviceInfo.getModel() === ModelIphoneX) ? 0.7 : 0.8 }}
                ref='coupon_code'
                placeholderTextColor="rgb(115,119,118)"
                underlineColorAndroid='transparent'
                onChangeText={(text) => this.setState({ coupon_code: text })}
                value={this.state.coupon_code}
                keyboardType="default"
                returnKeyType="next"
                maxLength={19}
              />
            </View>
            <View style={{ flex: 0.3, borderWidth: 0, justifyContent: 'center', margin: 5 }}>
              <TouchableOpacity onPress={() => this._onClickRedeem()} style={{ flex: 0.65, borderWidth: 0, marginLeft: 10, marginRight: 10, backgroundColor: Colors.header_red, borderRadius: 3, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, color: 'white', fontFamily: Fonts.regular }}>Redeem</Text>
              </TouchableOpacity>
            </View>

          </View>

          <View style={{ flex: 6, borderWidth: 0, }}>
            <View style={{ flex: 7, borderWidth: 0, margin: 20 }}>
              <ScrollView bounces={false}>
                {this._displayCardListData()}
              </ScrollView>
            </View>

            <View style={{ flex: 1, borderWidth: 0, marginTop: 20, padding: (DeviceInfo.getModel() === ModelIphoneX) ? 25 : 10 }}>

              {(this.state.isAlreadyCard === false) ? <TouchableOpacity onPress={() => this._gotoAddNewCardScreen()} style={{ flex: 1, borderWidth: 0, backgroundColor: Colors.header_red, borderRadius: 6, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, color: 'white', fontFamily: Fonts.regular }}>ADD NEW CARD</Text>
              </TouchableOpacity> : <View />}

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
    fontSize: 20,
    fontFamily: Fonts.regular,
    color: Colors.redcolor,

  },
  coin_count_text: {
    fontSize: 40,
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
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.white,
  },
  coin_count_text_white: {
    fontSize: 40,
    fontFamily: Fonts.SFU_BOLD,
    color: Colors.white,
  },
  coin_text_white: {
    fontSize: 18,
    fontFamily: Fonts.SFU_THIN,
    color: Colors.white,
  },
})
module.exports = PaymentDetails
