// pages/commentOther/commentOther.js
var app = getApp();
//是否是第一次评论 1：是第一次，2：不是第一次
var isHasEvaluate = "-1";
var serviceStr, environmentStr, positionStr, oilStr;
var orderId;
var inputComment = "";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    otherCommentList: [],
    disabled: true,
    commentTitle: '',
    commentDes: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    orderId = options.orderId;
    wx.setNavigationBarTitle({
      title: '评价',
    })
    this.getAllCommentList();
  },
  /**
   * 获取评论数据
   */
  getAllCommentList: function() {
    var that = this;
    var json = {
      "orderId": orderId
    }
    wx.showLoading({
      title: '加载中',
    })
    app.getAllCommentList(json, function(ret) {
      wx.hideLoading();
      if (ret.code == 200) {
        var commentDetail = ret.data.commentDetail;
        if (commentDetail) {
          var content = commentDetail.content;
          if (content) {
            isHasEvaluate = "2";
          } else {
            isHasEvaluate = "1";
          }
        } else {
          isHasEvaluate = "1";
        }
        var commentList = ret.data.commentList;
        if (commentList.length > 0) {
          that.setData({
            commentTitle: commentList[0].typeName,
            commentDes: commentList[0].questionComment
          })
        }
        var tempList = [];
        var unCommentList = ret.data.unCommentList;
        for (var i = 0; i < unCommentList.length; i++) {
          var t = unCommentList[i].type;
          var data = {};
          data["title"] = unCommentList[i].typeName + "：";
          data["score"] = "未选择";
          data["isSelect"] = false;
          data["type"] = t;
          data["gradeList"] = unCommentList[i].gradeList;
          if (t == "4") {
            data["icons"] = [
              "../../img/common/face_good_disabled.png",
              "../../img/common/face_normal_disabled.png",
              "../../img/common/face_bad_disabled.png",
              "../../img/common/face_confused_disabled.png",
            ]
          } else {
            data["icons"] = [
              "../../img/common/face_good_disabled.png",
              "../../img/common/face_normal_disabled.png",
              "../../img/common/face_bad_disabled.png",
            ]
          }
          tempList.push(data)
          that.setData({
            otherCommentList: tempList
          })
        }
        console.log("数据：" + JSON.stringify(commentDetail));
      } else {
        console.log("获取其他评论数据失败")
      }
    })
  },
  /**
   * 输入框事件
   */
  inputComment: function(e) {
    inputComment = e.detail.value;
    console.log("输入的评论：" + inputComment)
    var reg = /[^\u0020-\u007E\u00A0-\u00BE\u2E80-\uA4CF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\u0080-\u009F\u2000-\u201f\u2026\u2022\u20ac\r\n]/g;
    if (reg.test(inputComment)) {
      inputComment = inputComment.replace(reg, '').replace(/\s+/g, '');
      console.log("过滤掉表情的评论：" + inputComment)
    }
  },
  /**
   * 提交事件
   */
  submit: function() {
    console.log("submit")
    // var serviceStr, environmentStr, positionStr, oilStr;
    var json = {};
    var strList = [];
    var scoreStr = "";
    if (serviceStr) {
      strList.push(serviceStr)
    }
    if (environmentStr) {
      strList.push(environmentStr)
    }
    if (positionStr) {
      strList.push(positionStr)
    }
    if (oilStr) {
      strList.push(oilStr)
    }
    for (var i = 0; i < strList.length; i++) {
      if(i == strList.length -1) {
        scoreStr = scoreStr + strList[i]
      } else {
        scoreStr = strList[i] + "," + scoreStr
      }
    }
    json["all_point"] = scoreStr;
    json["type"] = isHasEvaluate;
    json["comment"] = inputComment;
    json["order_id"] = orderId;
    console.log(JSON.stringify(json))
    wx.showLoading({
      title: '提交中',
    })
    app.commitEvaluation(json, function(ret) {
      wx.hideLoading();
      if (ret.code == 200) {
        wx.redirectTo({
          url: '../successEvaluate/successEvaluate?type=1',
        })
      } else {
        console.log("提交其他评论失败")
      }
    })
  },
  /**
   * 图片点击事件
   */
  onClickIcon: function(e) {
    var textparent = e.currentTarget.dataset.textparent;
    var iconparent = e.currentTarget.dataset.iconparent;
    var child = e.currentTarget.dataset.child;
    var list = this.data.otherCommentList;
    this.getTexts(iconparent, textparent, child, list);
    this.parseText(textparent, child, list);
    this.parseIcon(parseInt(iconparent), textparent, child, list);
    this.setData({
      otherCommentList: list
    })
    this.setData({
      disabled: !this.checkBtnIsClick()
    })
  },
  /**
   * 获取点击的type + grade
   */
  getTexts: function(iconType, textparent, child, list) {
    console.log(list[textparent].type + "-" + list[textparent].gradeList[child].grade);
    switch (parseInt(iconType)) {
      case 1:
        serviceStr = list[textparent].type + "-" + list[textparent].gradeList[child].grade;
        break
      case 2:
        environmentStr = list[textparent].type + "-" + list[textparent].gradeList[child].grade;
        break
      case 3:
        positionStr = list[textparent].type + "-" + list[textparent].gradeList[child].grade;
        break
      case 4:
        oilStr = list[textparent].type + "-" + list[textparent].gradeList[child].grade;
        break
    }
  },
  /**
   * 检查按钮是否可以被点击
   */
  checkBtnIsClick: function() {
    var list = this.data.otherCommentList;
    for (var i = 0; i < list.length; i++) {
      if (!list[i].isSelect) {
        return false;
      }
    }
    return true;
  },
  /**
   * 处理选中的文字
   */
  parseText: function(parent, child, list) {
    var score = list[parent].score;
    list[parent].isSelect = true
    list[parent].score = list[parent].gradeList[child].gradeName;
  },
  /**
   * 处理选中的图标
   */
  parseIcon: function(parent, iconType, child, list) {
    console.log("type：" + parent);
    this.resetIcon(parent, iconType)
    switch (parent) {
      case 1:
      case 2:
      case 3:
        switch (child) {
          case 0:
            list[iconType].icons[child] = "../../img/common/face_good.png"
            break
          case 1:
            list[iconType].icons[child] = "../../img/common/face_normal.png"
            break
          case 2:
            list[iconType].icons[child] = "../../img/common/face_bad.png"
            break
        }
        break
      case 4:
        switch (child) {
          case 0:
            list[iconType].icons[child] = "../../img/common/face_good.png"
            break
          case 1:
            list[iconType].icons[child] = "../../img/common/face_normal.png"
            break
          case 2:
            list[iconType].icons[child] = "../../img/common/face_bad.png"
            break
          case 3:
            list[iconType].icons[child] = "../../img/common/face_confused.png"
            break
        }
        break
    }
  },
  /**
   * 重置图片
   */
  resetIcon: function(index, iconType) {
    switch (index) {
      case 1:
      case 2:
      case 3:
        this.data.otherCommentList[iconType].icons = [
          "../../img/common/face_good_disabled.png",
          "../../img/common/face_normal_disabled.png",
          "../../img/common/face_bad_disabled.png",
        ]
        break
      case 4:
        this.data.otherCommentList[iconType].icons = [
          "../../img/common/face_good_disabled.png",
          "../../img/common/face_normal_disabled.png",
          "../../img/common/face_bad_disabled.png",
          "../../img/common/face_confused_disabled.png",
        ]
        break
    }
  }
})