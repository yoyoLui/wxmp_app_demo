var md5Utils = require('md5Utils.js')

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 统一下单签名算法
 */
function createSign(param, appSecret) {
  var signStr = "";
  for (var key in param) {
    var value = param[key];
    if (null != value && value != "" && key != "sign" && key != "key") {
      signStr += key + "=" + param[key] + "&";
    }
  }
  signStr += "key=" + appSecret;
  signStr = md5Utils.md5(signStr).toUpperCase();
  return signStr;
}

/**
 * 计算金额函数
 * 注意:
 * 	1)代码中不能使用单引号，因为微信中使用eval('')操作
 * 	2)代码最好去掉所有空格，使用压缩工具:http://tool.oschina.net/jscompress
 *  3)算法配置在:ejiayou_count_money表中
 *  selectMerchandiseJson = {"merchandiseId" : "1" , "merchandiseType" : "1" , "merchandiseValue" : "5" , "limitMoney" : "20" ,"addOnEjiayou" : "1" }
 *	merchandiseJsonList = [ {"merchandiseId" : "1" , "merchandiseType" : "1" , "merchandiseValue" : "5" , "limitMoney" : "20" , "addOnEjiayou" : "1"} , {"merchandiseId" : "2" , "merchandiseType" : "2" , "merchandiseValue" : "0.65" , "limitMoney" : "10"  , "addOnEjiayou" : "1"} ]
 */

function getInfoByInput(inputMoney, countryPrice, stationPrice, ejiayouPrice, merchandiseJsonList, selectMerchandiseJson, isPassUserLimitCount, userWantedCoupon) {
  Number.prototype.toFixed = function (len) {
    var add = 0;
    var s, temp;
    var s1 = this + "";
    var start = s1.indexOf(".");
    if (start > 0) {
      if (s1.substr(start + len + 1, 1) >= 5) add = 1;
    }
    var temp = Math.pow(10, len);
    s = Math.floor(numMulti(this, temp)) + add;
    return s / temp;
  };

  var changeTwoDecimal_f = function (x) {
    var f_x = parseFloat(x);
    if (isNaN(f_x)) {
      return false;
    }
    var f_x = Math.round(x * 100) / 100;
    var s_x = f_x.toString();
    var pos_decimal = s_x.indexOf(".");
    if (pos_decimal < 0) {
      pos_decimal = s_x.length;
      s_x += ".";
    }
    while (s_x.length <= pos_decimal + 2) {
      s_x += "0";
    }
    return s_x;
  };

  var numMulti = function (num1, num2) {
    var baseNum = 0;
    try {
      baseNum += num1.toString().split(".")[1].length;
    } catch (e) {
    }
    try {
      baseNum += num2.toString().split(".")[1].length;
    } catch (e) {
    }
    return Number(num1.toString().replace(".", "")) * Number(num2.toString().replace(".", "")) / Math.pow(10, baseNum);
  };

  var checkParam = function (target) {
    if (!target || null == target || undefined == target || "" == target || "null" == target) {
      return false;
    }
    return true;
  };

  var getMerchandise = function (list, select, inputValue, isAuto) {

    if (checkParam(select) && select.merchandiseType == 1 && inputValue >= parseFloat(select.limitMoney)) {
      return select;
    }

    if (checkParam(select) && select.merchandiseType == 2) {
      return select;
    }

    //是否自动赛选
    if (isAuto != 1) {
      return null;
    }

    select = null;
    var resultSelect = null;
    for (var i = 0; i < list.length; i++) {
      select = list[i];
      if (select.merchandiseType == 2) {
        resultSelect = select;
        break;
      }
      if (select.merchandiseType == 1 && inputValue >= parseFloat(select.limitMoney)) {
        resultSelect = select;
        break;
      }
    }

    return resultSelect;

  };

  var result = {
    oilMass: "0",
    countryPrice: "",
    stationReduce: "",
    ejiayouReduce: "",
    merchandiseReduce: "",
    merchandiseSelect: {},
    orderSum: "0"
  };

  try {


    if (!checkParam(countryPrice) || isNaN(countryPrice)) {
      return JSON.stringify(result);
    }
    if (!checkParam(stationPrice) || isNaN(stationPrice)) {
      return JSON.stringify(result);
    }
    if (!checkParam(inputMoney) || isNaN(inputMoney) || inputMoney <= 0) {
      return JSON.stringify(result);
    }
    if (!checkParam(ejiayouPrice) || isNaN(ejiayouPrice) || ejiayouPrice <= 0) {
      ejiayouPrice = stationPrice;
    }
    if (ejiayouPrice == stationPrice || parseFloat(ejiayouPrice) == parseFloat(stationPrice)) {
      isPassUserLimitCount = 0;
    }

    var inputMoney = parseFloat((inputMoney + "").trim());
    var countryPrice = parseFloat((countryPrice + "").trim());
    var stationPrice = parseFloat((stationPrice + "").trim());
    var ejiayouPrice = parseFloat((ejiayouPrice + "").trim());
    var merchandiseJsonList = (checkParam(merchandiseJsonList) ? JSON.parse(merchandiseJsonList) : []);
    var selectMerchandiseJson = (checkParam(selectMerchandiseJson) ? JSON.parse(selectMerchandiseJson) : null);

    //计算升数
    var mass = changeTwoDecimal_f(inputMoney / stationPrice);
    result.oilMass = mass;

    //计算国家价金额
    var countryValue = numMulti(mass, countryPrice);
    var stationReduce = countryValue - inputMoney;
    countryValue = countryValue.toFixed(2);
    stationReduce = stationReduce.toFixed(2);
    if (stationReduce > 0 && parseFloat(countryPrice) > parseFloat(stationPrice)) {
      result.countryPrice = "国家价" + countryValue + "元，本站直降";
      result.stationReduce = "￥" + stationReduce;
    }

    //计算易加油优惠
    var ejiayouValue = numMulti(mass, ejiayouPrice);
    ejiayouValue = ejiayouValue.toFixed(2);
    var ejiayouReduce = inputMoney - ejiayouValue;
    ejiayouReduce = ejiayouReduce.toFixed(2);
    if (ejiayouReduce > 0 && stationPrice > ejiayouPrice) {
      result.ejiayouReduce = "-" + ejiayouReduce + "元";
    }

    //计算优惠券优惠
    var merchandise = getMerchandise(merchandiseJsonList, selectMerchandiseJson, inputMoney, userWantedCoupon);
    var mvalue = 0;
    var addOnEjiayou = 1;
    var orderSum = 0;

    if (checkParam(merchandise)) {

      if (merchandise.merchandiseType == 1) {
        mvalue = parseFloat(merchandise.merchandiseValue);
      } else {
        var discount = merchandise.merchandiseValue * 100;
        discount = (1000 - discount) / 1000;
        discount = discount.toFixed(2);
        mvalue = numMulti(discount, inputMoney);
        mvalue = mvalue.toFixed(2);
        mvalue = (mvalue > merchandise.limitMoney ? merchandise.limitMoney : mvalue);
      }

      addOnEjiayou = merchandise.addOnEjiayou;
      result.merchandiseReduce = "-" + mvalue + "元";
      result.merchandiseSelect = merchandise;
    }

    //如果用户每天优惠次数达上线,则不能再享受易加油优惠
    if (isPassUserLimitCount == 0) {
      result.ejiayouReduce = "";
      var orderSum = inputMoney - mvalue;
      result.orderSum = orderSum.toFixed(2) + "";
      return JSON.stringify(result);
    }

    //如果用户今天还能享受优惠
    else {

      //如果优惠券不能与其他优惠叠加
      if (addOnEjiayou == 0) {
        result.ejiayouReduce = "";
        var orderSum = inputMoney - mvalue;
        result.orderSum = orderSum.toFixed(2) + "";
      }

      //优惠券能与其他优惠叠加
      else {
        var orderSum = inputMoney - mvalue - (ejiayouReduce > 0 ? ejiayouReduce : 0);
        result.orderSum = orderSum.toFixed(2) + "";
      }

      return JSON.stringify(result);

    }

  } catch (e) {
    JSON.stringify(result);
  }

}

