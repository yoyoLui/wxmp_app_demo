// pages/identity_registration/identity_choose/index.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chooseCarType: '',
    cartypes: [],
    disabled_button: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    if (app.get_register_data) {
      let data = app.get_register_data;
      that.setData({
        cartypes: data.carTypes,
        chooseCarType: data.carTypes[data.carTypes.length - 1],
      })
      if (that.data.chooseCarType) {
        that.setData({
          disabled_button: 'true'
        })
      }
    }

  },
  //点击下一步
  confirm: function(e) {
    if (!app.get_register_data) {
      return;
    }
    let data = app.get_register_data;

    if (data.registerType == 1) { //1 上传图片审核
      if (this.data.chooseCarType == 5) {
        wx.navigateTo({
          url: '../identity_zkc/index?chooseCarType=5',
        })

      } else if (this.data.chooseCarType == 3) {
        wx.navigateTo({
          url: '../identity_mbc/index?chooseCarType=3',
        })
      } else if (this.data.chooseCarType == 13) {
        wx.navigateTo({
          url: '../identity_mbc/index?chooseCarType=13',
        })
      }
    } else if (data.registerType == 2) { //2 直接送身份
      app.submit_identity_no_img(this.data.chooseCarType, 2, function() {
        wx.redirectTo({
          url: '../identity_success/index?auditStatus=2',
        })
      })

    } else if (data.registerType == 3) { //3 客服电话通知
      app.submit_identity_no_img(this.data.chooseCarType, 3, function() {
        wx.redirectTo({
          url: '../identity_success/index?auditStatus=3',
        })
      })
    }
  },
  // 点击列表
  click_list_item: function(e) {
    this.setData({
      chooseCarType: e.currentTarget.dataset.cartype
    });
    let f = this.data.cartypes.indexOf(parseInt(e.currentTarget.dataset.cartype))
    if (f != -1) {
      this.setData({
        disabled_button: 'true'
      })
    } else {
      this.setData({
        disabled_button: false
      })
    }
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