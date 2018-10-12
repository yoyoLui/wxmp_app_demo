// pages/identity_registration/identity_mbc/index.js
var app = getApp();
var opt;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    disabled_button: true,
    img_zheng: '../../../img/identity_registration/zheng@3x.png',
    img_fu: '../../../img/identity_registration/fu@3x.png',
    zheng_selected:false,
    fu_selected: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    opt = options;
    this.calc_upload_view_margin_top();
  },
  calc_upload_view_margin_top: function () {
    let wHeight = app.systemInfo.windowHeight * 2;//窗口高度
    let tHeight = 160 + 50;//顶部高度
    let bHeight = 160;//底部高度
    let uHeight = wHeight - tHeight - bHeight;//中间高度

    let ubHeight = 800;//中间body高度
    let mtHeight = (uHeight - ubHeight) / 2 - 30;
    this.setData({
      mtHeight: mtHeight > 0 ? mtHeight : 0
    })

  },
  //选择正面的图片
  chooseImg_zheng: function() {
    if (this.data.can_not_choose_img) {
      return;
    }
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          img_zheng: res.tempFilePaths,
          zheng_selected:true
        });

      },
      fail: function () {
        wx.showModal({
          content: '主页选择失败',
          showCancel: false
        })
      }
    })
  },
  //选择反面的图片
  chooseImg_fu: function() {
    if (this.data.can_not_choose_img) {
      return;
    }
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          img_fu: res.tempFilePaths,
          fu_selected: true
        });

      },
      fail:function(){
        wx.showModal({
          content: '副页选择失败',
          showCancel:false
        })
      }
    })


  },
  //提交信息
  submit_info: function() {
    this.setData({
     can_not_choose_img:true
    })
    if (this.data.img_zheng && this.data.img_fu){
      let local_img_url = [];
      local_img_url.push(this.data.img_zheng);
      local_img_url.push(this.data.img_fu);
      this.join_pic(local_img_url, function (url) {
        
        if (opt.chooseCarType) {
          app.submit_identity(opt.chooseCarType, 0, 1, url, function (res) {
            wx.redirectTo({
              url: '../identity_success/index?auditStatus=1',
            })
           
          })
        }else{
          wx.showToast({
            title: '缺少参数',
            showCancel:false
          })
        }
      });
    }
   
  },
  //拼接图片
  join_pic: function(data, fn) {
    var that = this;
    //拼接图片
    const ctx = wx.createCanvasContext('myCanvas')
    ctx.drawImage(data[0][0], 0, 0, 300, 200)
    ctx.draw();
    ctx.drawImage(data[1][0], 0, 220, 300, 200)
    ctx.draw(true)
    //拼接图片转存本地路径
    wx.canvasToTempFilePath({
      x: 100,
      y: 200,
      width: 50,
      height: 50,
      destWidth: 100,
      destHeight: 100,
      canvasId: 'myCanvas',
      fileType: 'jpg',
      success: function(res) {
        console.log('拼接图片本地地址', res.tempFilePath)
        //上传图片
        wx.uploadFile({
          url: 'https://resource.ejiayou.com/uploadPic/upload', //仅为示例，非真实的接口地址
          filePath: res.tempFilePath,
          name: 'file',
          header: {
            'content-type': 'image/jpg'
          },
          success: function(res) {
            console.log('上传图片成功', res);
            if (res.statusCode == 200) {
              let dd = JSON.parse(res.data);
              if (dd.img_b) {
                that.setData({
                  res_img: dd.img_b
                })
                if(fn){
                  fn(dd.img_b)
                }
              }
            } else {
              wx.showModal({
                title: '上传图片错误，请重新上传',
                showCancel: false
              })
            }
          },
          fail:function(){
            wx.showModal({
              content: '上传图片失败',
              showCancel:false
            })
          }
        })
      },
      fail:function(){
        wx.showModal({
          content: '拼接图片失败',
          showCancel:false
        })
      }
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