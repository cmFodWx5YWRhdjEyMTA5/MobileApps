import React from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  Animated,
  Easing,
} from 'react-native';

import ViewPager from 'react-native-viewpager';
var deviceWidth = Dimensions.get('window').width;

var IMGS = [
  'https://images.unsplash.com/photo-1441742917377-57f78ee0e582?h=1024',
  'https://images.unsplash.com/photo-1441716844725-09cedc13a4e7?h=1024',
  'https://images.unsplash.com/photo-1441448770220-76743f9e6af6?h=1024',
  'https://images.unsplash.com/photo-1441260038675-7329ab4cc264?h=1024'
];

var ImagePager = React.createClass({
  getInitialState: function() {
    var dataSource = new ViewPager.DataSource({
      pageHasChanged: (p1, p2) => p1 !== p2,
    });

    return {
      dataSource: dataSource.cloneWithPages(IMGS),
    };
  },

  render: function() {
    return (
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
    isLoop={true}
    autoPlay={true}
  />
    );
  },

_renderPage: function(
    data: Object,
    pageID: number | string,) {
    return (
      <Image
        source={{uri: data}}
        style={styles.page}
        resizeMode="cover"/>
    );
  },
});

var styles = StyleSheet.create({
  page: {
    width: deviceWidth,
  },
});

module.exports = ImagePager;
