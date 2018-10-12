var utils = require("../../utils/getInfoByInput.js");
var app = getApp();
// var ticketList;
Page({
  data: {
    noInvoice: "如需发票请添加抬头",
    noInvoiceIsRed:'',//是否是红色字体
    noInvoiceDescription:'',//描述文字
    input1_data: {
      imgSrc: "../../img/common/yuan.png",
      function: "input1_fc",
      payInfo: {},
      price: "",
    },
    gunIndex: '',
    isNeedPrintInvoice: 0,
    common_price: false,
  },
  onLoad: function (option) {
    //重新获取carType
    app.car_type = app.forPayInfo_data.oilPriceInfoVo.carType;
    app.invoice_id = -1; //默认不要发票
    app.ticketList.userSelect = false;
    var that = this;
    that.setData({
      noInvoiceIsRed: app.forPayInfo_data.noInvoiceIsRed,
      noInvoiceDescription: app.forPayInfo_data.noInvoiceDescription,
      gunIndex: option.index,
      merchandiseJsonList: JSON.stringify(getMerchandise(app.forPayInfo_data.couponInfoToExPayList)),
      station_id: option.stationId,
      oilId: option.oilId,
      // asss:app.forPayInfo_data.commonCountMoneyJs
      isNeedPrintInvoice: app.forPayInfo_data.isNeedPrintInvoice
    });
    app.merchandiseJsonList = getMerchandise(app.forPayInfo_data.couponInfoToExPayList);
    app.ticketList = {
      couponInfoToExPayList: cloneObj(app.forPayInfo_data.couponInfoToExPayList),
      avlCouponNum: app.forPayInfo_data.avlCouponNum,
      invalidCouponNum: app.forPayInfo_data.invalidCouponNum,
      nowSelect: '',
      inputNum: ''
    };
  },
  onShow: function() {
    var that = this;

    if (that.data.input1_data.price != "") {
      getInputData(that.data.input1_data.price, that);
    }
    that.setData({
      noInvoice: app.invoice_name == "" ? "如需发票请添加抬头" : app.invoice_name
    })
    wx.getStorage({
      key: 'invoice_name',
      success: function(res) {
        wx.getStorage({
          key: 'invoice_number',
          success: function(res2) {
            wx.getStorage({
              key: 'invoice_id',
              success: function(res3) {
                that.setData({
                  noInvoice: res.data
                })
                app.invoice_name = res.data;
                app.invoice_number = res2.data;
                app.invoice_id = res3.data;
              },
            })
          },
        })
      },
    })
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },
  input1_fc: function(e) {
    var that = this;
    app.input_price = e.detail.value;
    that.data.input1_data.price = e.detail.value;
    if (e.detail.value > 0 && e.detail.value != "") {
      if (parseFloat(e.detail.value) < parseFloat(app.forPayInfo_data.minOrderSum) || parseFloat(e.detail.value) > parseFloat(app.forPayInfo_data.maxOrderSum)) {
        app.showToast('输入金额不能大于' + app.forPayInfo_data.maxOrderSum + '或者小于' + app.forPayInfo_data.minOrderSum, that, 2000);
        that.setData({
          common_price: false
        })
        return;
      } else {
        that.setData({
          common_price: true
        })
        getInputData(e.detail.value, that); //自动计算金额
      }
    } else if (e.detail.value == "") {
      that.data.input1_data.payInfo = {}
      that.setData({
        input1_data: that.data.input1_data
      })
    } else {
      return {
        value: ""
      }
    }
    //初始化优惠券列表
    if (app.forPayInfo_data) {
      app.ticketList = {
        couponInfoToExPayList: cloneObj(app.forPayInfo_data.couponInfoToExPayList),
        avlCouponNum: app.forPayInfo_data.avlCouponNum,
        invalidCouponNum: app.forPayInfo_data.invalidCouponNum,
        nowSelect: app.ticketList.nowSelect != '' ? app.ticketList.nowSelect : '',
        inputNum: e.detail.value,
        userSelect: false,
      };
    }
  },
  toInvoice: function() {
    if (!app.forPayInfo_data.noInvoiceDescription){
      wx.navigateTo({
        url: "../invoice/invoice"
      })
    }
   
  },
  toTicket: function() {
    var that = this;
    wx.navigateTo({
      url: "../ticket/ticket?price=" + that.data.input1_data.price
    })
  },
  pay: function() {
    var that = this;
    if (parseFloat(that.data.input1_data.payInfo.orderSum) > 0 && parseFloat(that.data.input1_data.payInfo.orderSum) <= parseFloat(app.forPayInfo_data.maxOrderSum)) {
      wx.navigateTo({
        url: "../pay2/pay2",
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '支付金额要为正数并且不能超过8000哦~'
      })
    }
  },
  formSubmit: function(e) {
    if (e.detail.formId) {
      app.saveFormId(e.detail.formId);
    }
  },
})
// eval(app.forPayInfo_data.commonCountMoneyJs);
//根据id算优惠券对象

