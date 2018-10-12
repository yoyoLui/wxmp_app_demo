// pages/identity_registration/identity_zkc/index.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fromlab: 1,
    tempFilePaths: 'http://img.ejiayou.com/imgs/rsgter_didi.png',
    mtHeight:0,
    uHeight:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.calc_upload_view_margin_top();


  },
  calc_upload_view_margin_top: function() {
    let wHeight = app.systemInfo.windowHeight*2;//窗口高度
    let tHeight = 160 + 50;//顶部高度
    let bHeight = 160;//底部高度
    let uHeight = wHeight - tHeight - bHeight;//中间高度
   
    let ubHeight=800;//中间body高度
    let mtHeight=(uHeight-ubHeight)/2-30;
    this.setData({
      mtHeight: mtHeight > 0 ? mtHeight:0
    })

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  //点击列表
  click_list_item: function(e) {
    this.setData({
      fromlab: e.currentTarget.dataset.fromlab,
      tempFilePaths: e.currentTarget.dataset.url
    })
  },
  // 选择图片
  uploadImg: function() {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        that.setData({
          tempFilePaths: tempFilePaths
        });
        console.log(tempFilePaths);
        //上传图片
        wx.uploadFile({
          url: 'https://resource.ejiayou.com/uploadPic/upload', //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          header: {
            'content-type': 'multipart/form-data'
          },
          success: function(res) {
            console.log(res);
            if (res.statusCode == 200) {
              let dd = JSON.parse(res.data);
              if (dd.img_b) {
                that.submit_info(dd.img_b);
              } else {
                wx.showModal({
                  content: '上传失败，请重新上传',
                  showCancel: false
                })
              }
            } else {
              wx.showModal({
                title: '上传图片错误，请重新上传',
                showCancel: false
              })
            }
          },
          fail: function() {
            wx.showModal({
              content: '上传图片失败',
              showCancel: false
            })
          }
        })
      },
      fail: function() {
        wx.showModal({
          content: '选择图片失败',
          showCancel: false
        })
      }
    })
  },
  //提交审核
  submit_info: function(img_url) {
    this.setData({
      disabled_button: true
    })
    app.submit_identity(5, this.data.fromlab, 1, img_url, function() {
      wx.redirectTo({
        url: '../identity_success/index?auditStatus=1',
      })


    })
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