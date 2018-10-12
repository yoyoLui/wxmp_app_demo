// pages/certification/certification.js
var utils = require('../../utils/util.js')
var name, cardNo;
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showModalStatus: false,
    disabled: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  goSetPwd: function () {
    wx.redirectTo({
      url: '../setPwd/setPwd',
    })
  },
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    utils.animationUtil(currentStatu, this)
  },
  /**
   * 身份审核
   */
  identityAudit: function () {
    var that = this;
    var json = {
      "name": name,
      "cardNo": cardNo,
      "userId": app.user_id
    };
    console.log(json);
    app.checkIdCard(json, function (ret) {
      if (ret.code == 200 && ret.data.status == 1) {
        //通过
        that.goSetPwd();
      } else {
        that.setData({
          failMsg: ret.msg
        })
        //不通过
        utils.animationUtil("open", that, "identity");
      }
    });
  },
  inputName: function (e) {
    name = e.detail.value;
    this.updateBtnState();
  },
  inputNum: function (e) {
    cardNo = e.detail.value;
    this.updateBtnState();
  },
  updateBtnState: function () {
    var myreg = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
    if (name != undefined && name.length > 0 && cardNo != undefined && cardNo.length > 0) {
      if (!myreg.test(cardNo)) {
        //身份证号不合法
        this.setData({
          disabled: true,
        })
      } else {
        this.setData({
          disabled: false,
        })
      }
    } else {
      this.setData({
        disabled: true,
      })
    }
  }
})