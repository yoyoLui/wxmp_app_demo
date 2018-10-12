var util = require('../../utils/util.js');
var app = getApp();
var stationPhone, stationId;
var opt;
Page({
  load_station_detail: function() {
    var that=this;
   
    stationId = opt.stationId||app.referrerInfo.stationId;
    app.getDetails(stationId, function(data) {
      wx.hideLoading();
      data._stationAddress = data.stationAddress.split(" ")[0];
      stationPhone = data.stationPhone;
      var privilegeListValue = [];
      for (var i = 0; i < 4; i++) {
        privilegeListValue[i] = {
          "油品": data.oilType['key' + (i - 0 + 1)],
          "国家价": data.countryOil['key' + (i - 0 + 1)],
          "油站价": data.stationOil['key' + (i - 0 + 1)],
          "优惠价": data.discountOil['key' + (i - 0 + 1)]
        }
      }
      that.setData({
        detail: data,
        privilegeListValue: privilegeListValue,
        stationPhone: stationPhone
      })
      wx.setNavigationBarTitle({
        title: data.stationName
      })
      app.station_id = stationId;
      //获取油站评价评分
      that.getStationGrade(stationId);  
      //获取油站评价列表
      that.getDetailsEvaluate(stationId);
    });
  },
  onLoad: function(option) {
    var that = this;
    opt = option;
    wx.showLoading({
      title: '加载中',
    })
    if (app.referrerInfo) {
      if (app.referrerInfo.phone) {
        if (checkMobile(app.referrerInfo.phone)) {
          app.get_userInfo_58(app.referrerInfo.phone, function () {
            that.load_station_detail();
          });
        }
      } else {
        wx.showToast({
          title: '缺少手机号',
        })
      }


     
    } else {
      that.load_station_detail();
    }
  },
  data: {
    privilegeListOption: ["油品", "国家价", "油站价", "优惠价"],
    privilegeListValue: [],
    isHasGrade: true,
    isHasEvaluateList: true,
    comments: {
      data: [{
        user: 13569876545,
        gas: "92#",
        price: "325.00",
        star: "4",
        date: "9-19",
        content: "好"
      }, {
        user: 13569876545,
        gas: "92#",
        price: "325.00",
        star: "4",
        date: "9-19",
        content: "好"
      }, {
        user: 13569876545,
        gas: "92#",
        price: "325.00",
        star: "4",
        date: "9-19",
        content: "好"
      }, {
        user: 13569876545,
        gas: "92#",
        price: "325.00",
        star: "4",
        date: "9-19",
        content: "好"
      }]
    }
  },
  getStationGrade: function(stationId) {
    var that = this;
    app.getStationGrade(stationId, function(ret) {
      if (ret.code == 200) {
        try {
          var total = ret.data.total;
          var questions = ret.data.questions;
          for (var i = 0; i < questions.length; i++) {
            var heigth = (questions[i].avgGrade / 5 * 128).toFixed(1);
            questions[i]["showHeigth"] = heigth;
            questions[i]["avgGrade"] = parseFloat((questions[i].avgGrade)).toFixed(1);
          }
          that.setData({
            questionTotal: total,
            stationGradeList: questions
          })
        } catch (err) {
          that.setData({
            isHasGrade: false
          })
        }
      } else {
        that.setData({
          isHasGrade: false
        })
      }
    })
  },
  getDetailsEvaluate: function(stationId) {
    var that = this;
    app.getDetailsEvaluate(stationId, function(ret) {
      if (ret.code == 200) {
        try {
          var evaluates = ret.data.evaluates;
          that.setData({
            evaluateList: evaluates,
            total: ret.data.total
          })
        } catch (err) {
          console.log(JSON.stringify(err))
          that.setData({
            isHasEvaluateList: false
          })
        }
      } else {
        that.setData({
          isHasEvaluateList: false
        })
      }
    })
  },
  callPhone: function() {
    wx.makePhoneCall({
      phoneNumber: stationPhone,
    })
  },
  test: function() {
    var that = this;
    /*wx.getLocation({
        type: 'gcj02', //返回可以用于wx.openLocation的经纬度
        success: function(res) {
            var latitude = res.latitude
            var longitude = res.longitude
            wx.openLocation({
                latitude: latitude,
                longitude: longitude,
                scale: 28
            })
        }
    })*/
    console.log("坐标转换前：");
    console.log(that.data.detail.longtitude, that.data.detail.latitude)
    var location = util.bd09togcj02(that.data.detail.longtitude, that.data.detail.latitude)
    console.log("坐标转换后：");
    console.log(location)
    if (location[1] && location[0]) {
      wx.openLocation({
        latitude: location[1],
        longitude: location[0],
        name: that.data.detail.stationName,
        address: that.data.detail.stationAddress,
        scale: 28
      })
    }

  },
  toGun: function() {
    var that = this;
    app.station_qrcode = that.data.detail.stationQRCode;
    wx.navigateTo({
      url: "../gun/gun?from_page=3"
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
  /**
   * 保存formid
   */
  formSubmit: function(e) {
    if (e.detail.formId) {
      app.saveFormId(e.detail.formId);
    }
  },
  /**
   * 查看全部评论
   */
  totalEvaluate: function() {
    wx.navigateTo({
      url: '../web/web?stationId=' + stationId,
    })
  }
})
//校验手机号
function checkMobile(phone) {
  if (!(/^1[0-9][0-9]\d{8}$/.test(phone))) {
    wx.showModal({
      title: '提示',
      content: '请输入正确的手机号',
      showCancel:false
    })
    wx.hideLoading();
    return false;
  }
  return true;
}