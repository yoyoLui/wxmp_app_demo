// pages/identity_registration/identity_success/index.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    error_title: '',
    error_reason: '',
    ikonw_else: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // options.limitPrivateCar = 2;
    if (options.limitPrivateCar == 1) {
      //私家车不可用
      this.not_support_private_car();
    } else if (options.limitPrivateCar == 2) {
      //私家车不可用但可注册
      this.private_can_identity();
    }
  },
  //1不支持私家车
  not_support_private_car: function() {
    this.setData({
      error_title: '本站暂不支持私家车',
      error_reason: '专车、货车等营运车辆，才能在本油站进行支付，并享受优惠价',
      ikonw_else: false
    });

  },

  //2私家车可认证
  private_can_identity: function() {
    this.setData({
      error_title: '您目前的身份为私家车无法享受优惠',
      error_reason: '专车、货车等营运车辆，才能在本油站进行支付，并享受优惠价',
      ikonw_else: true
    });
  },
  //身份审核中
  in_review: function() {
    this.setData({
      error_title: '身份审核中',
      error_reason: '您提交的身份认证正在审核中，请耐心等待。审核通过后才能在本油站进行支付，并享受优惠价',
      ikonw_else: false
    });
  },

  //跳转到身份注册列表
  click_to_register: function() {
    var that = this;
    app.get_register_type(function(data) {
      //审核状态，0 没有提交过审核资料，1 上传图片审核，2 直接送身份，3 客服电话通知 4 第三方平台用户，不需要审核
      that.redirectTo_page(data);
    })
  },
  // 跳转页面
  redirectTo_page: function(data) {
    if (data.auditStatus == 0) {
      wx.navigateTo({
        url: '../identity_choose/index',
      })
    } else if (data.auditStatus >= 1) {
      this.in_review();
    }
  },
  back_to_index: function() {
    wx.redirectTo({
      url: '../../index/index',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },  

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})