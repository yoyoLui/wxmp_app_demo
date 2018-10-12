var util = require("utils/util.js");
var aes = require('utils/AES/aesUtils.js'); //Decrypt,Encrypt
var os_type = '5';
var server = 'dev.ejiayou.com';
var server = 'api.ejiayou.com';
var saveFormId_url = 'https://www.ejiayou.com/activity/api/mini_app/save_form_id';
App({
  onLaunch: function (option) {
    console.log('onlaunch', option)
    var that = this;

    that.scene = option.scene;
    that.getWindowInfo(function (res) {
      // console.log('系统信息', that.systemInfo);
    });
    that.updateMiniProgram();
    // option.referrerInfo = {
    //   extraData: {
    //     phone: 13823507027,
    //     stationId: 53
    //   }
    // }
    if (option.referrerInfo) {
      that.referrerInfo = option.referrerInfo.extraData
    }
  },
  updateMiniProgram: function () {
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
          })
        }
      })
    } else {
      // 1.9.90 
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法自动更新，请升级到最新微信版本后重试。'
      })
    }
  },
  onShow: function () {

  },
  onHide: function () { },
  server: server,
  appid: 'wx115b13ee3613ef26',
  canIUse: {
    getUserInfo: wx.canIUse('button.open-type.getUserInfo'),
    getPhoneNumber: wx.canIUse('button.open-type.getPhoneNumber'),
  },

  port: (function (protocol) {
    return {
      getOpenidAndSession_key: "https://" + protocol + "/oreo/openapi/v1/min_pro/session_and_openid/",
      decodeEncrypt_data: "https://" + protocol + "/oreo/openapi/v1/min_pro/decode_dec",
      getGasStation: "https://" + protocol + "/v1/station/stationListV6.do",
      getHomePic: "https://" + protocol + "/activity/service/app_banner/get_banner",
      getDetails: "https://" + protocol + "/v1/station/someStationInfoV2.do",
      scanCode: "https://" + protocol + "/oreo/openapi/scanCode/forPaySelect/v1",
      forPayInfo: "https://" + protocol + "/oreo/openapi/scanCode/forPayInfo/v2",
      loginCode: "https://" + protocol + "/oreo/rs/sms/send/v2/ap/",

      // 1解密手机号
      phone_dec: "https://" + protocol + '/oreo/openapi/v1/min_pro/phone_dec',
      login_weapp: "https://" + protocol + '/oreo/openapi/v1/min_pro/login/jphone',

      //2unionid手机号验证码登录
      login: "https://" + protocol + '/oreo/openapi/v1/min_pro/login/phone',

      //3\手机号验证码登录  ,openid
      login2: "https://" + protocol + '/oreo/openapi/v1/min_pro/login/phone',

      checkNum: "https://" + protocol + "/v1/fleet/checkNum.do", //验证车牌

      //获取发票  https://dev.ejiayou.com/v1/userInvoice/userInvoiceOper.do
      invoiceList: "https://" + protocol + "/v1/userInvoice/userInvoiceOper.do",
      //支付页面获取支付方式
      getPayWay: "https://" + protocol + "/oreo/openapi/payment/type/v1/",
      //创建订单
      newCreateOrder: "https://" + protocol + "/oreo/openapi/order/create/v1/",
      //油卡支付
      oilCardPay: "https://" + protocol + "/oreo/openapi/epay_order/v1/",
      //用户是否设置了密码
      checkUserPaymentState: "https://" + protocol + "/oreo/openapi/checkUserPaymentState/v1/",
      //设置密码
      updatePassWord: "https://" + protocol + "/oreo/openapi/updatePassWord/v1",
      //身份审核
      checkIdCard: "https://" + protocol + "/oreo/openapi/checkIdCard/v1",
      //支付完活动 /activity/popupapi/popup
      popupapi: "https://" + protocol + "/activity/popupapi/popup",
      //一键加油
      onekey: "https://" + protocol + "/oreo/openapi/quick_fueling/v1",
      //获取评论数据
      getEvaluateInfo: "https://" + protocol + "/v1/comment/getEvaluateInfo_v2.do",
      //提交评论
      commitEvaluation: "https://" + protocol + "/v1/evaluate/commitEvaluation.do",
      //获取其他评价数据
      getAllCommentList: "https://" + protocol + "/v1/comment/getAllCommentList.do",
      //获取油站评论
      getDetailsEvaluate: "https://" + protocol + "/v1/evaluate/evaluateStickyListV2.do",
      //获取油站评论评分
      getStationGrade: "https://" + protocol + "/v1/station/stationGrade.do",
      //全部评论连接
      getEvaluates: "https://" + protocol + "/wxmp/view/getEvaluates.ac",
      // 获取身份注册类型
      get_register_type: "https://" + protocol + "/oreo/openapi/register/type/",
      //提交审核资料接口
      submit_identity: "https://" + protocol + "/oreo/openapi/user/account/identity/v3/",
      //58获取用户账号
      get_userInfo_58: "https://" + protocol + "/oreo/openapi/wb/identity/v1/"
    }
  })(server),
  invoiceList: {
    data: [],
    nowSelect: "un",
    nowOption: "un",
    selectFc: "selectInvoice"
  },
  editInvoice: null,
  ticketList: {
    couponInfoToExPayList: [],
    nowSelect: "",
    inputNum: '',
    userSelect: false,
    avlCouponNum: 0,
    invalidCouponNum: 0
  },
  userCommentStar: 0,
  loginFlag: false,
  noInvoice: false,
  getWindowInfo: function (fn) { //请求系统信息
    var that = this;
    wx.getSystemInfo({
      success: function (e) {
        that.systemInfo = e;
        // console.log("获取systemInfo成功");
        if (fn) {
          fn();
        }
      },
      fail: function () {
        wx.showModal({
          showCancel: false,
          title: '错误',
          content: '获取系统信息失败'
        })
      }
    });
  },
  //自定义toast  
  showToast: function (text, o, count) {
    text = text.replace("\"", "").replace("\"", "").replace("\'", "").replace("\'", "");
    var _this = o;
    count = parseInt(count) ? parseInt(count) : 3000;
    _this.setData({
      toastData: {
        toastText: text,
        isShowToast: true,
      }
    });
    setTimeout(function () {
      _this.setData({
        toastData: {
          isShowToast: false
        }
      });
    }, count);
  },

  getOpenidAndSession_key: function (fn) { //请求Openid And Session_key//数据放在APP
    var that = this;
    console.log('code=' + that.loginData.code);
    console.log(that.port.getOpenidAndSession_key + that.loginData.code)
    wx.request({
      method: "GET",
      url: that.port.getOpenidAndSession_key + that.loginData.code,
      data: {},
      success: function (res20) {
        if (res20.data && res20.data.code == 200) {
          res20 = res20.data;
          console.log("OpenidAndSession_key", res20);
          console.log("获取OpenidAndSession_key成功");
          that.session_key = res20.data.session_key;
          that.openid = res20.data.openid;
          that.unionid = res20.data.unionid;
          that.car_type = res20.data.carType;
          that.user_id = res20.data.userId;
          that.user_phone = res20.data.phone;
          if (fn) {
            fn();
          }
        } else {
          wx.showModal({
            showCancel: false,
            title: '错误',
            content: res20.msg ? res20.msg : '系统异常，解码错误'
          })
        }
      }
    })
  },
  decodeEncrypt_data: function (fn) { //解密Encrypt_data//数据放在APP
    var that = this;
    wx.request({
      method: "POST",
      url: that.port.decodeEncrypt_data,
      data: {
        encryptedData: that.userInfoData.encryptedData,
        sessionKey: that.session_key,
        iv: that.userInfoData.iv
      },
      success: function (res21) {
        console.log('解密用户信息res=' + JSON.stringify(res21));
        if (res21.data) {
          res21 = res21.data
          if (res21.code == 200) {
            console.log("解密Encrypt_data成功");
            console.log(res21)
            that.user_id = res21.data.userId;
            that.car_type = res21.data.carType;
            that.user_phone = res21.data.phone;
            that.unionid = res21.data.unionId;
            if (!that._user_id) {
              that.car_type = 1
            }
            if (fn) {
              fn();
            }
          } else {
            wx.showModal({
              showCancel: false,
              title: '解密Encrypt_data错误',
              content: res21.msg
            })
          }
        } else {
          wx.showModal({
            showCancel: false,
            content: '解密Encrypt_data错误',
          })
        }

      },
      fail: function () {
        wx.showModal({
          showCancel: false,
          title: '错误',
          content: "解密Encrypt_data错误"
        })
      }
    });
  },

  getLocation: function (fn) { //获取当前坐标//数据放在APP
    var that = this;
    wx.getLocation({
      type: "gcj02",
      success: function (res) {
        console.log("获得当前坐标成功");
        console.log(JSON.stringify(res))
        var location = util.gcj02tobd09(res.longitude, res.latitude)
        console.log("坐标转换后：");
        console.log(location)
        that.latitude = location[1]
        that.longitude = location[0]
        that.speed = res.speed
        that.accuracy = res.accuracy
        if (fn) {
          fn(1);
        }

      },
      fail: function (res) {
        console.log("获取定位失败");

        if (res.errMsg == 'getLocation:fail 1') {
          if (fn) {
            fn(2); //没有打开系统定位，点击允许，结果没有打开系统定位
          }
        } else {
          if (fn) {
            fn(false);
          }
        }

      }
    })
  },
  getGasStation: function (oil_id, to_common_car_type, fn) { //获取油站列表//数据放在APP
    var that = this;
    var uid = that.user_id ? that.user_id : 1;
    var cartype = that.car_type ? that.car_type : 1;
    var sss = {
      oilId: oil_id,
      carType: cartype,
      version: that.systemInfo.version,
      longitude: String(that.longitude),
      latitude: String(that.latitude),
      nextPage: 1,
      osType: os_type,
      userId: uid,
      versionId: that.systemInfo.version,
      telephone: that.user_phone ? that.user_phone : '1',
      toCommonCarType: to_common_car_type, //切换成普通身份模式（相对车队身份有效) 0为车队模式，1为普通模式
    }
    wx.request({
      method: "POST",
      url: that.port.getGasStation,
      data: sss,
      header: {
        "Content-type": "application/x-www-form-urlencoded"
      },
      success: function (res17) {
        if (!res17.data) {
          wx.showModal({
            content: '系统异常，获取油站信息错误',
            showCancel: false
          })
          return;
        }
        res17 = res17.data
        if (res17.code == 200) {
          wx.hideLoading();
          that.stationListData = res17.data;
          console.log(that.stationListData);
          if (fn) {
            fn();
          }
        } else {
          wx.showModal({
            showCancel: false,
            title: '获取油站列表错误',
            content: res17.message
          })
        }
      }
    });
  },
  getHomePic: function (fn) { //获取首页轮播图//数据在回调
    var that = this;
    var sid = that.stationListData ? that.stationListData.stationList[0].stationId : '53'
    wx.request({
      method: "GET",
      url: that.port.getHomePic,
      data: {
        carType: that.car_type ? that.car_type : 1,
        stationId: sid,
        osType: os_type,

      },
      success: function (res19) {
        res19 = res19.data
        if (res19.code == 200) {
          if (fn) {
            fn(res19.data);
            console.log('PIC', res19.data);
          }
        } else {
          wx.showModal({
            showCancel: false,
            title: '获取首页轮播图错误',
            content: res19.msg
          })
        }
      }
    });
  },
  getDetails: function (stationId, fn) { //获取油站详情//数据在回调
    var that = this;
    var uid = that.user_id ? that.user_id : 1;
    var ctype = that.car_type ? that.car_type : 1;
    wx.request({
      method: "GET",
      url: that.port.getDetails,
      data: {
        carType: ctype,
        userId: uid,
        stationId: stationId,
        versionBuild: that.systemInfo.version,
        versionId: that.systemInfo.version,
        telephone: that.user_phone ? that.user_phone : '',
        osType: os_type,
        toCommonCarType: 1
      },
      success: function (res18) {
        res18 = res18.data;
        if (res18.code == 200) {
          that.station_id = stationId;
          that.stationQRCode = res18.data.stationQRCode;
          console.log('获取油站详情成功');
          if (fn) {
            fn(res18.data);
          }
        } else {
          wx.showModal({
            showCancel: false,
            title: '获取油站详情错误',
            content: res18.msg
          })
        }
      }
    })
  },
  scanCode: function (from_source, code, fn) { //扫码接口//数据放在APP
    var that = this;
    var parmas = {
      fromSource: from_source,
      osType: os_type,
      userId: that.user_id,
      version: that.systemInfo.version,
      latitude: that.latitude,
      longitude: that.longitude,
      qrCode: code
    }
    console.log('扫码1参数' + JSON.stringify(parmas));
    wx.request({
      method: "POST",
      url: that.port.scanCode,
      data: parmas,
      success: function (res26) {
        wx.hideLoading();
        if (!res26.data) {
          wx.showModal({
            content: '系统异常，扫码错误',
            showCancel: false
          })
          return;
        }
        res26 = res26.data;
        if (res26.code == 200) {
          console.log('扫码成功');
          console.log(res26)

          // that.code = {
          //   "fillingStationName": "元岗加油站",
          //   "stationId": 10229,
          //   "stationPicUrl": "https://img.ejiayou.com/uploadPic/Image/2017/08/1503974694172.jpg",
          //   "oilgunPanelStationPic": "https://img.ejiayou.com/uploadPic/Image/2017/08/1503974694172.jpg",
          //   "confirmPayPanelStationPic": "https://img.ejiayou.com/uploadPic/Image/2017/08/1503974694172.jpg",
          //   "promptContent": "在您附近发现2个易加油油站，请务必和加油员核实您现在是否在:",
          //   // "stationAdvertDialog": null,
          //   // "stationAdvertDialog": {
          //   //   "title": "本站通知",
          //   //   "content": { "1": "广告文案春眠不觉晓，", "2": "处处闻呃呃呃顶顶顶顶顶顶顶顶呃呃呃呃呃呃呃呃呃呃呃呃啼鸟。" },
          //   //   "keyWords": [{ "keyWord": "鸟", "color": "008B00" }, { "keyWord": "春眠", "color": "FF0000" }],
          //   //   "img": "0"
          //   // },
          //   "payAdvertDialog": null,
          //   "errorCode": 0,
          //   "paySelectObject": {
          //     "isShowDialog": true,
          //     "notice": "请根据油卡余额选择本次加油的支付方式",
          //     "title": "请选择支付方式",
          //     "paymentList": [{
          //         "balance": "49937.37",
          //         "name": "车队卡",
          //         "payTypeId": 20,
          //         "state": 1
          //       },
          //       {
          //         "balance": "49937.37",
          //         "name": "三周年纪念卡",
          //         "payTypeId": 21,
          //         "state": 0
          //       },
          //       {
          //         "balance": "49937.37",
          //         "name": "微信支付/支付宝",
          //         "payTypeId": 0,
          //         "state": 1
          //       }
          //     ]
          //   },
          //   "oilGunAmounts": [{
          //       "oilgunCode": "10",
          //       "originalOrderSum": "200.00"
          //     },
          //     {
          //       "oilgunCode": "12",
          //       "originalOrderSum": ""
          //     }
          //   ],
          //   "oilGunInfos": [{
          //       "oilgunCode": "1",
          //       "oilName": "98#",
          //       "oilId": 1,
          //       "oilgunId": 1
          //     },
          //     {
          //       "oilgunCode": "2",
          //       "oilName": "95#",
          //       "oilId": 2,
          //       "oilgunId": 2
          //     },
          //     {
          //       "oilgunCode": "3",
          //       "oilName": "92#",
          //       "oilId": 3,
          //       "oilgunId": 3
          //     }
          //   ],
          //   "oneKilometersHaveMoreStation": true,
          //   "isNeedPrompt": true,
          //   "wechatVo": {
          //     "alertNotifeContent": "转快车，营运车才能在本站扫码支付",
          //     "alertPlatformName": "",
          //     "isNeedAlertDiscount": false,
          //     "isNeedAlertNotife": true,
          //     "isNeedLogin": false,
          //     "payWeiXin": true,
          //     //东关加油站需要字段
          //     // "promptType":2, // 1 表示需要认证  2 表示需要等待 

          //   },
          //   "couponAdvertDialog": {
          //     "titleUrl": "https://img.ejiayou.com/uploadPic/Image/2018/05/1526281182402.jpg",
          //     "tailUrl": "https://img.ejiayou.com/uploadPic/Image/2018/05/1526281461308.jpg",
          //     "backgroundColor": "#FF0000",
          //     "couponList": [{
          //       "couponType": 1,
          //       "limitPay": "满50元可用",
          //       "value": "10",
          //       "num": 1,
          //       "discount": false
          //     }, {
          //       "couponType": 3,
          //       "limitPay": null,
          //       "value": "13",
          //       "num": 2,
          //       "discount": false
          //     }, {
          //       "couponType": 1,
          //       "limitPay": "最高抵扣200元",
          //       "value": "0.9",
          //       "num": 1,
          //       "discount": true
          //     }]
          //   },

          // }
          // res26.data.limitPrivateCar=2;

          if (res26.data.limitPrivateCar >= 1) { //不支持私家车
            wx.redirectTo({
              url: '../identity_registration/not_support_identity/index?limitPrivateCar=' + res26.data.limitPrivateCar,
            })
          } else { //正常支付
            that.code = res26.data;

            if (fn) {
              fn();
            }
          }

        } else {
          wx.showModal({
            title: '',
            content: res26.msg,
            showCancel: false,
            success: function () {
              wx.redirectTo({
                url: '../index/index',
              })
            }
          })
        }
      }
    })
  },
  forPayInfo: function (oilId, payType, from_source, stationId, fn) {

    var that = this;
    var parms = {
      oilId: oilId,
      payType: payType,
      fromSource: from_source,
      stationId: stationId,
      userId: that.user_id,
      version: that.systemInfo.version,
      osType: os_type,
      userPhoneSerial: "",
    };

    console.log('扫码2parmas', parms);
    wx.request({
      method: "POST",
      url: that.port.forPayInfo,
      data: parms,
      success: function (res226) {
        if (!res226.data) {
          wx.showModal({
            content: '系统异常，扫码2错误',
            showCancel: false
          })
          return;
        }
        res226 = res226.data;
        console.log('支付2', res226);
        if (res226.code == 200) {
          that.forPayInfo_data = res226.data;
          console.log(that.forPayInfo_data);
          if (fn) {
            fn();
          }
        } else {
          wx.showModal({
            title: '',
            content: res226.msg,
            showCancel: false,

          })
        }
      }
    })
  },

  loginCode: function (phone, fn) { //获取验证码//数据在回调
    var that = this;
    var parmas = {
      phone: phone
    }
    parmas = aes.Encrypt(JSON.stringify(parmas));

    wx.request({
      method: "POST",
      url: that.port.loginCode + new Date().getTime(),
      data: parmas,
      header: {
        "Content-type": "application/json"
      },
      success: function (res23) {
        res23 = aes.Decrypt(res23.data);
        res23 = JSON.parse(res23);
        if (res23.code == 200) {
          console.log("获取验证码成功", res23);
          if (fn) {
            fn(res23.data.code)
          }
        } else {
          wx.showModal({
            content: res23.msg,
            showCancel: false
          })
        }
      }
    })
  },
  login_weapp: function (fn) {
    var that = this;
    var parmas = {
      phone: that.user_phone,
      unionId: that.unionid,
      openId: that.openid
    };
    console.log('weapp', parmas);
    parmas = aes.Encrypt(JSON.stringify(parmas));
    wx.request({
      method: "POST",
      url: that.port.login_weapp,
      data: parmas,
      success: function (res23) {
        res23 = aes.Decrypt(res23.data);
        res23 = JSON.parse(res23);
        console.log('一键授权', res23);
        if (res23.code == 200) {
          res23 = res23.data;
          if (res23.userId) {
            that.user_id = res23.userId;
          }
          if (res23.carTypes) {
            that.car_type = res23.carTypes
          }
          if (fn) {
            fn();
          }
        } else {
          wx.showModal({
            content: res23.msg,
            showCancel: false
          })
        }
      }
    })
  },
  decodeEncrypt_data_yjsq: function (en, iv, fn) { //一键授权获取手机号
    var that = this;
    wx.request({
      method: "POST",
      url: that.port.phone_dec,
      data: {
        encryptedData: en,
        iv: iv,
        sessionKey: that.session_key,
      },
      success: function (res2212) {
        if (!res2212.data) {
          wx.showModal({
            content: '系统异常，一键授权手机号解码错误',
            showCancel: false
          })
          return;
        }
        res2212 = res2212.data;
        console.log('一键注册手机号res=' + JSON.stringify(res2212));
        if (res2212.code == "200") {
          that.user_phone = res2212.data.purePhoneNumber;
          that.login_weapp(function () {
            if (fn) {
              fn();
            }
          });
        } else {
          wx.showModal({
            content: res2212.msg,
            showCancel: false
          })
        }
      },
      fail: function () {
        wx.showModal({
          showCancel: false,
          title: '错误',
          content: "解密Encrypt_data错误"
        })
      }
    });
  },
  login: function (code, phone, fn) {
    var that = this;
    var parmas = {
      code: code,
      phone: phone,
      openId: that.openid,
      unionId: that.unionid,
    }
    console.log('login2', parmas);
    parmas = aes.Encrypt(JSON.stringify(parmas));
    wx.request({
      method: "POST",
      url: that.port.login,
      data: parmas,
      success: function (res24) {
        res24 = aes.Decrypt(res24.data);
        res24 = JSON.parse(res24);
        console.log('手动注册手机号res=', res24);


        if (res24.code == 200) {
          that.car_type = res24.data.carTypes,
            that.user_id = res24.data.userId
          console.log(res24.data)
          if (fn) {
            fn()
          }
        }

      }
    })
  },
  login_2: function (code, phone, fn) {
    var that = this;
    var parmas = {
      code: code,
      phone: phone,
      openId: that.openid
    }
    console.log('login2', parmas);
    parmas = aes.Encrypt(JSON.stringify(parmas));
    wx.request({
      method: "POST",
      url: that.port.login2,
      data: parmas,
      success: function (res24) {
        res24 = aes.Decrypt(res24.data);
        res24 = JSON.parse(res24);

        console.log('手动注册手机号2res=' + JSON.stringify(res24));
        if (res24.code == 200) {
          if (res24.data.carTypes) {
            that.car_type = res24.data.carTypes;
          }
          that.user_id = res24.data.userId;

          console.log("登录2成功");
          if (fn) {
            fn()
          }
        }

      }
    })
  },


  checkNum: function (chepai, fn) {
    var that = this;
    wx.request({
      method: "POST",
      url: that.port.checkNum,
      data: {
        osType: os_type,
        userId: that.user_id,
        carNum: chepai
      },
      header: {
        "Content-type": "application/x-www-form-urlencoded"
      },
      success: function (res224) {
        res224 = res224.data;
        if (res224.code == 200) {
          if (fn) {
            fn(res224.data.isExist);
          }

        } else {
          wx.showModal({
            showCancel: false,
            title: '获取评论信息错误',
            content: res224.msg
          })
        }
      }
    })
  },

  /**
   * 发票
   */
  invoiceManager: function (params, fn) {
    var that = this;
    wx.request({
      url: that.port.invoiceList,
      method: 'GET',
      data: params,
      success: function (ret) {
        var json = JSON.parse(JSON.stringify(ret));
        if (json.statusCode == 200) {
          typeof fn == "function" && fn(json.data)
        }
      },
      fail: function (ret) {
        console.log("getInvoiceList接口失败：" + JSON.stringify(ret))
      }
    })
  },

  /**
   * 获取支付方式
   */
  getPayWay: function (uid, json, fn) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        wx.request({
          url: that.port.getPayWay + uid + "/" + res.version,
          method: "POST",
          data: json,
          header: {
            "Content-type": "application/json"
          },
          success: function (res) {
            var result = JSON.parse(JSON.stringify(res));
            console.log(JSON.stringify(result.statusCode))
            if (result.statusCode == 200) {
              typeof fn == "function" && fn(result.data)
            }
          },
          fail: function (res) {
            console.log("获取支付方式失败：" + JSON.stringify(res))
          }
        })
      },
    })
  },

  /**
   * 创建订单
   */
  newCreateOrder: function (uid, obj, fn) { //创建订单//数据在APP
    var that = this;
    console.log(obj);
    wx.getSystemInfo({
      success: function (res) {
        console.log(that.port.newCreateOrder + uid + "/" + res.version + "/" + os_type)
        wx.request({
          method: "POST",
          url: that.port.newCreateOrder + uid + "/" + res.version + "/" + os_type,
          data: obj,
          success: function (res) {
            console.log(JSON.parse(JSON.stringify(res)));
            var result = JSON.parse(JSON.stringify(res));
            if (result.statusCode == 200) {
              var data = result.data;
              if (data.code == 200) {
                console.log("创建订单成功");
                typeof fn == "function" && fn(data.data);
              } else {
                typeof fn == "function" && fn();
                wx.showModal({
                  showCancel: false,
                  title: '创建订单错误',
                  content: data.msg
                })
              }
            } else {
              wx.showModal({
                showCancel: false,
                title: '创建订单错误',
                content: res.msg
              })
              typeof fn == "function" && fn();
            }
          }
        })
      },
    })
  },

  /**
   * 油卡支付
   */
  oilCardPay: function (uid, obj, fn) {
    var that = this;
    wx.request({
      url: that.port.oilCardPay + uid,
      method: 'POST',
      data: obj,
      success: function (ret) {
        // console.log("oilCardPay接口成功：" + JSON.stringify(ret))
        var json = JSON.parse(JSON.stringify(ret));
        if (json.statusCode == 200) {
          typeof fn == "function" && fn(json.data)
        }
      },
      fail: function (ret) {
        console.log("oilCardPay接口失败：" + JSON.stringify(ret))
      }
    })
  },

  /**
   * 用户是否设置了密码checkUserPaymentState
   */
  checkUserPaymentState: function (uid, fn) {
    var that = this;
    wx.request({
      url: that.port.checkUserPaymentState + uid,
      method: 'GET',
      success: function (ret) {
        // console.log("checkUserPaymentState接口成功：" + JSON.stringify(ret))
        var json = JSON.parse(JSON.stringify(ret));
        if (json.statusCode == 200) {
          typeof fn == "function" && fn(json.data)
        }
      },
      fail: function (ret) {
        console.log("checkUserPaymentState接口失败：" + JSON.stringify(ret))
      }
    })
  },

  /**
   * 设置密码
   */
  updatePassWord: function (obj, fn) {
    var that = this;
    wx.request({
      url: that.port.updatePassWord,
      method: 'POST',
      data: obj,
      success: function (ret) {
        // console.log("updatePassWord接口成功：" + JSON.stringify(ret))
        var json = JSON.parse(JSON.stringify(ret));
        if (json.statusCode == 200) {
          typeof fn == "function" && fn(json.data)
        }
      },
      fail: function (ret) {
        console.log("updatePassWord接口失败：" + JSON.stringify(ret))
      }
    })
  },

  /**
   * 身份审核
   */
  checkIdCard: function (obj, fn) {
    var that = this;
    wx.request({
      url: that.port.checkIdCard,
      method: 'POST',
      data: obj,
      success: function (ret) {
        var json = JSON.parse(JSON.stringify(ret));
        if (json.statusCode == 200) {
          typeof fn == "function" && fn(json.data)
        }
      },
      fail: function (ret) {
        console.log("checkIdCard接口失败：" + JSON.stringify(ret))
      }
    })
  },

  /**
   * 支付完后活动数据
   */
  getActivityData: function (obj, fn) {
    var that = this;
    wx.request({
      url: that.port.popupapi,
      method: 'POST',
      data: obj,
      success: function (ret) {
        var json = JSON.parse(JSON.stringify(ret));
        if (json.statusCode == 200) {
          typeof fn == "function" && fn(json.data)
        }
      },
      fail: function (ret) {
        console.log("getActivityData接口失败：" + JSON.stringify(ret))
      }
    })
  },
  /**
   * 获取评论数据
   */
  getEvaluateInfo: function (json, fn) {
    var that = this;
    wx.request({
      url: that.port.getEvaluateInfo,
      method: "GET",
      data: json,
      success: function (ret) {
        var json = JSON.parse(JSON.stringify(ret));
        if (json.statusCode == 200) {
          typeof fn == "function" && fn(json.data)
        }
      },
      fail: function (ret) {
        console.log("getEvaluateInfoData接口失败：" + JSON.stringify(ret))
      }
    })
  },
  /**
   * 提交评论
   */
  commitEvaluation: function (json, fn) {
    var that = this;
    wx.request({
      url: that.port.commitEvaluation,
      method: "GET",
      data: json,
      success: function (ret) {
        console.log(ret)
        var json = JSON.parse(JSON.stringify(ret));
        if (json.statusCode == 200) {
          typeof fn == "function" && fn(json.data)
        }
      },
      fail: function (ret) {
        console.log("commitEvaluationData接口失败：" + JSON.stringify(ret))
      }
    })
  },
  /**
   * 获取其他评论数据
   */
  getAllCommentList: function (json, fn) {
    var that = this;
    wx.request({
      url: that.port.getAllCommentList,
      method: "GET",
      data: json,
      success: function (ret) {
        var json = JSON.parse(JSON.stringify(ret));
        if (json.statusCode == 200) {
          typeof fn == "function" && fn(json.data)
        }
      },
      fail: function (ret) {
        console.log("getAllCommentListData接口失败：" + JSON.stringify(ret))
      }
    })
  },
  /**
   * 获取油站详情评分
   */
  getStationGrade: function (stationId, fn) {
    var that = this;
    var json = {
      "stationId": stationId
    }
    wx.request({
      url: that.port.getStationGrade,
      method: "GET",
      data: json,
      success: function (ret) {
        var json = JSON.parse(JSON.stringify(ret));
        if (json.statusCode == 200) {
          typeof fn == "function" && fn(json.data)
        }
      },
      fail: function (ret) {
        console.log("getStationGrade接口失败：" + JSON.stringify(ret))
      }
    })
  },
  /**
   * 获取油站评价列表
   */
  getDetailsEvaluate: function (stationId, fn) {
    var that = this;
    var json = {
      "stationId": stationId
    }
    wx.request({
      url: that.port.getDetailsEvaluate,
      method: "GET",
      data: json,
      success: function (ret) {
        var json = JSON.parse(JSON.stringify(ret));
        if (json.statusCode == 200) {
          typeof fn == "function" && fn(json.data)
        }
      },
      fail: function (ret) {
        console.log("getDetailsEvaluate接口失败：" + JSON.stringify(ret))
      }
    })
  },
  getEvaluates: function (fn) {
    typeof fn == "function" && fn(this.port.getEvaluates)
  },
  /**
   * 一键加油
   */
  oneKey: function (timestamp, fleet_user_flag, oil_id, fn) {
    var that = this;
    var params = {
      latitude: that.latitude,
      longitude: that.longitude,
      osType: os_type,
      oilId: oil_id,
      fleetUserFlag: fleet_user_flag,
    };
    wx.request({
      method: "POST",
      url: that.port.onekey + "/" + timestamp,
      // data: JSON.stringify(params) ,
      data: params,
      // dataType: "json",
      // header: {
      //   'Content-Type': 'application/json' // 默认值
      //   // 'Content-Type': 'application/x-www-form-urlencoded' // 默认值
      // },
      // contentType: 'application/json',
      success: function (res) {
        res = res.data;
        if (res.code != 200) {
          wx.showModal({
            showCancel: false,
            title: '错误',
            content: res.msg
          })
        }
        if (fn) {
          fn(res.data)
        }
      },
      fail: function (ret) {
        if (fn) {
          fn()
        }
        console.log("oneKey 一键加油接口调用失败:" + JSON.stringify(ret))
      }
    })
  },
  saveFormId: function (fid) {
    var that = this;
    if (!that.openid) {
      return;
    }
    wx.request({
      method: "POST",
      url: saveFormId_url,
      data: {
        appid: that.appid,
        openid: that.openid,
        form_id: fid
      },
      success: function (res) {
        res = res.data;
        if (res.ret == 0) {
          console.log('保存formid成功');
        } else {
          wx.showModal({
            title: '保存formid错误',
            content: res.msg,
          })
        }
      }
    })

  },

  // 获取身份注册类型
  get_register_type: function (fn) {
    var that = this;
    //that.user_id =12;
    wx.request({
      method: "POST",
      url: that.port.get_register_type + that.user_id + '/' + os_type,
      data: {
        fromSource: 2, // 2. 油枪页
        longitude: that.longitude,
        latitude: that.latitude
      },
      success: function (res) {
        if (res.data) {
          res = res.data;
          if (res.code == 200) {
            // res.data.registerType = 3;
            that.get_register_data = res.data;
            fn(res.data);
          } else {
            wx.showModal({
              content: res.msg,
              showCancel: false
            })
          }
        } else {
          wx.showModal({
            content: '服务器错误',
            showCancel: false
          })
        }

      }
    })

  },
  // 身份审核-无需上传图片
  submit_identity_no_img: function (cartype, registertype, fn) {
    wx.showLoading({
      title: '提交中',
    })
    var that = this;
    //that.user_id =12;
    wx.request({
      method: "POST",
      url: that.port.submit_identity + that.user_id + '/' + os_type,
      data: {
        fromSource: 2, // 2. 油枪页
        fromLab: 0, //0无用户来源，chooseCarType 等于 5 且 registerType 等于 1 时不能传0，1 滴滴/优步， 2 美团打车，3 神州专车，4 其它用车
        chooseCarType: cartype, //选择的车类型, 1 私家车， 5 专快车，13 柴油， 3 面包小货
        registerType: registertype,
        longitude: that.longitude,
        latitude: that.latitude
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data) {
          res = res.data;
          if (res.code == 200) {
            fn();
          } else {
            wx.showModal({
              content: res.msg ? res.msg : '服务器错误',
              showCancel: false
            })
          }
        } else {
          wx.showModal({
            content: '服务器错误',
          })
        }
      }
    })

  },
  // 身份审核-需上传图片
  submit_identity: function (cartype, fromlab, registertype, img_url, fn) {
    wx.showLoading({
      title: '提交中',
    })
    var that = this;
    //that.user_id =12;
    wx.request({
      method: "POST",
      url: that.port.submit_identity + that.user_id + '/' + os_type,
      data: {
        fromSource: 2, // 2. 油枪页
        userHeadImage: img_url,
        chooseCarType: cartype, //选择的车类型, 1 私家车， 5 专快车，13 柴油， 3 面包小货
        fromLab: fromlab, //0无用户来源，chooseCarType 等于 5 且 registerType 等于 1 时不能传0，1 滴滴/优步， 2 美团打车，3 神州专车，4 其它用车
        registerType: registertype,
        longitude: that.longitude,
        latitude: that.latitude
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data) {
          res = res.data;
          if (res.code == 200) {
            fn();
          } else {
            wx.showModal({
              content: res.msg ? res.msg : '服务器错误',
              showCancel: false
            })
          }
        } else {
          wx.showModal({
            content: '服务器错误',
          })
        }
      }
    })

  },
  //获取58信息
  get_userInfo_58: function (phone, fn) {
    var that = this;
    var timestamp = new Date().getTime();
    wx.showLoading({
      title: '获取用户信息',
    })
    wx.request({
      method: "GET",
      url: that.port.get_userInfo_58 + phone + '/' + timestamp,
      data: {

      },
      success: function (res) {
        wx.hideLoading();
        if (res.data) {
          res = res.data;
          console.log('get_userInfo_58',res);
          if (res.code == 200) {
            that.user_id = res.data.userId;
            that.user_phone = res.data.userPhone;
            that.car_type = res.data.carTypes[0];
            fn();
          } else {
            wx.showModal({
              content: res.msg ? res.msg : '服务器错误',
              showCancel: false
            })
          }
        } else {
          wx.showModal({
            content: '服务器错误',
          })
        }
      }
    })
  }
})