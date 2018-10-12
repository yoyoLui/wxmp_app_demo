/**
 * 根据输入金额计算结果
 */
function getInfoByInput(inputMoney, countryPrice, stationPrice, ejiayouPrice, merchandiseJsonList,
    selectMerchandiseJson, isPassUserLimitCount, userWantedCoupon) {
    Number.prototype.toFixed = function(len) {
        var add = 0;
        var s, temp;
        var s1 = this + "";
        var start = s1.indexOf(".");
        if (start > 0) {
            if (s1.substr(start + len + 1, 1) >= 5) {
                add = 1
            }
        }
        var temp = Math.pow(10, len);
        s = Math.floor(numMulti(this, temp)) + add;
        return s / temp
    };
    var changeTwoDecimal_f = function(x) {
        var f_x = parseFloat(x);
        if (isNaN(f_x)) {
            return false
        }
        var f_x = Math.round(x * 100) / 100;
        var s_x = f_x.toString();
        var pos_decimal = s_x.indexOf(".");
        if (pos_decimal < 0) {
            pos_decimal = s_x.length;
            s_x += "."
        }
        while (s_x.length <= pos_decimal + 2) {
            s_x += "0"
        }
        return s_x
    };
    var numMulti = function(num1, num2) {
        var baseNum = 0;
        try {
            baseNum += num1.toString().split(".")[1].length
        } catch (e) {}
        try {
            baseNum += num2.toString().split(".")[1].length
        } catch (e) {}
        return Number(num1.toString().replace(".", "")) * Number(num2.toString().replace(".", "")) / Math.pow(
            10, baseNum)
    };
    var checkParam = function(target) {
        if (!target || null == target || undefined == target || "" == target || "null" == target) {
            return false
        }
        return true
    };
    var getMerchandise = function(list, select, inputValue, isAuto) {
        if (checkParam(select) && select.merchandiseType == 1 && inputValue >= parseFloat(select.limitMoney)) {
            return select
        }
        if (checkParam(select) && select.merchandiseType == 2) {
            return select
        }
        if (isAuto != 1) {
            return null
        }
        select = null;
        var resultSelect = null;
        for (var i = 0; i < list.length; i++) {
            select = list[i];
            if (select.merchandiseType == 2) {
                resultSelect = select;
                break
            }
            if (select.merchandiseType == 1 && inputValue >= parseFloat(select.limitMoney)) {
                resultSelect = select;
                break
            }
        }
        return resultSelect
    };
    var result = {
        oilMass: "0",
        countryPrice: "",
        stationReduce: "",
        ejiayouReduce: "",
        ejiayouReduceValue: 0,
        merchandiseReduce: "",
        merchandiseReduceValue: 0,
        merchandiseSelect: {},
        orderSum: "0"
    };
    try {
        if (!checkParam(countryPrice) || isNaN(countryPrice)) {
            return JSON.stringify(result)
        }
        if (!checkParam(stationPrice) || isNaN(stationPrice)) {
            return JSON.stringify(result)
        }
        if (!checkParam(inputMoney) || isNaN(inputMoney) || inputMoney <= 0) {
            return JSON.stringify(result)
        }
        if (!checkParam(ejiayouPrice) || isNaN(ejiayouPrice) || ejiayouPrice <= 0) {
            ejiayouPrice = stationPrice
        }
        if (ejiayouPrice == stationPrice || parseFloat(ejiayouPrice) == parseFloat(stationPrice)) {
            isPassUserLimitCount = 0
        }
        var inputMoney = parseFloat((inputMoney + "").trim());
        var countryPrice = parseFloat((countryPrice + "").trim());
        var stationPrice = parseFloat((stationPrice + "").trim());
        var ejiayouPrice = parseFloat((ejiayouPrice + "").trim());
        var merchandiseJsonList = (checkParam(merchandiseJsonList) ? JSON.parse(merchandiseJsonList) : []);
        var selectMerchandiseJson = (checkParam(selectMerchandiseJson) ? JSON.parse(selectMerchandiseJson) :
            null);
        var mass = changeTwoDecimal_f(inputMoney / stationPrice);
        result.oilMass = mass;
        var countryValue = numMulti(mass, countryPrice);
        var stationReduce = countryValue - inputMoney;
        countryValue = countryValue.toFixed(2);
        stationReduce = stationReduce.toFixed(2);
        if (stationReduce > 0 && parseFloat(countryPrice) > parseFloat(stationPrice)) {
            result.countryPrice = "国家价" + countryValue + "元，本站已直降";
            result.stationReduce = "￥" + stationReduce
        }
        var ejiayouValue = numMulti(mass, ejiayouPrice);
        ejiayouValue = ejiayouValue.toFixed(2);
        var ejiayouReduce = inputMoney - ejiayouValue;
        ejiayouReduce = ejiayouReduce.toFixed(2);
        if (ejiayouReduce > 0 && stationPrice > ejiayouPrice) {
            result.ejiayouReduce = "-" + ejiayouReduce + "元";
            result.ejiayouReduceValue = ejiayouReduce
        }
        var merchandise = getMerchandise(merchandiseJsonList, selectMerchandiseJson, inputMoney,
            userWantedCoupon);
        var mvalue = 0;
        var addOnEjiayou = 1;
        var orderSum = 0;
        if (checkParam(merchandise)) {
            if (merchandise.merchandiseType == 1) {
                mvalue = parseFloat(merchandise.merchandiseValue)
            } else {
                var discount = merchandise.merchandiseValue * 100;
                discount = (1000 - discount) / 1000;
                discount = discount.toFixed(3);
                mvalue = numMulti(discount, inputMoney);
                mvalue = mvalue.toFixed(2);
                mvalue = (mvalue > merchandise.limitMoney ? merchandise.limitMoney : mvalue)
            }
            addOnEjiayou = merchandise.addOnEjiayou;
            result.merchandiseReduce = "-" + mvalue + "元";
            result.merchandiseReduceValue = mvalue;
            result.merchandiseSelect = merchandise
        }
        if (isPassUserLimitCount == 0) {
            result.ejiayouReduce = "";
            result.ejiayouReduceValue = 0;
            var orderSum = inputMoney - mvalue;
            result.orderSum = orderSum.toFixed(2) + "";
            return JSON.stringify(result)
        } else {
            if (addOnEjiayou == 0) {
                result.ejiayouReduce = "";
                result.ejiayouReduceValue = 0;
                var orderSum = inputMoney - mvalue;
                result.orderSum = orderSum.toFixed(2) + ""
            } else {
                var orderSum = inputMoney - mvalue - (ejiayouReduce > 0 ? ejiayouReduce : 0);
                result.orderSum = orderSum.toFixed(2) + ""
            }
            return JSON.stringify(result)
        }
    } catch (e) {
        JSON.stringify(result)
    }
}

