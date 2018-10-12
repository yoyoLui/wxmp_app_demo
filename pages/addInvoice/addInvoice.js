var app = getApp();
var invoiceName, invoiceNum;
Page({
  data: {
    disabled: true,
    textLength: '0/25',
    hiddenLoading: true,
    loadingMsg: '',
    display: 'none',
  },
  onLoad: function (options) {
  },
  bindInputName: function (e) {
    invoiceName = e.detail.value;
    //按钮的状态
    if (invoiceName.length > 0) {
      this.setData({
        disabled: false
      })
    } else {
      this.setData({
        disabled: true
      })
    }
    //字数的长度
    if (invoiceName.length == 25) {
      this.setData({
        textColor: "#FF3B30"
      })
    } else {
      this.setData({
        textColor: "#ccc"
      })
    }
    this.setData({
      textLength: invoiceName.length + '/25'
    })
  },
  bindInputNum: function (e) {
    invoiceNum = e.detail.value;
    if (invoiceNum.length > 0) {
      this.setData({ display: 'block', })
    } else {
      this.setData({ display: 'none', })
    }
  },
  /**
   * 清空税号
   */
  clearNumber: function () {
    this.setData({ numberValue: '' })
  },
  //保存
  saveInvoice: function () {
    // wx.redirectTo({
    //   url: '../invoice/invoice',
    // })
    if (invoiceNum != undefined && invoiceNum != "") {
      invoiceNum = invoiceNum;
    } else {
      invoiceNum = '';
    }
    var that = this;
    var params = {
      "oper": 'add',
      "user_id": app.user_id,
      "invoice_code": invoiceName,
      "invoice_number": invoiceNum
    }
    app.invoiceManager(params, function (json) {
      if (json.code == 200) {
        console.log(json)
        var invoiceId = json.data.max_user_invoice_id;
        //发票信息保存到app中
        app.invoice_id = invoiceId;
        app.invoice_name = invoiceName;
        app.invoice_number = invoiceNum;
        wx.navigateBack();
      }
    })
  }
})
