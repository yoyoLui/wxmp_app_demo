//获取应用实例
var app = getApp()
var closePage;
Page({
  data: {
    msgList: [],
    height: 0,
    scrollY: true,
    deviceInfo: {},
    unselect_icon: '../../img/common/Unselected.png',
    hiddenLoading: true,
    loadingMsg: '加载中',
  },
  swipeCheckX: 35, //激活检测滑动的阈值
  swipeCheckState: 0, //0未激活 1激活
  maxMoveLeft: 75, //消息列表项最大左滑距离
  correctMoveLeft: 75, //显示菜单时的左滑距离
  thresholdMoveLeft: 37,//左滑阈值，超过则显示菜单
  lastShowMsgId: '', //记录上次显示菜单的消息id
  moveX: 0,  //记录平移距离
  showState: 0, //0 未显示菜单 1显示菜单
  touchStartState: 0, // 开始触摸时的状态 0 未显示菜单 1 显示菜单
  swipeDirection: 0, //是否触发水平滑动 0:未触发 1:触发水平滑动 2:触发垂直滑动
  onLoad: function (options) {
    closePage = options.closePage;
    this.deviceInfo = wx.getSystemInfoSync();
    this.pixelRatio = this.deviceInfo.pixelRatio;
    var windowHeight = this.deviceInfo.windowHeight;
    var height = windowHeight;
    this.setData({ height: height });
  },
  onShow: function () {
    this.setData({
      hiddenLoading: false,
      loadingMsg: '加载中'
    })
    this.getInvoiceList(this);
  },
  //获取发票列表
  getInvoiceList: function (that) {
    var params = {
      "oper": 'sel',
      "user_id": app.user_id
    }
    app.invoiceManager(params, function (json) {
      console.log(json)
      if (json.code == 200) {
        var list = json.data;
        for (var i = 0; i < list.length; i++) {
          list[i].selectIcon = '../../img/common/Unselected.png';
          list[i].id = 'id-' + list[i].user_invoice_id;
        }
        that.setData({
          hiddenLoading: true,
          msgList: list
        })
      }
      if (app.invoice_id) {
        that.setSelectIconStatus(app.invoice_id)
      }
    })
  },
  ontouchstart: function (e) {
    if (this.showState === 1) {
      this.touchStartState = 1;
      this.showState = 0;
      this.moveX = 0;
      this.translateXMsgItem(this.lastShowMsgId, 0, 200);
      this.lastShowMsgId = "";
      return;
    }
    this.firstTouchX = e.touches[0].clientX;
    this.firstTouchY = e.touches[0].clientY;
    if (this.firstTouchX > this.swipeCheckX) {
      this.swipeCheckState = 1;
    }
    this.lastMoveTime = e.timeStamp;
  },

  ontouchmove: function (e) {
    if (this.swipeCheckState === 0) {
      return;
    }
    //当开始触摸时有菜单显示时，不处理滑动操作
    if (this.touchStartState === 1) {
      return;
    }
    var moveX = e.touches[0].clientX - this.firstTouchX;
    var moveY = e.touches[0].clientY - this.firstTouchY;
    //已触发垂直滑动，由scroll-view处理滑动操作
    if (this.swipeDirection === 2) {
      return;
    }
    //未触发滑动方向
    if (this.swipeDirection === 0) {
      console.log(Math.abs(moveY));
      //触发垂直操作
      if (Math.abs(moveY) > 4) {
        this.swipeDirection = 2;
        return;
      }
      //触发水平操作
      if (Math.abs(moveX) > 4) {
        this.swipeDirection = 1;
        this.setData({ scrollY: false });
      }
      else {
        return;
      }
    }
    this.lastMoveTime = e.timeStamp;
    //处理边界情况
    if (moveX > 0) {
      moveX = 0;
    }
    //检测最大左滑距离
    if (moveX < -this.maxMoveLeft) {
      moveX = -this.maxMoveLeft;
    }
    this.moveX = moveX;
    this.translateXMsgItem(e.currentTarget.id, moveX, 0);
  },
  ontouchend: function (e) {
    this.swipeCheckState = 0;
    var swipeDirection = this.swipeDirection;
    this.swipeDirection = 0;
    if (this.touchStartState === 1) {
      this.touchStartState = 0;
      this.setData({ scrollY: true });
      return;
    }
    //垂直滚动，忽略
    if (swipeDirection !== 1) {
      return;
    }
    if (this.moveX === 0) {
      this.showState = 0;
      //不显示菜单状态下,激活垂直滚动
      this.setData({ scrollY: true });
      return;
    }
    if (this.moveX === this.correctMoveLeft) {
      this.showState = 1;
      this.lastShowMsgId = e.currentTarget.id;
      return;
    }
    if (this.moveX < -this.thresholdMoveLeft) {
      this.moveX = -this.correctMoveLeft;
      this.showState = 1;
      this.lastShowMsgId = e.currentTarget.id;
    }
    else {
      this.moveX = 0;
      this.showState = 0;
      //不显示菜单,激活垂直滚动
      this.setData({ scrollY: true });
    }
    this.translateXMsgItem(e.currentTarget.id, this.moveX, 300);
    //this.(e.currentTarget.id, 0, 0);
  },
  onDeleteMsgTap: function (e) {
    this.deleteMsgItem(e);
  },
  onDeleteMsgLongtap: function (e) {
    console.log(e);
  },
  getItemIndex: function (id) {
    var msgList = this.data.msgList;
    for (var i = 0; i < msgList.length; i++) {
      if (msgList[i].id === id) {
        return i;
      }
    }
    return -1;
  },
  deleteMsgItem: function (e) {
    this.setData({
      hiddenLoading: false,
      loadingMsg: '删除中',
    })
    var animation = wx.createAnimation({ duration: 200 });
    var that = this;
    var invoiceId = e.currentTarget.dataset.id;
    var params = {
      "oper": 'del',
      "user_id": app.user_id,
      "user_invoice_id": invoiceId
    }
    app.invoiceManager(params, function (ret) {
      console.log(JSON.stringify(ret))
      if (ret.code == 200) {
        that.setData({
          hiddenLoading: true,
        })
        // animation.height(0).opacity(0).step();
        // that.animationMsgWrapItem(e.currentTarget.id, animation);
        // that.showState = 0;
        // that.setData({ scrollY: true });
        that.getInvoiceList(that);
      }
    });
  },
  translateXMsgItem: function (id, x, duration) {
    var animation = wx.createAnimation({ duration: duration });
    animation.translateX(x).step();
    this.animationMsgItem(id, animation);
  },
  animationMsgItem: function (id, animation) {
    var index = this.getItemIndex(id);
    var param = {};
    var indexString = 'msgList[' + index + '].animation';
    param[indexString] = animation.export();
    this.setData(param);
  },
  animationMsgWrapItem: function (id, animation) {
    var index = this.getItemIndex(id);
    var param = {};
    var indexString = 'msgList[' + index + '].wrapAnimation';
    param[indexString] = animation.export();
    this.setData(param);
  },

  // item click event
  onClickItem: function (e) {
    closePage = 1;
    var index = e.currentTarget.dataset.index
    this.setSelectIconStatus(index)
    console.log(index);
  },

  unNeedInvoiceClick: function () {
    closePage = 1;
    this.setSelectIconStatus(-1)
  },

  setSelectIconStatus: function (index) {
    var invoice_code, invoice_number, invoice_id;
    var list = this.data.msgList;
    this.setData({
      unselect_icon: '../../img/common/Unselected.png'
    })
    for (var i = 0; i < list.length; i++) {
      if (index == -1) {
        this.setData({
          unselect_icon: '../../img/common/Selected.png'
        })
        list[i].selectIcon = '../../img/common/Unselected.png'
        app.invoice_id = -1;
        app.invoice_name = "不要发票";

        // 缓存
        wx.setStorage({
          key: 'invoice_name',
          data: "不要发票",
        });
        wx.setStorage({
          key: 'invoice_number',
          data: '',
        })
        wx.setStorage({
          key: 'invoice_id',
          data: '-1',
        })
      } else if (index == list[i].user_invoice_id) {
        list[i].selectIcon = '../../img/common/Selected.png'
        app.invoice_name = list[i].invoice_code;
        app.invoice_number = list[i].invoice_number;
        app.invoice_id = list[i].user_invoice_id;

        // 缓存
        wx.setStorage({
          key: 'invoice_name',
          data: list[i].invoice_code,
        });
        wx.setStorage({
          key: 'invoice_number',
          data: list[i].invoice_number,
        })
        wx.setStorage({
          key: 'invoice_id',
          data: list[i].user_invoice_id,
        })
      } else {
        list[i].selectIcon = '../../img/common/Unselected.png'
      }      
    }
    this.setData({
      msgList: list
    })
    //若果来自输入金额页面，不会主动跳转，只有点击后才会跳转
    if (closePage == 1) {
      wx.navigateBack();
    }
  },

  addInvoiceBtn: function () {
    closePage == 0;
    wx.navigateTo({
      url: '../addInvoice/addInvoice'
    })
  }
})