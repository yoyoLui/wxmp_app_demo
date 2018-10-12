// pages/successEvaluate/successEvaluate.js
//type : 0说明来自支付完页面，1说明来自评论完页面
var t, orderId;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowSubTiltle: false,
    btn_text: '知道了'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    t = options.type;
    orderId = options.orderId;
    if (t && t == 0) {
      wx.setNavigationBarTitle({
        title: '支付完成',
      })
      this.setData({
        btn_text: '评论其他',
        isShowSubTiltle: false
      })
    } else if (t == 1) {
      wx.setNavigationBarTitle({
        title: '评价',
      })
      this.setData({
        btn_text: '知道了',
        isShowSubTiltle: true
      })
    }
  },
  onClick: function() {
    if (t && t == 0) {
      wx.redirectTo({
        url: '../commentOther/commentOther?orderId=' + orderId,
      })
    } else if (t == 1) {
      wx.reLaunch({
        url: '../index/index',
      })
    }
  }
})