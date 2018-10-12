// pages/redirect_to_other_miniapps/index.js
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
    // options={
    //   path:'pages/index/index',
    //   // params:'{name:11}'
    // }
    var path = options.path;
    var params = eval('(' + options.params + ')')
    // var params = JSON.parse(options.params);
    wx.navigateToMiniProgram({
      appId: 'wx4c622f21d26f9cc0', // 要跳转的小程序的appid
      path: path, // 跳转的目标页面
      // extarData: params,
      success(res) {
        wx.showToast({
          title: 'success',
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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