/**
 * json转xml
 */
function jsonToXml(json, appendXml) {
  var xmlStr = "<xml>";
  for (var key in json) {
    xmlStr += "<" + key + ">" + json[key] + "</" + key + ">";
  }

  if (appendXml) {
    xmlStr += appendXml;
  }

  xmlStr += "</xml>"
  return xmlStr;
}

/**
 * xml字符串转xml对象
 */
function parseXml(xmlString) {
  var xmlDoc = null;
  //判断浏览器的类型
  //支持IE浏览器
  if (!DOMParser && ActiveXObject) { //window.DOMParser 判断是否是非ie浏览器
    var xmlDomVersions = ['MSXML.2.DOMDocument.6.0', 'MSXML.2.DOMDocument.3.0', 'Microsoft.XMLDOM'];
    for (var i = 0; i < xmlDomVersions.length; i++) {
      try {
        xmlDoc = new ActiveXObject(xmlDomVersions[i]);
        xmlDoc.async = false;
        xmlDoc.loadXML(xmlString); //loadXML方法载入xml字符串
        break;
      } catch (e) {
      }
    }
  }
  //支持Mozilla浏览器
  else if (DOMParser) {
    try {
      /* DOMParser 对象解析 XML 文本并返回一个 XML Document 对象。
      * 要使用 DOMParser，使用不带参数的构造函数来实例化它，然后调用其 parseFromString() 方法
      * parseFromString(text, contentType) 参数text:要解析的 XML 标记 参数contentType文本的内容类型
      * 可能是 "text/xml" 、"application/xml" 或 "application/xhtml+xml" 中的一个。注意，不支持 "text/html"。
      */
      domParser = new DOMParser();
      xmlDoc = domParser.parseFromString(xmlString, 'text/xml');
    } catch (e) {
    }
  }
  else {
    return null;
  }
  return xmlDoc;
}

/**
 * xml转json
 */
