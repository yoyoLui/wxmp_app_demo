// pages/identity_registration/identity_success/index.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    error_title:'',
    error_reason:'',
    ikonw_else:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //审核状态，0 没有提交过审核资料，1 上传图片审核，2 直接送身份，3 客服电话通知 4 第三方平台用户，不需要审核
    if (options.auditStatus == 1) {
      this.call_center_will_in_review();
    }
   
    else if (options.auditStatus == 2){
      this.identity_success();
    }
    else if (options.auditStatus == 3) {
      this.call_center_will_call();
    }
  },
  //提交成功，客服在审核资料
  call_center_will_in_review: function () {
    this.setData({
      error_title: '提交成功',
      error_reason: '易加油客服将在24小时内审核您的材料，请保持电话畅通',
      ikonw_else: true
    });
  },
  //身份认证成功,第三方平台用户，不需要审核
  identity_success: function() {
    this.setData({
      error_title:'身份认证成功',
      error_reason:'您可以在与易加油合作的油站享受专属优惠，快去加油吧',
      ikonw_else:false
    });
    
  },
  //提交成功，客服会打电话
  call_center_will_call: function() {
    this.setData({
      error_title: '提交成功',
      error_reason: '易加油客服将在24小时内致电您验证身份，请保持电话畅通',
      ikonw_else: true
    });
  },
  //回到首页
  back_to_index: function () {
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