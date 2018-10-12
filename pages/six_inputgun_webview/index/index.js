
var formid;
var app = getApp();
var utilPlugins = require('../utilPlugins');
var weApi = require('../weApi');
var miniapp_fun = require('../common');
var openid;
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    weApi.getCodeAndIV(function (code, en, iv) {
      miniapp_fun.getUserInfo(code, en, iv, function (union_id, open_id) {
        openid = open_id;
        console.log('跳转地址=../inputgun/inputgun?openid=' + openid);
      })
    })
  },

  jump: function (opti) {

  },
  buttonClick: function (e) {
    formid = e.detail.formId;
    wx.redirectTo({
      url: '../inputgun/inputgun?formid=' + formid + '&openid=' + openid,
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideLoading()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})