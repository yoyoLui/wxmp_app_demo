var app = getApp();
var utilPlugins = require('utilPlugins');

var server = 'https://www.ejiayou.com';
// var server = 'https://dev.ejiayou.com';
var server_api = {
  defaultActivity: server + '/activity/experience/service/mini_apps/access_log/add',//埋点
  getOpenidAndSession_key: server +'/wxapp/user/get_jscode2session',
  get_user_info: server + "/wxapp/user/des_encrypt_data",//获取用户信息
};


function getUserInfo(code, en, iv, fn) { //请求Openid And Session_key//数据放在APP
  var that = this;
  wx.request({
    method: "GET",
    url: server_api.getOpenidAndSession_key,
    data: {
      js_code: code
    },
    success: function (res20) {
      res20 = res20.data;
      console.log("OpenidAndSession_key", res20);
      if (res20.ret == 0) {
        console.log("获取OpenidAndSession_key成功");
        if (fn) {
          fn(res20.data.unionid, res20.data.openid);
        }
      } else {
        wx.showModal({
          showCancel: false,
          title: '错误',
          content: res20.msg
        })
      }
    }
  })
};

  

module.exports = {
  getUserInfo: getUserInfo
}