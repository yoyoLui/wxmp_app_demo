// pages/setPwd/setPwd.js
var title, firstInputPwd, secondInputPwd;
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 输入框参数设置
    inputData: {
      input_value: "",//输入框的初始内容
      value_length: 0,//输入框密码位数
      isNext: false,//是否有下一步的按钮
      get_focus: true,//输入框的聚焦状态
      focus_class: true,//输入框聚焦样式
      value_num: [1, 2, 3, 4, 5, 6],//输入框格子数
      height: "104rpx",//输入框高度
      width: "686rpx",//输入框宽度
      see: false,//是否明文展示
      interval: true,//是否显示间隔格子
    },
  },
  valueSix: function (e) {
    console.log(e.detail);
    if (title == undefined) {
      firstInputPwd = e.detail;
      wx.redirectTo({
        url: '../setPwd/setPwd?title=请再次输入以确认',
      })
    }
    if (title == "请再次输入以确认") {
      secondInputPwd = e.detail;
      //检查密码是否一致
      if (firstInputPwd == secondInputPwd) {
        var json = {
          "oldPwd": secondInputPwd,
          "newPwd": secondInputPwd,
          "type": 1,
          "userId": app.user_id
        }
        app.updatePassWord(json, function (ret) {
          console.log(ret)
          if (ret.code == 200 && ret.data.status == 1) {
            //成功
            wx.redirectTo({
              url: '../setPwdSuccess/setPwdSuccess',
            })
          } else {
            //失败
          }
        });
      } else {
        //提示密码输入不一致
      }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    title = options.title;
    console.log(title)
    if (title == undefined) {
      this.setData({ title: "请输入新的电子油卡支付密码" })
    } else {
      this.setData({ title: options.title })
    }
  },
})