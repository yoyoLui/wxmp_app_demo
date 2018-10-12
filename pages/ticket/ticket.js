var app = getApp();
var ticket_data = app.ticketList;
// ticket_data.couponInfoToExPayList = require('data').couponInfoToExPayList;
// ticket_data.inputNum = 111;
// ticket_data.avlCouponNum = 6;
// ticket_data.invalidCouponNum = 4;
Page({
  data: {
    show_page: false, //控制优惠券页面显示隐藏，带有动画效果，初始化隐藏
    ticket_data: ticket_data, //优惠券数据
    merchandiseSelect: {
      userCouponId: ''
    },
  },
  onLoad: function () {

  },
  onShow: function () {
    var that = this;
    ticket_data = app.ticketList;
    if (ticket_data.nowSelect) {
      that.setData({
        merchandiseSelect: {
          userCouponId: ticket_data.nowSelect  //默认勾选的优惠券id
        }
      });
    }
    that.can_not_use_ticket_to_disabled(ticket_data, ticket_data.inputNum, function (res) {
      ticket_data = res;
      ticket_data.couponInfoToExPayList.forEach(function (obj, i) {
        if (obj.couponType == 2 && obj.value) {
          obj['value1'] = obj.value.split('.')[0];
          obj['value2'] = obj.value.split('.')[1];
        }
        if (obj.couponType == 1) {
          obj.color = 'ticket_item_top orange';
        }
        if (obj.couponType == 2) {
          obj.color = 'ticket_item_top orange';
        }
        if (obj.couponType == 3) {
          obj.color = 'ticket_item_top blue';
        }
        if (obj.couponType == 6) {
          obj.color = 'ticket_item_top orange';
        }
      });
      ticket_data.couponInfoToExPayList=ticket_data.couponInfoToExPayList.sort(compare('couponType'));
      that.setData({
        ticket_data: ticket_data
      });
    });
  },
  onHide: function () {
    app.ticketList = ticket_data;
  },
  clickTicket_item: function (e) {
    var that = this;
    // e.currentTarget.dataset.id=''是点击不使用优惠券，e.currentTarget.dataset.id=使用优惠券
    if (e.currentTarget.dataset.id) {
      that.data.ticket_data.couponInfoToExPayList.forEach(function (obj) {
        if (e.currentTarget.dataset.id == obj.userCouponId) {
          that.setData({//更改选中优惠券id
            merchandiseSelect: {
              userCouponId: obj.userCouponId
            }
          });
          ticket_data.nowSelect = obj.userCouponId;
          ticket_data.userSelect = true;
        }
      })
    } else {
      ticket_data.nowSelect = ''; //不使用优惠券
      ticket_data.userSelect = true;
      that.setData({
        merchandiseSelect: {
          userCouponId: ''
        }
      });
    }
  },
  //未满可用金额数据处理
  can_not_use_ticket_to_disabled: function (ticket_data_origin, input_num, fn) {
    var _data = ticket_data_origin;
    if (input_num) {
      _data.couponInfoToExPayList.forEach(function (obj) {
        if (obj.couponType == 1 || obj.couponType == 0) { //现金券
          if (parseFloat(input_num) < parseFloat(obj.value) && obj.enabled == 1) {
            obj.enabled = 2;
            obj.unavailableCause = "未满可用金额";
            _data.avlCouponNum = parseInt(_data.avlCouponNum) - 1;
            _data.invalidCouponNum = parseInt(_data.invalidCouponNum) + 1;
          }
          //输入金额小于满减金额
          if (parseFloat(input_num) < parseFloat(obj.limitMoney) && obj.enabled == 1) {
            obj.enabled = 2;
            obj.unavailableCause = "未满可用金额";
            _data.avlCouponNum = parseInt(_data.avlCouponNum) - 1;
            _data.invalidCouponNum = parseInt(_data.invalidCouponNum) +
              1;
          }
        }

      });

    } else {



      
      //没有输入金额
      _data.couponInfoToExPayList.forEach(function (obj) {
        if (obj.enabled ==1){
          obj.enabled = 2;
          obj.unavailableCause = "未满可用金额";
          _data.avlCouponNum = parseInt(_data.avlCouponNum) - 1;
          _data.invalidCouponNum = parseInt(_data.invalidCouponNum) + 1;
        }
       
      })
    }
    if (fn) {
      fn(_data);
    }
  },
  changeTicketColor: function (a) {
    switch (a) {
      case 1:
        return 'ticket_item_top orange';
      case 2:
        return 'ticket_item_top purple';
      case 3:
        return ' ticket_item_top blue';
      default:
        return 'ticket_item_top orange';
    }
  },
})
function compare(property) {
  return function (a, b) {
    var value1 = a[property];
    var value2 = b[property];
    return value1 - value2;
  }
}