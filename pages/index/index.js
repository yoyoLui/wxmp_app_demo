//index.js
//获取应用实例
var opt;
var t = 0;
var app = getApp();
Page({
  data: {
    state: '正在加载..',
    refreshFlag: false,
    scrollTop: 0,
    countryPriceIndex: 0,//选择油号序号
    privilege: "position: absolute;top:360rpx;",
    switchFlag: 1,
    switchTextPostion: "right",
    nowGas: "柴油",
    animationData: {},
    index: 0, //油号选择序号，
    show_pop_box: false, //一键加油弹窗
    show_pop_box_button_getUserInfo: false, //用户信息
    scroll_page: 'true', //滑动页面
    compareWithBoth: false,
    toCommonCarType: 0, //默认车队身份
    no_chedui_stationList: false, //没有车队油站列表
    windowHeight: '' //屏幕高度
  },

  onLoad: function(options) {
    var that = this;
    opt = options;
    that.onload_handle();
    this.get_client_width();
  },
  onload_handle: function() {
    var that = this;
    //58
    if (app.referrerInfo) {
      if (app.referrerInfo.phone) {
        if (checkMobile(app.referrerInfo.phone)) {
          that.load_58_gasStation(app.referrerInfo.phone);
        }
      } else {
        wx.showToast({
          title: '缺少手机号',
        })
      }
      return;
    }

    try {
      var value = wx.getStorageSync('img_url');
      if (value) {
        console.log('获取banner缓存成功');
        that.setData({
          _img_url: value,
        });
      }
    } catch (e) {

    }
    try {
      var value = wx.getStorageSync('stationListData');
      if (value) {
        console.log('获取油站列表缓存成功');
        that.setData({
          stationListData: value
        });
      }
    } catch (e) {

    }
    app.getWindowInfo(function() {
      console.log(app.systemInfo);
      console.log("getWindowInfo测试上传");
      that.setData({
        systemInfo: app.systemInfo
      })
    });
    wx.showNavigationBarLoading();
    wx.showLoading({
      title: '加载中',
    })
    wx.login({
      success: function(loginData) {
        app.loginData = loginData;
        console.log("登录成功");
        app.getOpenidAndSession_key(function() {
          wx.showLoading({
            title: '加载中',
          })
          if (!app.unionid) {
            //检测用户信息授权
            wx.getSetting({
              success: function(res) {
                if (res.authSetting['scope.userInfo']) {
                  wx.getUserInfo({
                    success: function(userInfoData) {
                      console.log("获取用户信息成功", userInfoData);
                      app.userInfoData = userInfoData;
                      app.decodeEncrypt_data(function() {
                        that.getstation();
                      })
                    },
                    fail: function(e) {
                      //没有授权用户信息，则展示默认油站列表user_id==0&&car_type==5
                      that.getstation();
                    }
                  })
                } else {
                  //没有检测到用户信息授权
                  if (app.canIUse.getUserInfo) { //版本支持
                    that.setData({
                      show_pop_box_button_getUserInfo: true,
                    })
                  } else {}
                }
              }
            })
          } else {
            that.getstation();
          }
        })
      }
    });
  },
  //加载58的加油站列表
  load_58_gasStation: function(phone) {
    var that = this;
    if (phone) {
      app.get_userInfo_58(phone, function() {
        that.getstation()
      })
    } else {
      wx.showModal({
        content: '缺少参数',
        showCancel: false
      })
    }

  },
  onShow: function(option) {
    var that = this;
    if (app.getLocationFlag == 1) { //从设置页回来
      wx.showLoading({
        title: '定位中',
      })
      //重新获取定位经纬度
      app.getLocation(function(ret) {
        if (ret == false) { //还是没有拿到定位
          //先检查缓存油站列表是否有，没有再去请求新油站数据
          try {
            var res = wx.getStorageInfoSync()
            console.log(res.keys)
            if (res.keys.indexOf('stationListData') <= -1) { //没有缓存油站

              app.longitude = 114.059380;
              app.latitude = 22.546770;
              //拿到了定位
              if (opt.from_source == 1) {
                that.onekeyButtonClick();
              }
              that.getstation_not_fresh_card();
            } else {

            }
          } catch (e) {

          }


        } else if (ret == 1) {

          //拿到了定位
          if (opt.from_source == 1) {
            that.onekeyButtonClick();
          }
          that.getstation_not_fresh_card();
        } else if (ret == 2) {
          wx.showModal({
            content: '未获取到您的地理位置，暂时无法为你提供服务。请检查是否已关闭定位权限，或尝试重新打开“易加油”小程序',
            showCancel: false,
            confirmText: '好的'
          })
        }

      });
    }
    wx.setNavigationBarTitle({
      title: '易加油'
    })
    wx.hideNavigationBarLoading()
    wx.hideLoading();
  },
  onPullDownRefresh: function() {

    this.onload_handle();
    wx.hideNavigationBarLoading()
    wx.stopPullDownRefresh()
  },

  //展现当前版本号
  show_current_version: function() {
    t++;
    if (t == 15) {
      t = 0;
      wx.showModal({
        content: '小程序2.0.7，更新点：\r\n1.上线跳转福利小程序\r\n',
        showCancel: false,
        success: function() {
          wx.showModal({
            content: '系统信息' + JSON.stringify(app.systemInfo),
            showCancel: false
          })
        }
      })
    }
  },
  switchChange: function() {
    var that = this;
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease',
    });
    if (that.data.switchFlag == 1) {
      animation.left("106rpx").step();
      this.setData({
        animationData: animation.export()
      });
      that.setData({
        switchFlag: 2,
        switchTextPostion: "left",
        nowGas: "汽油",
      });
    } else if (that.data.switchFlag == 2) {
      animation.left("12rpx").step();
      this.setData({
        animationData: animation.export()
      });
      that.setData({
        switchFlag: 1,
        switchTextPostion: "right",
        nowGas: "柴油"
      });
    }
  },

  scroll: function(e) {
    e = e.detail;
    var that = this;
    if (e.scrollTop * 750 / e.scrollWidth >= 360 && scrollFlag) {
      scrollFlag = false;
      that.setData({
        privilege: "position: fixed;top:-2rpx;z-index:999",
      })
    } else if (e.scrollTop * 750 / e.scrollWidth < 360 && !scrollFlag) {
      scrollFlag = true;
      that.setData({
        privilege: "position: absolute;top:360rpx;",
      })
    }
  },
  fold: function() {
    var that = this;
    that.setData({
      scrollTop: 360 * app.systemInfo.windowWidth / 750,
      pickerButtonClickFlag: true,
    })
  },

  imgLoadAnimation: function() {
    var that = this;
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })
    animation.opacity(1).step();
    that.setData({
      bannerAnimation: animation.export()
    })
  },
  _imgLoadAnimation: function() {
    var that = this;
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })
    animation.opacity(1).step();
    that.setData({
      _bannerAnimation: animation.export()
    })
  },
  calc_distance: function() {
    for (var i in app.stationListData.stationList) {
      app.stationListData.stationList[i].distance = (getFlatternDistance(app.latitude - 0, app.longitude - 0, app.stationListData.stationList[i].latitude - 0, app.stationListData.stationList[i].longitude - 0) / 1000).toFixed(1);
    }
    var temp = 0;
    var flag = true;
    for (var i = 0; i < app.stationListData.stationList.length; i++) {
      flag = true;
      for (var j = 0; j < app.stationListData.stationList.length - i - 1; j++) {
        if (app.stationListData.stationList[j].distance - 0 > app.stationListData.stationList[j + 1].distance - 0) {
          flag = false;
          temp = app.stationListData.stationList[j + 1];
          app.stationListData.stationList[j + 1] = app.stationListData.stationList[j];
          app.stationListData.stationList[j] = temp;
        }
      }
      if (flag) {
        break;
      }
    }
  },
  // pick改变事件
  bindPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    var that = this;
    this.setData({
      pickerButtonClickFlag: false,
    })
    if (e.detail.value == this.data.index) {
      return;
    }
    that.setData({
      countryPriceIndex: e.detail.value,
      index: e.detail.value,
    })
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 5000,
    })
    app.getGasStation(app.stationListData.contryPriceList[that.data.countryPriceIndex].oilId, that.data.toCommonCarType, function() {
      wx.hideToast();
      if (app.stationListData.stationList) {
        that.calc_distance();
        that.setData({
          stationListData: app.stationListData
        });
      }
    });
  },
  cancel_call_back: function() {
    this.setData({
      pickerButtonClickFlag: false,
    })
    console.log('picker发送选择取消')
  },


  //点击"获取用户信息"
  click_getUserInfo: function(e) {
    var that = this;
    if (e.detail.iv) { //允许授权
      app.userInfoData = e.detail;
      app.decodeEncrypt_data(function() {
        that.setData({
          show_pop_box_button_getUserInfo: false
        })

        that.getstation();
      })

    } else { //拒绝授权,不能支付
      that.getstation();
    }

  },

  getHomePic: function() {
    var that = this;
    app.getHomePic(function(data) {

      console.log("banner图数据:" + JSON.stringify(data))
      if (!data || data.length == 0) {
        return;
      }
      that.setData({
        img_url: data,
      });

      wx.setStorage({
        key: 'img_url',
        data: data,
        success: function() {
          console.log('缓存banner图片成功', data);
        },
        fail: function() {
          console.log('缓存banner图片失败');
        }
      });
    });
  },
  //获取到用户信息，接下来的流程
  getstation: function() {
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    that.getHomePic();
    app.getLocation(function(ret) {
      if (ret == 1) {
        console.log("获取定位信息成功");
     
        that.getstation_not_fresh_card(function(){
          if (opt.from_source == 1) {
            that.onekeyButtonClick();
          }
        });
      } else if (ret == 2) {
        wx.showModal({
          content: '未获取到您的地理位置，暂时无法为你提供服务。请检查是否已关闭定位权限，或尝试重新打开“易加油”小程序',
          showCancel: false,
          confirmText: '好的',
          success: function() {
            wx.hideLoading();
          }
        })
      } else {
        wx.navigateTo({
          url: '../common/location_setting/index',
        })
      }

    });
  },
  //不刷新定位卡片，获取油站列表
  getstation_not_fresh_card: function(fn) {
    var that = this;
    that.setData({
      toCommonCarType: 0
    })
    var oil_id = app.stationListData&&app.stationListData.contryPriceList ? app.stationListData.contryPriceList[that.data.countryPriceIndex].oilId : 1;
    app.getGasStation(oil_id, that.data.toCommonCarType, function() {
      if (app.stationListData.stationList) {
        wx.hideLoading();
        that.setData({
          hasGetStation: true
        })
        that.calc_distance();
        that.setData({
          state: '已经全部加载完毕',
          stationListData: app.stationListData
        });

        wx.setStorage({
          key: 'stationListData',
          data: app.stationListData,
          success: function(res) {
            console.log('缓存油站列表成功');
          },
          fail: function(res) {
            console.log('缓存油站列表失败');
          }
        })
        if (fn) {
          fn();
        }
      }

    });
  },

  /**
   * 一键加油 start
   */
  onekeyButtonClick: function() {
    var that = this;
    if (!that.data.onekey_data) {
      that.data.onekey_data = {}
    }
    if (!app.stationListData) {
      return;
    }
    wx.showToast({
      title: '',
      icon: 'loading',
      duration: 10000
    })
    that.data.onekey_data.has_show_onekey_tabs = true
    that.onkeyInit(function(res) {
      wx.hideToast();
      that.data.onekey_data.has_show_onekey_tabs = false
      //显示一键加油选项卡
      if (res) {
        that.setData({
          show_pop_box: true
        })
      }
      //一键加油附近没有油站
      else {
        wx.showModal({
          showCancel: false,
          title: '提示',
          content: '附近没有易加油服务，请到油站列表看看吧'
        })
      }
    })
  },
  onekeyCloseClick: function() {
    var that = this
    that.data.onekey_data.has_show_onekey_tabs = false
    that.setData({
      show_pop_box: false
    })
  },
  onkeyInit: function(fn) {
    var that = this;
    var oil_id = app.stationListData.contryPriceList ? app.stationListData.contryPriceList[that.data.countryPriceIndex].oilId : 1;
    var toCommonCarType = that.data.toCommonCarType == 0 && app.stationListData.isShowChangeCarTypeButton == '1' ? true : false;
    app.oneKey(new Date().getTime(), toCommonCarType, oil_id, function(data) {
      //一键加油没有附近油站
      if (!data || null == data || !data.oneKeyFuelFillings || null == data.oneKeyFuelFillings || data.oneKeyFuelFillings.length == 0) {
        if (fn) {
          fn(false)
        }
        return
      }
      var station_list = []
      var onekey_data = {}
      for (var i = 0; i < data.oneKeyFuelFillings.length; i++) {
        data.oneKeyFuelFillings[i].enable = true;
        data.oneKeyFuelFillings[i].enableclass = "enable";
        data.oneKeyFuelFillings[i].animation = "";
        data.oneKeyFuelFillings[i].width = 0;
        data.oneKeyFuelFillings[i].top = 0;
        station_list.push(data.oneKeyFuelFillings[i])
      }
      onekey_data.station_list = station_list.reverse();
      onekey_data.station_list_size = station_list.length
      //设置需要动画的选项卡id，默认最后一个
      onekey_data.current_animation_index = station_list.length - 1
      that.setData({
        onekey_data: onekey_data
      })
      that.data.onekey_data = onekey_data
      that.onekeyTabsRender();
      if (fn) {
        fn(true)
      }
    })
  },
  onekeyTouchStart: function(e) {
    var that = this;
    var onekey_data = that.data.onekey_data
    onekey_data.startX = e.touches[0].clientX;
    onekey_data.startY = e.touches[0].clientY;
    that.data.onekey_data = onekey_data
  },

  onekeyTouchMove: function(e) {
    var that = this;
    var onekey_data = that.data.onekey_data
    var moveX = e.touches[0].clientX - onekey_data.startX
    var moveY = e.touches[0].clientY - onekey_data.startY
    onekey_data.moveX = moveX
    onekey_data.moveY = moveY
    var animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 0,
      timingFunction: "linear",
      delay: 0
    });
    animation.translate3d(moveX, moveY, 0).rotate(moveX / 20).step()
    //根据current_animation_index设置需要动画的选项卡
    onekey_data.station_list[onekey_data.current_animation_index].animation = animation.export()
    that.setData({
      onekey_data: onekey_data
    })
    that.onekey_data = onekey_data
  },

  onekeyTouchEnd: function(e) {
    var that = this;
    var onekey_data = that.data.onekey_data
    console.log(Math.abs(onekey_data.moveX));
    //移除
    if (Math.abs(onekey_data.moveX) > 180) {
      console.log("移除")
      var animation = wx.createAnimation({
        transformOrigin: "50% 50%",
        duration: 1500,
        timingFunction: "linear",
        delay: 0
      });
      animation.translate3d(onekey_data.moveX * 10, onekey_data.moveY, 0).rotate(onekey_data.moveX / 20).step()
      //根据current_animation_index设置需要动画的选项卡
      onekey_data.station_list[onekey_data.current_animation_index].animation = animation.export()
      //更新动画，选项卡移出界面
      that.setData({
        onekey_data: onekey_data
      })
      onekey_data.moveX = 0
      onekey_data.moveY = 0
      that.onekey_data = onekey_data
      //隐藏当前滑动的选项卡
      that.oneKeyRemoveTopTab();
    }
    //恢复位置
    else {
      console.log("恢复位置")
      var animation = wx.createAnimation({
        transformOrigin: "50% 50%",
        duration: 400,
        timingFunction: "cubic-bezier(0,1.95,.49,.73)",
        delay: 0
      });
      animation.translate3d(0, 0, 0).rotate(0).step()
      //根据current_animation_index设置需要动画的选项卡
      onekey_data.station_list[onekey_data.current_animation_index].animation = animation.export()
      that.setData({
        onekey_data: that.data.onekey_data
      })
      that.onekey_data = onekey_data
    }
  },

  onekeyToGun: function(e) {
    app.station_qrcode = e.target.dataset.qrcode;
    app.station_id = e.target.dataset.id;
    if (app.station_qrcode && app.station_id) {
      wx.navigateTo({
        url: "../gun/gun?from_page=2"
      })
    } else {
      wx.showModal({
        content: '缺少参数',
        showCancel: false
      })
    }
  },

  onekeyGoout: function() {
    var that = this
    var onekey_data = that.data.onekey_data
    var animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 1500,
      timingFunction: "linear",
      delay: 0
    });
    animation.translate3d(-130 * 10, 0, 0).rotate(-130 / 2).step()
    //根据current_animation_index设置需要动画的选项卡
    onekey_data.station_list[onekey_data.current_animation_index].animation = animation.export()
    //更新动画，选项卡移出界面
    that.setData({
      onekey_data: onekey_data
    })
    that.data.onekey_data = onekey_data
    //隐藏当前滑动的选项卡
    that.oneKeyRemoveTopTab();
  },

  oneKeyRemoveTopTab: function() {
    var that = this
    var onekey_data = that.data.onekey_data
    //1.5s后隐藏当前滑动的选项卡
    onekey_data.station_list[onekey_data.current_animation_index].enable = false;
    onekey_data.station_list[onekey_data.current_animation_index].enableclass = "disable";
    setTimeout(function() {
      that.setData({
        onekey_data: onekey_data
      })
      onekey_data.current_animation_index--
        that.data.onekey_data = onekey_data
      that.onekeyTabsRender()
    }, 500)
  },

  onekeyTabsRender: function(fn) {
    var that = this
    var _index = 0;
    var _effective = 0; //有效选项卡数量
    var onekey_data = that.data.onekey_data;
    for (var i = 0; i < onekey_data.station_list.length; i++) {
      if (onekey_data.station_list[i].enable) {
        _effective++;
      }
    }

    //通过设置选项卡的width、top达到层叠效果(小程序css 3d转换的z轴不生效，所以不能通过css3的3d转换达到层叠效果)
    for (var i = 0; i < onekey_data.station_list.length; i++) {
      if (onekey_data.station_list[i].enable) {
        onekey_data.station_list[i].width = 80 - (_effective - 1 - _index) * 5
        onekey_data.station_list[i].top = (_effective - 1 - _index) * 10
        _index++
      }
    }
    that.data.onekey_data = onekey_data

    //如果选项卡全部关闭，则关闭一键加油弹框
    if (_effective == 0) {
      that.setData({
        onekey_data: that.data.onekey_data,
        show_pop_box: false
      })
    } else {
      that.setData({
        onekey_data: that.data.onekey_data
      })
    }

  },
  /**
   * 一键加油end
   */

  /**
   * 保存formid
   */
  formSubmit: function(e) {
    if (e.detail.formId) {
      app.saveFormId(e.detail.formId);
    }
  },

  /**
   * 点击油站列表事件
   */

  click_oilList_item: function(e) {
    if (e.currentTarget.dataset.id && !e.currentTarget.dataset.closetype) {
      wx.navigateTo({
        url: '../details/details?stationId=' + e.currentTarget.dataset.id,
      })
    } else {
      wx.showToast({
        title: '该油站暂不可用',
      })
    }
  },
  /**
   * 网络获取的banner图的点击事件
   */
  bannerClick: function(e) {

    console.log("bannerClick", e)
    if (e.currentTarget.dataset.url) {
      app.activityUrl = e.currentTarget.dataset.url;
    }
    if (app.activityUrl) {
      wx.navigateTo({
        url: '../web/web',
      })
    }
  },
  // 切换私家车tab
  click_private_car: function() {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    that.setData({
      toCommonCarType: 1,
      hasGetStation: false,
      state: '正在加载..',
    })
    app.getGasStation(app.stationListData.contryPriceList[that.data.countryPriceIndex].oilId, that.data.toCommonCarType, function() {
      wx.hideLoading();
      if (app.stationListData.stationList && app.stationListData.stationList.length != 0) {
        that.calc_distance();
        that.setData({
          stationListData: app.stationListData,
          hasGetStation: true,
          state: '已经全部加载完毕',

        });
      } else {
        that.setData({
          stationListData: app.stationListData,
          state: '已经全部加载完毕',
          hasGetStation: true,

        });
      }

    });
  },
  // 切换车队tab
  click_motorcade_car: function() {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    that.setData({
      toCommonCarType: 0,
      hasGetStation: false,
      state: '正在加载..'
    })
    app.getGasStation(app.stationListData.contryPriceList[that.data.countryPriceIndex].oilId, that.data.toCommonCarType, function() {
      wx.hideLoading();
      if (app.stationListData.stationList && app.stationListData.stationList.length != 0) {
        that.calc_distance();
        that.setData({
          stationListData: app.stationListData,
          hasGetStation: true,
          state: '已经全部加载完毕',

        });
      } else {
        that.setData({
          stationListData: app.stationListData,
          state: '已经全部加载完毕',
          hasGetStation: true,

        });
      }

    });
  },
  //获取屏幕宽度
  get_client_width: function() {
    this.setData({
      windowHeight: app.systemInfo.windowHeight
    })
  }
})

