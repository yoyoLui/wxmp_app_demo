var city = require("../../utils/city.js");
var app = getApp();
var timer = 60;
var opt;
var station_qrcode;
// stationId=9697&&from_page=5&q=http%3A//dev.ejiayou.com/wxmp/view/wxCode.ac%3FqrId%3D10312%26appId%3Dgh_324686421cfb
//油枪页面登陆逻辑 
//从页面进来，有两种情况，
//当从小程序进来，参数在全局app中，从微信菜单栏进入，参数在链接上，
// 页面参数 from_page,stationId,q（需解码）
Page({
  data: {
    scanCode: {},
    buttonState: true,
    oilCode: "...",
    oilCodeIndex: "",
    mustDisabled: true,

    show_pop_box_stationAdvertDialog: false, //1、油站广告
    show_pop_box_alertNotifeContent: false, //2、扫码须知
    show_pop_box_login: false, //3、登录弹框 isNeedLogin
    show_pop_box_ticket: false, //4、送券弹框 couponAdvertDialog
    show_pop_box_zhifu: false, //5、选择支付方式  isNeedSelect
    show_pop_box_chedui: false, //6、 车队卡验证 isFleetUser
    show_pop_box_isNeedAlertDiscount: false, //7、尊敬的运营车司机提示  isNeedAlertDiscount

    show_pop_box_button_getUserInfo: false,
    show_pop_box_login_shoudong: false,
    show_pop_box_login_wx: false,

    disabled_input_gun: true,


    // 车队卡流程数据
    pullKeyBoard: false, //拉起键盘
    cityItemSelected: false, //城市被点击
    plateText: '粤', //车牌文本
    plateNumber: '', //号码
    NumIsRight: false, //号是否正确
    plateTextfilled: false, //车牌是否存在
    cityArr: city.city,
    animationData: {},
    currentItemId: '',
    bottom: '',
    openId: '',
    unionId: '',
    autoFocus: false,
    formId: '', //keyboard formId
    chedui_button_text: '验证车牌',

    // 手机号页面参数
    loginCode: "获取验证码",
    loginFlag: true,
    _lcode: "",
    lcode: "1",
    input_keybord_type: 'number',

    // 输入油枪绑定数据
    inputTxt: '',
    show_keybord_personal: false,

  },
  //获取定位
  getLocationHandle: function(fn) {
    var that = this;
    //获取定位
    if (!app.longitude || !app.latitude) {
      app.getLocation(function(ret) {
        if (ret == 1) {
          console.log("获取定位信息成功");
          if (fn) {
            fn();
          }
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
      })
    }else{
      if (fn) {
        fn();
      }
    }
  },
  page_enter_scanCode: function() {
    var that=this;
    // 微信公众号菜单栏进入
    if (opt.from_page == 5) {
      // opt.q ='http://api.ejiayou.com/wxmp/view/wxCode.ac?qrId=1004&appId=gh_8abe738e8e98';
      if (opt.stationId) {
        app.station_id = opt.stationId;
      }
      if (opt.q) {
        app.station_qrcode = opt.q;
        station_qrcode = opt.q;
      }

      wx.login({
        success: function(loginData) {
          app.loginData = loginData;
          console.log("登录成功");
          app.getOpenidAndSession_key(function() {
            // 无unionid,去获取用户信息，无userid或者phone,去引导注册
            if (!app.unionid) {
              //检测用户信息授权
              wx.getSetting({
                success: function(res) {
                  if (res.authSetting['scope.userInfo']) {
                    //获取用户信息
                    wx.getUserInfo({
                      success: function(userInfoData) {
                        console.log("获取用户信息成功", userInfoData);
                        app.userInfoData = userInfoData;
                        //解密
                        app.decodeEncrypt_data(function() {
                          if (!app.user_id || !app.user_phone) {
                            that.login_box();

                          } else {
                            if (opt.from_page && station_qrcode) {
                              app.scanCode(opt.from_page, station_qrcode, function() {
                                that.show_dialog_box();
                              })
                            }
                          }
                        })
                      },
                      fail: function(e) {
                        //拒绝用户信息授权
                        //做个判断，新用户还是老用户，老用户的话要回掉函数要scancode，新用户的话回掉函数是新user_id
                        wx.hideLoading();
                        that.setData({
                          show_pop_box_login_shoudong: true
                        });
                      }

                    })
                  } else {
                    //没有检测到用户信息授权


                    wx.hideLoading();
                    if (app.canIUse.getUserInfo) { //版本支持
                      that.setData({
                        show_pop_box_button_getUserInfo: true,
                      })
                    } else {

                      that.setData({
                        show_pop_box_login_shoudong: true,
                      })
                    }
                  }
                },
                fail: () => {

                }
              })

            } else {
              if (!app.user_id || !app.user_phone) {
                that.login_box();

              } else {
                if (opt.from_page && station_qrcode) {
                  app.scanCode(opt.from_page, station_qrcode, function() {
                    that.show_dialog_box();
                  })
                }
              }
            }
          })
        }
      })
    }

    // 从一键加油卡片进2，油站详情进3,stationid和q存在全局变量
    if (opt.from_page == 2 || opt.from_page == 3) {
      station_qrcode = app.station_qrcode;
      if (!app.user_id || !app.user_phone) {
        that.login_box();
      } else {
        if (app.station_id && station_qrcode) {
          app.scanCode(opt.from_page, station_qrcode, function() {
            that.show_dialog_box();
          })

        }

      }

    }
  },
  onLoad: function(option) {
    wx.showLoading({
      title: '加载中',
    })
    console.log('进入页面option=' + JSON.stringify(option));
    if (option) {
      opt = option;
      if (opt.q) {
        opt.q = unescape(opt.q)
      }
    }
    console.log('解码后opt=' + JSON.stringify(opt));
    var that = this;

    that.getLocationHandle(function() {
      that.page_enter_scanCode();
    })
  },
  //登录弹框
  login_box: function() {
    var that = this;
    console.log('需要授权登陆');
    wx.hideLoading();
    if (app.canIUse.getPhoneNumber && app.unionid) {
      that.setData({
        show_pop_box_login_wx: true
      });
    } else {
      that.setData({
        show_pop_box_login_shoudong: true
      });
    }
  },
  //点击获取用户信息
  click_getUserInfo: function(e) {

    var that = this;

    if (e.detail.iv) { //允许授权

      app.userInfoData = e.detail;
      app.userInfoFlag = true;
      app.decodeEncrypt_data(function() {
        that.setData({
          show_pop_box_button_getUserInfo: false,
        });
        if (!app.user_phone || !app.user_id) {
          that.login_box();
        } else {
          app.scanCode(opt.from_page, station_qrcode, function() {
            that.show_dialog_box();
          })
        }
      })
    } else { //拒绝授权
      wx.showModal({
        content: '拒绝授权无法支付',
        showCancel: false,
      })

    }

  },
  //一键注册手机号
  click_getPhoneNumber: function(e) {
    var that = this;
    that.setData({
      show_pop_box_login_wx: false,
    });
    if (e.detail.iv && e.detail.encryptedData) {
      // 解密手机号并且注册
      app.decodeEncrypt_data_yjsq(e.detail.encryptedData, e.detail.iv, function() {
        app.scanCode(opt.from_page, station_qrcode, function() {
          that.show_dialog_box();
        })
      });
    } else {
      wx.hideLoading();
      that.setData({
        show_pop_box_login_shoudong: true,
      });
    }
  },
  // 弹框注册手机号；
  login: function() {
    var that = this;
    that.setData({
      mustDisabled: false
    })
    setTimeout(function() {
      that.setData({
        mustDisabled: true
      })
    }, 1000)
    if (app.unionid) {
      app.login(that.data._lcode, that.data.phoneNumber, function() {
        app.scanCode(opt.from_page, station_qrcode, function() {
          that.setData({
            show_pop_box_login_shoudong: false,
          })
          that.show_dialog_box();
        })
      });
    } else {
      app.login_2(that.data._lcode, that.data.phoneNumber, function() {
        app.scanCode(opt.from_page, station_qrcode, function() {
          that.setData({
            show_pop_box_login_shoudong: false,
          })
          that.show_dialog_box();
        })
      })
    }


  },
  getPhone: function(e) {
    var that = this;
    that.setData({
      phoneNumber: e.detail.value
    })
  },
  getCode: function(e) {
    var that = this;
    that.setData({
      _lcode: e.detail.value
    })
  },
  sendCode: function() {
    var that = this;
    if (that.data.loginFlag && checkMobile(that.data.phoneNumber)) {
      console.log(that.data.phoneNumber);
      app.loginCode(that.data.phoneNumber, function(code) {

        that.setData({
          lcode: code
        })
      });
      var time = 60;
      that.setData({
        loginCode: time + "秒后重发",
        loginFlag: false
      })

      var timer = setInterval(function() {
        time--;
        if (time == 0) {
          that.setData({
            loginCode: "获取验证码",
            loginFlag: true
          })
          clearInterval(timer);
        } else {
          that.setData({
            loginCode: time + "秒后重发"
          })
        }
      }, 1000);
    }
  },
  //扫码接口1后的弹框逻辑
  show_dialog_box: function() {
    var that = this;
    that.setData({
      scanCode: app.code,
      disabled_input_gun: false
    })
    app.payAdvertDialog = app.code.payAdvertDialog;
    wx.setNavigationBarTitle({
      title: app.code.fillingStationName
    })
    that.deal_with_dialog();
  },
  // 东光加油站身份认证
  show_identify_dg: function() {
    //需要等待
    if (app.code.wechatVo.promptType == 2) {
      wx.showModal({
        content: '审核中，请耐心等待',
        confirmText: '确定',
        confirmColor: '#f93',
        cancelColor: '#c3c3c3',
        cancelText: '取消',
        showCancel: false,
        success: function(res) {
          if (res.confirm) {
            wx.redirectTo({
              url: "../index/index",
            })
          } else {

          }

        },
        fail: function() {

        }
      })
      return true;
    }
    //需要认证
    if (app.code.wechatVo.promptType == 1) {
      wx.showModal({
        content: '本站暂不支持私家车。认证为营运车车主，即可享受专属优惠',
        confirmText: '前往认证',
        confirmColor: '#f93',
        cancelColor: '#c3c3c3',
        cancelText: '取消',
        success: function(res) {
          if (res.confirm) {
            wx.redirectTo({
              url: "../web_H5/identify_private_car/index",
            })
          } else {
            wx.redirectTo({
              url: "../index/index",
            })
          }
        },
        fail: function() {

        }
      })
      return true;
    }
    return false;
  },
  deal_with_dialog: function() {
    var that = this;
    that.setData({
      show_pop_box_stationAdvertDialog: true, //1、油站广告
    });

    //1、stationAdvertDialog 	油站广告
    if (app.code.stationAdvertDialog) {
      that.setData({
        show_pop_box_stationAdvertDialog: true,
      })
    } else {
      //2、扫码须知弹框isNeedAlertNotife，，提示确认是否在专车、货车等营运车辆，才能在本油站进行扫码支付，并享受优惠价
      if (app.code.wechatVo && app.code.wechatVo.isNeedAlertNotife) {
        if (!that.show_identify_dg()) {
          that.setData({
            show_pop_box_alertNotifeContent: true,
          })
        }

      } else {
        //4、送券弹框 couponAdvertDialog
        if (app.code.couponAdvertDialog && app.code.couponAdvertDialog.couponList) {
          app.code.couponAdvertDialog.couponList.forEach(function(obj, i) {
            if (obj.discount && obj.value) {
              obj['value1'] = obj.value.split('.')[0];
              obj['value2'] = obj.value.split('.')[1];
            }
          })
          that.setData({
            show_pop_box_ticket: true,
          })
        } else {
          //5、选择支付方式  isNeedSelect
          if (app.code.paySelectObject && app.code.paySelectObject.isShowDialog) {
            that.setData({
              show_pop_box_zhifu: true,
            })
          } else {
            app.pay_type = app.code.paySelectObject.paymentList[0].payTypeId;
            app.paytype_is_moren = true;
          }
        }
      }
    }
    //3、登录弹框 isNeedLogin
    //6、 车队卡验证 isFleetUser
    //7、尊敬的运营车司机提示  isNeedAlertDiscount
    if (app.code.isNeedPrompt) {

    }
  },


  // 1
  close_pop_box_stationAdvertDialog: function() {
    var that = this;
    that.setData({
      show_pop_box_stationAdvertDialog: false,
    })
    //2、扫码须知弹框isNeedAlertNotife，，提示确认是否在专车、货车等营运车辆，才能在本油站进行扫码支付，并享受优惠价
    if (app.code.wechatVo && app.code.wechatVo.isNeedAlertNotife) {
      if (!that.show_identify_dg()) {
        that.setData({
          show_pop_box_alertNotifeContent: true,
        })
      }
    } else {
      //4、送券弹框 couponAdvertDialog
      if (app.code.couponAdvertDialog && app.code.couponAdvertDialog.couponList) {
        that.data.scanCode.couponAdvertDialog.couponList.forEach(function(obj, i) {
          if (obj.discount && obj.value) {
            obj['value1'] = obj.value.split('.')[0];
            obj['value2'] = obj.value.split('.')[1];
          }
        })
        that.setData({
          show_pop_box_ticket: true,
        })
      } else {
        //5、选择支付方式  isNeedSelect
        if (app.code.paySelectObject && app.code.paySelectObject.isShowDialog) {
          that.setData({
            show_pop_box_zhifu: true,
          })
        } else {
          app.pay_type = app.code.paySelectObject.paymentList[0].payTypeId;
          app.paytype_is_moren = true;
        }
      }
    }
  },
  // 2,
  close_pop_box_alertNotifeContent: function() {
    var that = this;
    that.setData({
      show_pop_box_alertNotifeContent: false,
    })
    wx.redirectTo({
      url: '../index/index',
    })
  },
  // 4\
  close_pop_box_ticket: function() {
    var that = this;
    that.setData({
      show_pop_box_ticket: false,
    })
    //5、选择支付方式  isNeedSelect
    if (app.code.paySelectObject && app.code.paySelectObject.isShowDialog) {
      that.setData({
        show_pop_box_zhifu: true,
      })
    } else {
      app.pay_type = app.code.paySelectObject.paymentList[0].payTypeId;
      app.paytype_is_moren = true;
    }
  },


  // 点击油枪输入
  click_input_gun_box: function() {
    var that = this;
    if (!that.disabled_input_gun) {
      that.setData({
        show_keybord_personal: !that.data.show_keybord_personal
      })
    }

  },
  //系统自带，输入油枪方法
  getGunValue_system: function(e) {
    var that = this;
    if (e.detail.value == "") {
      that.setData({
        buttonState: true,
        oilCode: "..."
      })
      return false;
    } else {
      if (that.data.scanCode.oilGunInfos.length) {
        for (var i = 0; i < that.data.scanCode.oilGunInfos.length; i++) {
          if (e.detail.value == that.data.scanCode.oilGunInfos[i].oilgunCode) {
            //选择的油枪信息
            app.selectOilInfo = that.data.scanCode.oilGunInfos[i];
            that.setData({
              buttonState: false,
              oilCode: that.data.scanCode.oilGunInfos[i].oilName,
              oilCodeIndex: i,
              oilId: that.data.scanCode.oilGunInfos[i].oilId
            })
            console.log(that.data.scanCode.oilGunInfos[i])
            return;
          }
        }
      }

    }
    that.setData({
      oilCode: "油枪错误",
      buttonState: true
    })
  },

  //输入油枪方法
  getGunValue: function(v) {
    var that = this;
    if (v == "") {
      that.setData({
        buttonState: true,
        oilCode: "..."
      })
      return false;
    } else {
      if (that.data.scanCode.oilGunInfos.length) {
        for (var i = 0; i < that.data.scanCode.oilGunInfos.length; i++) {
          if (v == that.data.scanCode.oilGunInfos[i].oilgunCode) {
            //选择的油枪信息
            app.selectOilInfo = that.data.scanCode.oilGunInfos[i];
            that.setData({
              buttonState: false,
              oilCode: that.data.scanCode.oilGunInfos[i].oilName,
              oilCodeIndex: i,
              oilId: that.data.scanCode.oilGunInfos[i].oilId
            })
            console.log(that.data.scanCode.oilGunInfos[i])
            return;
          }
        }
      }

    }
    that.setData({
      oilCode: "油枪错误",
      buttonState: true
    })
  },

  //跳转支付页面
  toPay: function() {
    var that = this;
    //老用户跳转支付
    // 调用第二个支付接口，，因为圆钢加油站的油枪号可以知道金额
    wx.showLoading({
      title: '跳转中',
    })
    var stid = app.station_id || opt.stationId;
    app.forPayInfo(that.data.oilId, app.pay_type, opt.from_page, stid, function() {
      wx.hideLoading();
      wx.navigateTo({
        url: "../pay/pay?index=" + that.data.oilCodeIndex + "&stationId=" + opt.stationId + "&oilId=" + that.data.oilId
      })

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

  click_payList_item: function(e) {
    if (e.currentTarget.dataset.state == 0) {
      return;
    }
    var that = this;
    that.setData({
      payType: e.currentTarget.dataset.id,
      show_pop_box_zhifu: false,
      disabled_input_gun: false,
    });

    app.pay_type = that.data.payType;

    app.showToast('您已选择' + e.currentTarget.dataset.name, that, 1000);
    if (e.currentTarget.dataset.id == 20) { //车队卡
      that.setData({
        show_pop_box_chedui: true
      })
    }

  },
  // 选择车队卡支付方式流程逻辑
  //键盘的收起和拉起,flag=true拉起
  keyBoardMove: function(openKeyBoard, fun) {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: "ease",
      delay: 0
    });
    if (openKeyBoard) {
      this.setData({
        bottom: 'bottom:-472rpx',
        pullKeyBoard: true,
      });
      animation.bottom(0).step();
      this.setData({
        animationData: animation.export()
      });
      if (fun) {
        fun();
      }
    } else {
      this.setData({
        pullKeyBoard: false,
      });
      if (fun) {
        fun();
      }
    }
  },
  selectItemById: function(id, fun) {
    var that = this;
    var cityArr = that.data.cityArr;
    cityArr.forEach(function(obj, i) {
      if (parseInt(obj.id) == parseInt(id)) {
        return fun(obj);
      }
    });
  },
  //点击车牌
  inputPlateFocusFun: function() {
    this.keyBoardMove(true);
  },
  //点击号码
  plateNumFocus: function() {
    var that = this;
    that.keyBoardMove(false);
  },
  //点击城市键盘
  cityItemClick: function(e) {
    var that = this;
    this.setData({
      currentItemId: e.currentTarget.dataset.num
    })
    that.selectItemById(e.currentTarget.id, function(item) {
      that.setData({
        plateText: item.city,
        plateTextfilled: true,
        currentItemId: e.currentTarget.id,
        autoFocus: true
      });
      that.keyBoardMove(false);
    });
  },
  //点击button
  buttonClick: function(res) {
    var that = this;
    if (that.data.plateTextfilled && that.data.NumIsRight) {
      that.setData({
        chedui_button_text: '验证中..'
      });
      var chepai = that.data.plateText + that.data.plateNumber;
      app.checkNum(chepai, function(res) {
        if (!res) {
          app.showToast('该车牌不属于车队', that, 1000);
          that.setData({
            chedui_button_text: '验证车牌'
          });
        } else {
          that.setData({
            show_pop_box_chedui: false
          })
          app.showToast('验证成功', that, 1000);
          app.car_cheduika_chepai = chepai;
        }
      })
    } else {
      app.showToast('请输入正确的车牌号', this, 1000);
    }
  },

  //去除空格，非法字符，转换大写
  filterFun: function(str) {
    str = str.replace(/(^\s+)|(\s+$)/g, "");
    str = str.toUpperCase();
    var arr = str.split('');
    var express1 = /^[A-Z]$/;
    var express2 = /^[A-Z0-9]{1}$/;
    var outStr;
    for (var i = 0; i < arr.length; i++) {

      if (i == 0 && !express1.test(arr[i])) {
        arr[i] = '';
      } else if (i != 0 && !express2.test(arr[i])) {
        arr[i] = '';
      }
    }
    outStr = arr.join('');
    return outStr;
  },
  //输入车牌号码
  plateNumInput: function(e) {
    var that = this;
    var express = /^[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/;
    var num = that.filterFun(e.detail.value);

    if (num.length > 5) {
      var temp = express.exec(num);
      if (temp) {
        num = temp[0];
        that.setData({
          NumIsRight: true, //号码正确
          plateNumber: num,

        });

      } else {
        app.showToast('请输入正确的车牌号', this, 1000);
        that.setData({
          NumIsRight: false
        })
      }
    } else {
      that.setData({
        NumIsRight: false,
      })
    }
    return num;
  },
  chedui_tiaoguo: function() {
    this.setData({
      show_pop_box_chedui: false,
      show_pop_box_zhifu: true,

      //初始化车队卡流程数据
      pullKeyBoard: false, //拉起键盘
      cityItemSelected: false, //城市被点击
      plateText: '粤', //车牌文本
      plateNumber: '', //号码
      NumIsRight: false, //号是否正确
      plateTextfilled: false, //车牌是否存在
      animationData: {},
      currentItemId: '',
      bottom: '',
      autoFocus: false,
      formId: '', //keyboard formId
      chedui_button_text: '验证车牌',
    });
  },
  formSubmit: function(e) {
    if (e.detail.formId) {

      app.saveFormId(e.detail.formId);
    }
  },
  //点击自定义键盘-键字
  click_personal_keybord: function(e) {
    // || that.disabled_input_gun
    var that = this;
    if (!e.currentTarget.dataset.value) return;
    that.setData({
      inputTxt: that.data.inputTxt + e.currentTarget.dataset.value
    });
    that.getGunValue(that.data.inputTxt);
  },

  //点击自定义键盘-横杠
  click_personal_dash: function() {
    var that = this;
    that.setData({
      inputTxt: that.data.inputTxt + '-'
    });
    that.getGunValue(that.data.inputTxt);
  },

  //点击自定义键盘-删除
  click_personal_keybord_del: function() {
    var that = this;
    var len = that.data.inputTxt.length;
    if (len > 0) {
      that.setData({
        inputTxt: that.data.inputTxt.substr(0, that.data.inputTxt.length - 1)
      });
      that.getGunValue(that.data.inputTxt);
    }
  },
  //关闭自定义键盘
  close_keybord_personal: function() {
    this.setData({
      show_keybord_personal: false
    })
  },
  onShow: function() {
    var that=this;
    if (app.getLocationFlag == 1) { //从设置页回来
      //重新获取定位经纬度
      app.getLocation(function(ret) {
        if (ret == false) { //还是没有拿到定位
          //先检查缓存油站列表是否有，没有再去请求新油站数据
          app.longitude = 114.059380;
          app.latitude = 22.546770;
          that.page_enter_scanCode();
        } else if (ret == 1) {
          //拿到了定位
          that.page_enter_scanCode();
        } else if (ret == 2) {
          wx.showModal({
            content: '未获取到您的地理位置，暂时无法为你提供服务。请检查是否已关闭定位权限，或尝试重新打开“易加油”小程序',
            showCancel: false,
            confirmText: '好的'
          })
        }

      })
    }
  },
  onPullDownRefresh: function() {
    wx.stopPullDownRefresh();
  }
})

function checkMobile(phone) {
  if (!(/^1[0-9][0-9]\d{8}$/.test(phone))) {
    wx.showModal({
      title: '提示',
      content: '请输入正确的手机号'
    })
    return false;
  }
  return true;
}