function xmlToJson(xml, obj) {
  console.log(xml);
  var json = obj || {};

  if (xml.nodeType == 1) {
    json[xml.nodeName] = xml.textContent;
  }
  if (xml.hasChildNodes()) {
    var children = xml.children;
    if (children.length > 0 && xml.nodeType == 1) {
      json[xml.nodeName] = {};
      for (var i = 0; i < children.length; i++) {
        var item = children.item(i);
        var returnJson = xmlToJson(item);
        json[xml.nodeName][item.nodeName] = returnJson[item.nodeName];
      }
    } else {
      for (var i = 0; i < children.length; i++) {
        json = xmlToJson(children.item(i), json);
      }
    }
  }

  return json;
};

/**
 * 弹窗动画
 */
function animationUtil(statu, that, t) {
  /* 动画部分 */
  // 第1步：创建动画实例 
  var animation = wx.createAnimation({
    duration: 150, //动画时长 
    timingFunction: "linear", //线性 
    delay: 0 //0则不延迟 
  });
  // 第2步：这个动画实例赋给当前的动画实例 
  that.animation = animation;
  // 第3步：执行第一组动画 
  animation.opacity(0).rotateX(-100).step();
  // 第4步：导出动画对象赋给数据对象储存 
  that.setData({
    animationData: animation.export()
  })
  // 第5步：设置定时器到指定时候后，执行第二组动画 
  setTimeout(function () {
    // 执行第二组动画 
    animation.opacity(1).rotateX(0).step();
    // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
    that.setData({
      animationData: animation
    })
    //关闭 
    if (statu == "close") {
      that.setData(
        {
          showModalStatus: ""
        }
      );
    }
  }.bind(that), 200)
  // 显示 
  if (statu == "open") {
    that.setData(
      {
        showModalStatus: t
      }
    );
  }
};

/**
 * Created by Wandergis on 2015/7/8.
 * 提供了百度坐标（BD09）、国测局坐标（火星坐标，GCJ02）、和WGS84坐标系之间的转换
 */

//定义一些常量
var x_PI = 3.14159265358979324 * 3000.0 / 180.0;
var PI = 3.1415926535897932384626;
var a = 6378245.0;
var ee = 0.00669342162296594323;

/**
 * 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换
 * 即 百度 转 谷歌、高德
 * @param bd_lon
 * @param bd_lat
 * @returns {*[]}
 */
function bd09togcj02(bd_lon, bd_lat) {
  var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
  var x = bd_lon - 0.0065;
  var y = bd_lat - 0.006;
  var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
  var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
  var gg_lng = z * Math.cos(theta);
  var gg_lat = z * Math.sin(theta);
  return [gg_lng, gg_lat]
}

/**
 * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
 * 即谷歌、高德 转 百度
 * @param lng
 * @param lat
 * @returns {*[]}
 */
function gcj02tobd09(lng, lat) {
  var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
  var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI);
  var bd_lng = z * Math.cos(theta) + 0.0065;
  var bd_lat = z * Math.sin(theta) + 0.006;
  return [bd_lng, bd_lat]
}

/**
 * WGS84转GCj02
 * @param lng
 * @param lat
 * @returns {*[]}
 */
function wgs84togcj02(lng, lat) {
  if (out_of_china(lng, lat)) {
    return [lng, lat]
  }
  else {
    var dlat = transformlat(lng - 105.0, lat - 35.0);
    var dlng = transformlng(lng - 105.0, lat - 35.0);
    var radlat = lat / 180.0 * PI;
    var magic = Math.sin(radlat);
    magic = 1 - ee * magic * magic;
    var sqrtmagic = Math.sqrt(magic);
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
    dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
    var mglat = lat + dlat;
    var mglng = lng + dlng;
    return [mglng, mglat]
  }
}

/**
 * GCJ02 转换为 WGS84
 * @param lng
 * @param lat
 * @returns {*[]}
 */
function gcj02towgs84(lng, lat) {
  if (out_of_china(lng, lat)) {
    return [lng, lat]
  }
  else {
    var dlat = transformlat(lng - 105.0, lat - 35.0);
    var dlng = transformlng(lng - 105.0, lat - 35.0);
    var radlat = lat / 180.0 * PI;
    var magic = Math.sin(radlat);
    magic = 1 - ee * magic * magic;
    var sqrtmagic = Math.sqrt(magic);
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
    dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
    mglat = lat + dlat;
    mglng = lng + dlng;
    return [lng * 2 - mglng, lat * 2 - mglat]
  }
}

function transformlat(lng, lat) {
  var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
  return ret
}

function transformlng(lng, lat) {
  var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
  return ret
}

/**
 * 判断是否在国内，不在国内则不做偏移
 * @param lng
 * @param lat
 * @returns {boolean}
 */
function out_of_china(lng, lat) {
  return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false);
}

module.exports = {
  formatTime: formatTime,
  getInfoByInput: getInfoByInput,
  createSign: createSign,
  jsonToXml: jsonToXml,
  xmlToJson: xmlToJson,
  parseXml: parseXml,
  animationUtil: animationUtil,
  bd09togcj02: bd09togcj02,
  gcj02tobd09: gcj02tobd09,
  wgs84togcj02: wgs84togcj02,
  gcj02towgs84: gcj02towgs84
}
