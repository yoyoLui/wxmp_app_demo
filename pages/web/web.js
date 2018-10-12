// pages/web/web.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;

    //油站详情全部评论过来的
    if (options.stationId) {
      console.log(options.stationId + "====" + app.car_type + "====" + app.user_id)
      app.getEvaluates(function(url) {
        that.setData({
          url: url + "?stationId=" + options.stationId + "&&carType=" + app.car_type + "&userId=" + app.user_id
        })
      })
      return
    }

    //banner、支付完成
    if (app.activityUrl){
        var url = app.activityUrl;
        console.log("要打开网页的url:" + url)
        that.setData({url: url})
        return
    }

    //指定url
    if (options.web_url){
      that.setData({ url: decodeURIComponent(options.web_url) })
      return
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