function getInputData(value, that, fn) { //获得表单信息
  var countryPrice = app.forPayInfo_data.oilPriceInfoVo.countryPrice;

  var price = app.forPayInfo_data.oilPriceInfoVo.price;
  var activityPrice = app.forPayInfo_data.oilPriceInfoVo.activityPrice ? app.forPayInfo_data.oilPriceInfoVo.activityPrice : app.forPayInfo_data.oilPriceInfoVo.price;
  var merchandiseJsonList = that.data.merchandiseJsonList;
  var CouponSelected = app.ticketList.couponInfoToExPayList.find(function(x) {
    return x.userCouponId == app.ticketList.nowSelect
  })
  var selectMerchandiseJson = (app.ticketList.nowSelect != "" && app.ticketList.userSelect) ? JSON.stringify(getMerchandise(CouponSelected)) : null;
  var isPassUserLimitCount = app.forPayInfo_data.isNotDiscount ? 0 : 1; //是否没有折扣，true为没有优惠 ，false为有折扣
  var userWantedCoupon = (app.ticketList.nowSelect == "" && app.ticketList.userSelect) ? 0 : 1; //不自动筛选
  var ddd = app.forPayInfo_data.commonCountMoneyJs.indexOf("doCommission");
  if (ddd == -1) { //没有抽佣
    var res = utils.default.getInfoByInput(
      value,
      countryPrice,
      price,
      activityPrice,
      that.data.merchandiseJsonList, //所有优惠券
      selectMerchandiseJson, //已选优惠券
      isPassUserLimitCount, //是否超过限制
      userWantedCoupon //是否用户需要优惠券
    );
  } else {
    var res = utils.default.getInfoByInput2(
      value,
      countryPrice,
      price,
      activityPrice,
      that.data.merchandiseJsonList, //所有优惠券
      selectMerchandiseJson, //已选优惠券
      isPassUserLimitCount, //是否超过限制
      userWantedCoupon //是否用户需要优惠券
    );
  }


  that.data.input1_data.payInfo = JSON.parse(res);
  app.orderSum = JSON.parse(res).orderSum > 0 ? JSON.parse(res).orderSum : 0;
  app.merchandiseId = JSON.parse(res).merchandiseSelect.merchandiseId;

  // console.log(that.data.input1_data.payInfo);
  // console.log("res", res)

  if (that.data.input1_data.payInfo.merchandiseSelect.merchandiseId) { //找到id,方便进入优惠券页面
    for (var i = 0; i < app.ticketList.couponInfoToExPayList.length; i++) {
      if (app.ticketList.couponInfoToExPayList[i].userCouponId == that.data.input1_data.payInfo.merchandiseSelect.merchandiseId) {
        app.ticketList.nowSelect = that.data.input1_data.payInfo.merchandiseSelect.merchandiseId;
        break;
      }
    }
  }
  that.setData({
    input1_data: that.data.input1_data
  })
  console.log("app.ticketList=", app.ticketList);
}

function getMerchandise(data) {
  var temp = [];
  if (data instanceof Array) {
    for (var i = 0, j = 0; i < data.length; i++) {
      if (data[i].enabled == 1) {
        temp[j] = {
          "merchandiseId": data[i].userCouponId,
          "merchandiseType": data[i].couponType,
          "merchandiseValue": data[i].value,
          "limitMoney": data[i].limitMoney,
          "addOnEjiayou": data[i].addOnEjiayou ? 1 : 0
        }
        j++;
      }
    }
  } else {
    if (data.enabled == 1) {
      temp = {
        "merchandiseId": data.userCouponId,
        "merchandiseType": data.couponType,
        "merchandiseValue": data.value,
        "limitMoney": data.limitMoney,
        "addOnEjiayou": data.addOnEjiayou ? 1 : 0
      }
    }

  }
  return temp;
}



//深复制对象方法    
var cloneObj = function(obj) {
  var newObj = {};
  if (obj instanceof Array) {
    newObj = [];
  }
  for (var key in obj) {
    var val = obj[key];
    newObj[key] = typeof val === 'object' ? cloneObj(val) : val;
  }
  return newObj;
};

function isEnabledfun(element) {
  return element.enabled == 1;

}