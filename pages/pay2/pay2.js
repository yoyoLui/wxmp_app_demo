var utils = require('../../utils/util.js')

var list = [];
var selectPayType = -1;
var orderId = -1;
var app = getApp();
var hadInvoice, invoiceHead, invoiceNumber;
Page({
  data: {
    showModalStatus: false,
    hiddenLoading: false,
    loadingMsg: '加载中',
    disabled: true,
    // 输入框参数设置
    inputData: {
      input_value: "",//输入框的初始内容
      value_length: 0,//输入框密码位数
      isNext: false,//是否有下一步的按钮
      get_focus: true,//输入框的聚焦状态
      focus_class: true,//输入框聚焦样式
      value_num: [1, 2, 3, 4, 5, 6],//输入框格子数
      height: "88rpx",//输入框高度
      width: "542rpx",//输入框宽度
      see: false,//是否明文展示
      interval: true,//是否显示间隔格子
    },
  },
  onLoad: function () {
    console.log("支付完广告：" + JSON.stringify(app.payAdvertDialog));
    var index = 1;
    list = [];
    var json = app.payAdvertDialog;
    if (json) {
      while (true) {
        var content = json.content[index]
        if (content) {
          list.push(content);
          index++;
        } else {
          break
        }
      }
      if (list.length > 0) {
        this.setData({
          isShowAdvert: true,
          advertList: list,
          advertUrl: json.img,
        })
      } else {
        this.setData({
          isShowAdvert: false,
        })
      }
    }


    //发票信息
    if (app.invoice_id == -1) {
      //没有发票
      hadInvoice = false;
      invoiceHead = '';
      invoiceNumber = '';
    } else {
      hadInvoice = true;
      invoiceHead = app.invoice_name;
      invoiceNumber = app.invoice_number;
    }
    console.log("app.app.selectOilInfo:" + JSON.stringify(app.selectOilInfo))
    this.setData({
      station_img: app.code.confirmPayPanelStationPic,
      station_name: app.code.fillingStationName,
      oilcode: app.selectOilInfo.oilCode,
      inputPrice: app.input_price,
      orderSum: app.orderSum
    })
    var json = {
      "carType": app.car_type,
      "oilId": app.selectOilInfo.oilId,
      "oilgunId": app.selectOilInfo.oilgunId,
      "originalCost": app.input_price,
      "stationId": app.station_id,
      "useCouponId": app.merchandiseId ? app.merchandiseId : 0,
      "type": app.paytype_is_moren ? "-1" : app.pay_type,//app.pay_type
      "webType": 1
    }
    var that = this;
    app.getPayWay(app.user_id, json, function (ret) {
      that.setData({
        hiddenLoading: true
      })
      if (ret.code == 200) {
        list = ret.data.payments;
        console.log("支付方式列表：" + JSON.stringify(list))
        var defaultPayType = ret.data.defaultPayType;
        that.updateUI(defaultPayType, that);
      } else {
        //失败
        console.log("获取支付方式失败")
      }
    });
  },
  updateUI: function (paytype, that) {
    selectPayType = paytype;
    for (var i = 0; i < list.length; i++) {
      // 说明有可用支付按钮可点击
      if (list[i].payState == 1) {
        that.setData({
          disabled: false
        })
      }
      if (paytype == list[i].payWay) {
        list[i].selectIcon = '../../img/common/Selected.png'
        that.setData({
          cardType: list[i].title,
          cardBalance: list[i].payBalance
        })
      } else {
        list[i].selectIcon = '../../img/common/Unselected.png'
      }
    }
    // 更新UI
    that.setData({
      list: list
    })
  },
  gotopay: function () {
    this.setData({
      hiddenLoading: false,
    })
    this.createOrder();
  },
  createOrder: function () {
    var that = this;
    var json = {
      "payType": selectPayType == 1 ? 18 : selectPayType,
      "productType": 51,//默认小程序 51
      "hadInvoice": hadInvoice,
      "invoiceHead": invoiceHead,
      "invoiceNumber": invoiceNumber,
      "stationId": app.station_id,
      "oilgunId": app.selectOilInfo.oilgunId,
      "oilId": app.selectOilInfo.oilId,
      "orderSum": app.orderSum,
      "originalCost": app.input_price,
      "userCouponId": app.merchandiseId ? app.merchandiseId : 0,
      "createOrderCarType": app.car_type,
      "carNumber": app.car_cheduika_chepai ? app.car_cheduika_chepai : "",
      "filterSource": 1,
      "orderType": 1
    }
    console.log(JSON.stringify(json))
    app.newCreateOrder(app.user_id, json, function (ret) {
      if (!ret) {
        that.setData({
          hiddenLoading: true
        })
        return
      }
      orderId = ret.orderSign;
      that.setData({
        payData: ret.wxPayReqOutputI,
        hiddenLoading: true
      })
      //微信支付
      if (selectPayType == 1) {
        that.wxpay();
      } else {
        //先检查用户是否设置了密码
        app.checkUserPaymentState(app.user_id, function (ret) {
          console.log(JSON.stringify(ret));
          if (ret.code == 200) {
            var data = ret.data;
            if (data.hadCertification == 0) {
              utils.animationUtil("close", that);
              //去认证
              wx.navigateTo({
                url: '../certification/certification',
              })
            } else if (data.hadPwd == 0) {
              utils.animationUtil("close", that);
              //去设置密码
              wx.navigateTo({
                url: '../setPwd/setPwd',
              })
            } else {
              //卡支付
              utils.animationUtil("open", that, "inputPwd");
            }
          }
        });
      }
    })
  },
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    utils.animationUtil(currentStatu, this)
  },
  /**
   * 密码输入框监听事件
   */
  valueSix: function (e) {
    this.setData({
      hiddenLoading: false,
      loadingMsg: "支付中"
    })
    var that = this;
    utils.animationUtil("close", that);
    console.log(e.detail);
    var pwd = e.detail;
    if (pwd.length == 6) {
      //支付
      var json = {
        "orderId": orderId,
        "password": pwd,
        "type": selectPayType
      }

      app.oilCardPay(app.user_id, json, function (ret) {
        console.log(JSON.stringify(ret));
        that.setData({
          hiddenLoading: true
        })
        if (ret.code == 200) {
          if (ret.data.paySuccess) {
            //支付成功
            wx.reLaunch({
              url: '../paySuccess/paySuccess?orderId=' + ret.data.orderId,
            })
          } else {
            that.setData({
              failMsg: ret.data.showMsg,
            })
            setTimeout(function () {
              utils.animationUtil("open", that, "retryPwd");
            }, 500)
          }
        } else {
          wx.showModal({
            showCancel: false,
            title: '支付失败',
            content: res.msg
          })
        }
      });
    }
  },
  /**
   * 重试
   */
  retryInput() {
    var that = this;
    utils.animationUtil("close", this);
    setTimeout(function () {
      utils.animationUtil("open", that, "inputPwd");
    }, 500)
  },
  /**
   * 关闭弹框
   */
  closeInputPwd: function () {
    utils.animationUtil("close", this);
  },
  setPayWay: function (e) {
    var payType = e.currentTarget.dataset.index;
    this.updateUI(payType, this);
  },
  /**
   * 微信支付
   */
  wxpay: function () {
    var errMsg = "";
    var that = this;
    var time = new Date();
    console.log(that.data.payData.timeStamp);
    if (that.data.payData.timeStamp == null || that.data.payData.nonceStr == null || that.data.payData.packageValue == null || that.data.payData.sign == null) {
      errMsg = "缺少参数";
    }
    wx.requestPayment({
      'timeStamp': that.data.payData.timeStamp + '',
      'nonceStr': that.data.payData.nonceStr + '',
      'package': that.data.payData.packageValue,
      'signType': 'MD5',
      'paySign': that.data.payData.sign + '',
      'success': function (res) {
        wx.navigateTo({
          url: '../paySuccess/paySuccess?orderId=' + orderId,
        })
      },
      'fail': function (res) {
        console.log("支付异常:" + JSON.stringify(res))
        if ("requestPayment:fail cancel" == res.errMsg) {
          app.showToast("支付取消", that, 2000);
        } else {
          app.showToast("支付异常，" + errMsg, that, 2000);
        }
      }
    })
  },
  /**
 * 保存formid
 */
  formSubmit: function (e) {
    if (e.detail.formId) {
      app.saveFormId(e.detail.formId);
    }
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },
})