var scrollFlag = true;

var EARTH_RADIUS = 6378137.0;
var PI = Math.PI

function getRad(d) {
  return d * PI / 180.0;
}

function getFlatternDistance(lat1, lng1, lat2, lng2) {
  var f = getRad((lat1 + lat2) / 2);
  var g = getRad((lat1 - lat2) / 2);
  var l = getRad((lng1 - lng2) / 2);

  var sg = Math.sin(g);
  var sl = Math.sin(l);
  var sf = Math.sin(f);

  var s, c, w, r, d, h1, h2;
  var a = EARTH_RADIUS;
  var fl = 1 / 298.257;

  sg = sg * sg;
  sl = sl * sl;
  sf = sf * sf;

  s = sg * (1 - sl) + (1 - sf) * sl;
  c = (1 - sg) * (1 - sl) + sf * sl;

  w = Math.atan(Math.sqrt(s / c));
  r = Math.sqrt(s * c) / w;
  d = 2 * w * a;
  h1 = (3 * r - 1) / 2 / c;
  h2 = (3 * r + 1) / 2 / s;

  return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
}
//校验手机号
function checkMobile(phone) {
  if (!(/^1[0-9][0-9]\d{8}$/.test(phone))) {
    wx.hideLoading();
    wx.showModal({
      title: '提示',
      content: '请输入正确的手机号',
      showCancel: false
    })
    return false;
  }
  return true;
}