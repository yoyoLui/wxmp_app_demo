var app = getApp();
//打开设置页，wx.openSetting基础库 1.1.0 开始支持，低版本需做兼容处理
function openSettingSuccess(fn) {
  if (wx.openSetting) {
    openSettingLoop(function () {
      fn();
    });
  } else {
    wx.showModal({
      title: '提示',
      content: '请前往设置-打开用户信息，并重试',
      showCancel: false
    })
  }
}
function openSettingLoop(fun) {
  wx.openSetting({
    success: (res) => {
      if (res.authSetting['scope.userInfo']) {
        console.log('成功打开用户信息，getSetting res=' + JSON.stringify(res));
        fun();
      } else {
        console.log('拒绝授权用户信息,重新打开设置页');
        wx.showModal({
          title: '',
          content: '同意授权才可使用，易加油不会将您的信息提供给第三方',
          showCancel: false,
          success: function () {
            openSettingLoop(fun);
          }
        })
      }
    }
  })
}

function openSettingSuccess_location(fn) {
  if (wx.openSetting) {
    openSettingLoop_location(function () {
      fn();
    });
  } else {
    wx.showModal({
      title: '提示',
      content: '请前往设置-打开定位，并重试',
      showCancel: false
    })
  }
}
function openSettingLoop_location(fun) {
  wx.openSetting({
    success: (res) => {
      if (res.authSetting['scope.getLocation']) {
        console.log('成功打开定位信息，getSetting res=' + JSON.stringify(res));
        fun();
      } else {
        console.log('拒绝打开定位信息,重新打开设置页');
        wx.showModal({
          title: '',
          content: '同意授权定位信息才可使用，易加油不会将您的信息提供给第三方',
          showCancel: false,
          success: function () {
            openSettingLoop(fun);
          }
        })
      }
    }
  })
}

//获取登录信息

function getCodeAndIV(fun) {
  var hasLogin;
  var hasGetUserInfo;
  //获取登录信息
  wx.login({
    success: function (res_login_data) {
      console.log('login is' + JSON.stringify(res_login_data));
      app.login_data = res_login_data;
      hasLogin = true;
    }
  });

  wx.getUserInfo({//首先跟微信拿user_info_data,然后decryptedData跟后端获取用户完整信息
    success: function (res_user_info_data) {
      app.user_info_data = res_user_info_data;
      hasGetUserInfo = true;
    },
    fail: function (res) {
      openSettingSuccess(function () {
        wx.getUserInfo({//首先跟微信拿user_info_data,然后decryptedData跟后端获取用户完整信息
          success: function (res_res_user_info_data) {
            app.user_info_data = res_res_user_info_data;
            hasGetUserInfo = true;
          },
        });
      });
    }
  })
  var _timer = setInterval(function () {
    if (hasLogin && hasGetUserInfo) {
      clearInterval(_timer);
      if (fun) {
        fun(app.login_data.code, app.user_info_data.encryptedData, app.user_info_data.iv);
      }
    }
  }, 100);
}

module.exports = {
  openSettingSuccess: openSettingSuccess,       //打开设置页面
  openSettingSuccess_location: openSettingSuccess_location,  //打开定位
  getCodeAndIV: getCodeAndIV,                      //获取用户信息
}