/**
 * 抽佣计算金额
 */
function getInfoByInput2(inputMoney, countryPrice, stationPrice, ejiayouPrice, merchandiseJsonList,
    selectMerchandiseJson, isPassUserLimitCount, userWantedCoupon) {
    Number.prototype.toFixed = function(len) {
        var add = 0;
        var s, temp;
        var s1 = this + "";
        var start = s1.indexOf(".");
        if (start > 0) {
            if (s1.substr(start + len + 1, 1) >= 5) {
                add = 1
            }
        }
        var temp = Math.pow(10, len);
        s = Math.floor(numMulti(this, temp)) + add;
        return s / temp
    };
    var changeTwoDecimal_f = function(x) {
        var f_x = parseFloat(x);
        if (isNaN(f_x)) {
            return false
        }
        var f_x = Math.round(x * 100) / 100;
        var s_x = f_x.toString();
        var pos_decimal = s_x.indexOf(".");
        if (pos_decimal < 0) {
            pos_decimal = s_x.length;
            s_x += "."
        }
        while (s_x.length <= pos_decimal + 2) {
            s_x += "0"
        }
        return s_x
    };
    var numMulti = function(num1, num2) {
        var baseNum = 0;
        try {
            baseNum += num1.toString().split(".")[1].length
        } catch (e) {}
        try {
            baseNum += num2.toString().split(".")[1].length
        } catch (e) {}
        return Number(num1.toString().replace(".", "")) * Number(num2.toString().replace(".", "")) / Math.pow(10,
            baseNum)
    };
    var checkParam = function(target) {
        if (!target || null == target || undefined == target || "" == target || "null" == target) {
            return false
        }
        return true
    };

    function doCommission(_stationPrice, _ejiayouPrice, _inputMoney, _mvalue, _addOnEjiayou, _result) {
        try {
            if (!checkParam(_stationPrice) || !checkParam(_ejiayouPrice) || !checkParam(_inputMoney)) {
                return _result
            }
            if (_addOnEjiayou == 0) {
                return _result
            }
            var _rule_json = {
                "0.49-0.59": {
                    "key": [300, 350, 450, 100000],
                    "value": [0, 0.1, 0.2, -1]
                },
                "0.59-0.69": {
                    "key": [250, 300, 350, 450, 100000],
                    "value": [0, 0.1, 0.2, 0.3, -1]
                },
                "0.69-0.89": {
                    "key": [200, 250, 300, 350, 450, 100000],
                    "value": [0, 0.1, 0.2, 0.3, 0.4, -1]
                },
                "0.89-1000": {
                    "key": [150, 200, 250, 300, 350, 450, 100000],
                    "value": [0, 0.1, 0.2, 0.3, 0.4, 0.5, -1]
                }
            };
            _stationPrice = parseFloat(_stationPrice);
            _ejiayouPrice = parseFloat(_ejiayouPrice);
            _inputMoney = parseFloat(_inputMoney);
            var _discount_price = _stationPrice - _ejiayouPrice;
            _discount_price = _discount_price.toFixed(2);
            var _key_arr = null;
            var _value_arr = null;
            var _index = 0;
            for (var _key in _rule_json) {
                var _min = parseFloat(_key.split("-")[0]);
                var _max = parseFloat(_key.split("-")[1]);
                if (_min <= _discount_price && _discount_price < _max) {
                    _key_arr = _rule_json[_key]["key"];
                    _value_arr = _rule_json[_key]["value"]
                }
            }
            if (_key_arr == null || _value_arr == null) {
                return _result
            }
            var _ejiayou_reduce = 0;
            for (var i = 0; i < _key_arr.length; i++) {
                if (_inputMoney < parseFloat(_key_arr[i])) {
                    if (i == 0) {
                        _ejiayou_reduce = _ejiayou_reduce + ((_inputMoney / _stationPrice).toFixed(2) * (
                            _discount_price - parseFloat(_value_arr[i])))
                    } else {
                        for (var j = 0; j <= i; j++) {
                            if (j == 0) {
                                _ejiayou_reduce = _ejiayou_reduce + ((parseFloat(_key_arr[j]) / _stationPrice).toFixed(
                                    3) * (_discount_price - parseFloat(_value_arr[j])))
                            } else {
                                if (j == i && j < _key_arr.length - 1) {
                                    _ejiayou_reduce = _ejiayou_reduce + (((_inputMoney - parseFloat(_key_arr[j - 1])) /
                                        _stationPrice).toFixed(3) * (_discount_price - parseFloat(_value_arr[j])))
                                } else {
                                    if (j == _key_arr.length - 1) {
                                        _ejiayou_reduce = _ejiayou_reduce + 0
                                    } else {
                                        _ejiayou_reduce = _ejiayou_reduce + (((parseFloat(_key_arr[j]) - parseFloat(
                                            _key_arr[j - 1])) / _stationPrice).toFixed(3) * (_discount_price -
                                            parseFloat(_value_arr[j])))
                                    }
                                }
                            }
                        }
                    }
                    break
                }
            }
            _ejiayou_reduce = parseFloat(_ejiayou_reduce.toFixed(2));
            _result.orderSum = _inputMoney - _mvalue - _ejiayou_reduce;
            _result.orderSum = _result.orderSum.toFixed(2) + "";
            _result.ejiayouReduce = "-" + _ejiayou_reduce + "元";
            _result.ejiayouReduceValue = _ejiayou_reduce;
            return _result
        } catch (e) {
            return _result
        }
    }
    var getMerchandise = function(list, select, inputValue, isAuto) {
        if (checkParam(select) && select.merchandiseType == 1 && inputValue >= parseFloat(select.limitMoney)) {
            return select
        }
        if (checkParam(select) && select.merchandiseType == 2) {
            return select
        }
        if (isAuto != 1) {
            return null
        }
        select = null;
        var resultSelect = null;
        for (var i = 0; i < list.length; i++) {
            select = list[i];
            if (select.merchandiseType == 2) {
                resultSelect = select;
                break
            }
            if (select.merchandiseType == 1 && inputValue >= parseFloat(select.limitMoney)) {
                resultSelect = select;
                break
            }
        }
        return resultSelect
    };
    var result = {
        oilMass: "0",
        countryPrice: "",
        stationReduce: "",
        ejiayouReduce: "",
        ejiayouReduceValue: 0,
        merchandiseReduce: "",
        merchandiseReduceValue: 0,
        merchandiseSelect: {},
        orderSum: "0"
    };
    try {
        if (!checkParam(countryPrice) || isNaN(countryPrice)) {
            return JSON.stringify(result)
        }
        if (!checkParam(stationPrice) || isNaN(stationPrice)) {
            return JSON.stringify(result)
        }
        if (!checkParam(inputMoney) || isNaN(inputMoney) || inputMoney <= 0) {
            return JSON.stringify(result)
        }
        if (!checkParam(ejiayouPrice) || isNaN(ejiayouPrice) || ejiayouPrice <= 0) {
            ejiayouPrice = stationPrice
        }
        if (ejiayouPrice == stationPrice || parseFloat(ejiayouPrice) == parseFloat(stationPrice)) {
            isPassUserLimitCount = 0
        }
        var inputMoney = parseFloat((inputMoney + "").trim());
        var countryPrice = parseFloat((countryPrice + "").trim());
        var stationPrice = parseFloat((stationPrice + "").trim());
        var ejiayouPrice = parseFloat((ejiayouPrice + "").trim());
        var merchandiseJsonList = (checkParam(merchandiseJsonList) ? JSON.parse(merchandiseJsonList) : []);
        var selectMerchandiseJson = (checkParam(selectMerchandiseJson) ? JSON.parse(selectMerchandiseJson) : null);
        var mass = changeTwoDecimal_f(inputMoney / stationPrice);
        result.oilMass = mass;
        var countryValue = numMulti(mass, countryPrice);
        var stationReduce = countryValue - inputMoney;
        countryValue = countryValue.toFixed(2);
        stationReduce = stationReduce.toFixed(2);
        if (stationReduce > 0 && parseFloat(countryPrice) > parseFloat(stationPrice)) {
            result.countryPrice = "国家价" + countryValue + "元，本站已直降";
            result.stationReduce = "￥" + stationReduce
        }
        var ejiayouValue = numMulti(mass, ejiayouPrice);
        ejiayouValue = ejiayouValue.toFixed(2);
        var ejiayouReduce = inputMoney - ejiayouValue;
        ejiayouReduce = ejiayouReduce.toFixed(2);
        if (ejiayouReduce > 0 && stationPrice > ejiayouPrice) {
            result.ejiayouReduce = "-" + ejiayouReduce + "元";
            result.ejiayouReduceValue = ejiayouReduce
        }
        var merchandise = getMerchandise(merchandiseJsonList, selectMerchandiseJson, inputMoney, userWantedCoupon);
        var mvalue = 0;
        var addOnEjiayou = 1;
        var orderSum = 0;
        if (checkParam(merchandise)) {
            if (merchandise.merchandiseType == 1) {
                mvalue = parseFloat(merchandise.merchandiseValue)
            } else {
                var discount = merchandise.merchandiseValue * 100;
                discount = (1000 - discount) / 1000;
                discount = discount.toFixed(3);
                mvalue = numMulti(discount, inputMoney);
                mvalue = mvalue.toFixed(2);
                mvalue = (mvalue > merchandise.limitMoney ? merchandise.limitMoney : mvalue)
            }
            addOnEjiayou = merchandise.addOnEjiayou;
            result.merchandiseReduce = "-" + mvalue + "元";
            result.merchandiseReduceValue = mvalue;
            result.merchandiseSelect = merchandise
        }
        if (isPassUserLimitCount == 0) {
            result.ejiayouReduce = "";
            result.ejiayouReduceValue = 0;
            var orderSum = inputMoney - mvalue;
            result.orderSum = orderSum.toFixed(2) + "";
            return JSON.stringify(result)
        } else {
            if (addOnEjiayou == 0) {
                result.ejiayouReduce = "";
                result.ejiayouReduceValue = 0;
                var orderSum = inputMoney - mvalue;
                result.orderSum = orderSum.toFixed(2) + ""
            } else {
                var orderSum = inputMoney - mvalue - (ejiayouReduce > 0 ? ejiayouReduce : 0);
                result.orderSum = orderSum.toFixed(2) + ""
            }
            result = doCommission(stationPrice, ejiayouPrice, inputMoney, mvalue, addOnEjiayou, result);
            return JSON.stringify(result)
        }
    } catch (e) {
        JSON.stringify(result)
    }
};

export default {
    getInfoByInput,
    getInfoByInput2,
}