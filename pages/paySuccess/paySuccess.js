// pages/paySuccess/paySuccess.js
var utils = require('../../utils/util.js')
var app = getApp();
var isShowToast = false;
var questionType = ""
var orderId = -1;
var stationId = "";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showModalStatus: false,
    isShowToast: false,
    showCommentModal: false,
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    isShowToast = false;
    this.setData({
      station_name: app.code.fillingStationName,
      orderSum: app.orderSum,
      discount_price: (app.input_price - app.orderSum).toFixed(2)
    })
    orderId = options.orderId;
    if (orderId && orderId != -1) {
      that.getActivityData();
      wx.getStorage({
        key: app.station_id + "",
        success: function(res) {
          if (res.data >= 3) {
            that.getEvaluateInfo(0);
          } else {
            that.getEvaluateInfo(1);
          }
        },
        fail: function() {
          that.getEvaluateInfo(1);
        }
      })
    }
  },
  /**
   * 获取评论数据
   */
  getEvaluateInfo: function(flag) {
    var that = this;
    var json = {}
    json["orderId"] = orderId;
    json["flag"] = flag;
    app.getEvaluateInfo(json, function(ret) {
      if (ret.code == 200) {
        try {
          var showPage = ret.data.showPage;
          if (showPage == 1) {
            var questionDes = ret.data.evaluateQuestionInfo.questionDes;
            questionType = ret.data.evaluateQuestionInfo.type;
            stationId = ret.data.orderInfo.stationId;
            var tempList = [];
            var gradeList = ret.data.evaluateQuestionInfo.gradeList;
            var goodData = {};
            goodData["gradeName"] = gradeList[0].gradeName;
            goodData["score"] = gradeList[0].grade;
            goodData["icon"] = "../../img/common/face_good.png";
            tempList.push(goodData);

            var normalData = {};
            normalData["gradeName"] = gradeList[1].gradeName;
            normalData["score"] = gradeList[1].grade;
            normalData["icon"] = "../../img/common/face_normal.png";
            tempList.push(normalData);

            var badData = {};
            badData["gradeName"] = gradeList[2].gradeName;
            badData["score"] = gradeList[2].grade;
            badData["icon"] = "../../img/common/face_bad.png";
            tempList.push(badData);

            that.setData({
              list: tempList,
              evlQuestion: questionDes
            })
            that.showCommentDialog();
          }
        } catch (err) {
          console.log(JSON.stringify(err))
        }
      } else {
        console.log("获取评论数据失败")
      }
    })
  },
  /**
   * 获取运营弹窗
   */
  getActivityData: function() {
    var that = this;
    var obj = {
      "user_id": app.user_id,
      "order_id": orderId,
      "osType": "5",
      "source": "miniprogram"
    }
    console.log(JSON.stringify(obj));
    app.getActivityData(obj, function(ret) {
      if (ret.code == 200) {
        isShowToast = false;
        that.setData({
          miniData: ret.data,
        })
        //弹窗类型 1为弹窗，2为直接跳转（只支持微信端）
        var popup_type = ret.data.popup_type;
        //弹窗红包 activity_type_id = 6
        var activity_type_id = ret.data.activity_type_id;
        if (activity_type_id == "6") {
          utils.animationUtil("open", that, "redpopupwindow");
          return
        }
        if (popup_type == "1") {
          that.setData({
            imgUrl: ret.data.img_url,
          })
          //显示弹窗
          utils.animationUtil("open", that, "paysuccess");
        }
        if (popup_type == "2") {
          var url = ret.data.url;
          app.activityUrl = url;
          //跳转网页
          if (url) {
            wx.navigateTo({
              url: '../web/web',
            })
          }
        }
      } else {
        that.showToast();
      }
    })
  },
  onShow: function() {
    if (isShowToast) {
      this.showToast();
    }
  },
  showToast: function() {
    var that = this;
    var index = 10;
    return
    var inter = setInterval(function() {
      if (index == 0) {
        clearInterval(inter);
        wx.reLaunch({
          url: '../index/index',
        })
      }
      that.setData({
        isShowToast: true,
        toastMsg: "支付成功，" + index + "s后返回首页"
      })
      index--;
    }, 1000)
  },
  test: function() {
    utils.animationUtil("open", this, "paysuccess");
  },
  onclick: function() {
    isShowToast = true;
    var that = this;
    if (that.data.miniData.appId) {
      //跳转到小程序
      wx.navigateToMiniProgram({
        appId: that.data.miniData.appId,
        path: that.data.miniData.path,
        extraData: that.data.miniData.extraData,
        success(res) {
          // 打开成功
          console.log("小程序打开成功");
        }
      })
    } else {
      //跳转网页
      var url = that.data.miniData.url;
      app.activityUrl = url;
      //跳转网页
      if (url) {
        utils.animationUtil("close", that);
        wx.navigateTo({
          url: '../web/web',
        })
      }
    }
  },
  powerDrawer: function(e) {
    this.showToast();
    var currentStatu = e.currentTarget.dataset.statu;
    utils.animationUtil(currentStatu, this)
  },
  /**
   * 显示动画
   */
  showCommentDialog: function() {
    this.anim = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    })
    this.anim.translateY(448).step()
    this.setData({
      commentAnimationData: this.anim.export(),
      showCommentModal: true
    })
    setTimeout(function() {
      this.anim.translateY(0).step()
      this.setData({
        commentAnimationData: this.anim.export()
      })
    }.bind(this), 50)
  },
  /**
   * 隐藏动画
   */
  hideCommentDialog: function() {
    this.anim = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    })
    this.anim.translateY(448).step()
    this.setData({
      commentAnimationData: this.anim.export(),
      showCommentModal: true
    })
  },
  /**
   * 评论点击事件
   */
  onClickCommentItem: function(ret) {
    var that = this;
    var index = ret.currentTarget.dataset.index;
    var list = that.data.list;
    var score = list[index].score;
    var all_point = questionType + "-" + score;
    console.log("获取的得分：" + questionType + "-" + score)
    var json = {
      "all_point": all_point,
      "comment": '',
      "type": '1',
      "order_id": orderId
    }
    wx.showLoading({
      title: '提交中',
    })
    app.commitEvaluation(json, function(ret) {
      console.log("提交评论的结果：" + JSON.stringify(ret))
      wx.hideLoading();
      if (ret.code == 200) {
        //位置，评论三次不显示了type == 3 是位置,以油站id作为唯一值
        if (questionType == 3) {
          try {
            var evaluateCount = wx.getStorageSync(stationId)
            evaluateCount += 1;
            wx.setStorageSync(stationId, evaluateCount)
          } catch (e) {}
        }
        setTimeout(function() {
          that.hideCommentDialog();
        }, 1000)
        wx.redirectTo({
          url: '../successEvaluate/successEvaluate?type=0&orderId=' + orderId,
        })
      } else {
        console.log("提交评论错误")
      }
    })
  },
  share: function(e) {
    console.log("分享");
    var that = this;
    isShowToast = true;
    utils.animationUtil("close", that);
    if (that.data.miniData.appId) {
      //跳转到小程序
      wx.navigateToMiniProgram({
        appId: that.data.miniData.appId,
        path: that.data.miniData.path,
        extraData: that.data.miniData.extraData,
        // envVersion: 'develop',
        success(res) {
          // 打开成功
          console.log("小程序打开成功");
        }
      })
    }
  }
})