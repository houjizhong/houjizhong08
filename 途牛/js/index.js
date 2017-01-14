;(function() {
    function getCookie(name) {
        var arr = document.cookie.split('; '),
            i = 0,
            len = arr.length ;

        for(;i<len;i++){
            var arr2 = arr[i].split('=');
            if(arr2[0] == name) {
                return decodeURIComponent(arr2[1]);
            }
        }

        return null;
    }

    var formatParams = function(data) {
        var arr = [];
        for (var name in data) {
            arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
        }
        return arr.join('&');
    }

    var jsonp = function(options) {
        options = options || {};
        if (!options.url || !options.callback) {
            throw new Error("参数有问题");
        }
        var callbackName = ('jsonp_' + Math.random()).replace(".", "");
        var oHead = document.getElementsByTagName('head')[0];
        var params = "";
        if(options.data){
            options.data[options.callback] = callbackName;
            params += formatParams(options.data);
        }else{
            params+=options.callback+"="+callbackName;
        }
        var oS = document.createElement('script');
        oHead.appendChild(oS);
        window[callbackName] = function (json) {
            oHead.removeChild(oS);
            clearTimeout(oS.timer);
            window[callbackName] = null;
            options.success && options.success(json);
        };
        oS.src = options.url + '?' + params;
        if (options.time) {
            oS.timer = setTimeout(function () {
                window[callbackName] = null;
                oHead.removeChild(oS);
                options.fail && options.fail({ message: "超时" });
            }, options.time);
        }
    };
    function isApp() {
        return document.cookie.indexOf("deviceType")!=-1 || !!localStorage.getItem("zipLocation");
    }
    function getAppVersion() {
        var AppVersion = '8.1.6';

        if(localStorage.getItem("appVersion")){
            AppVersion=localStorage.getItem("appVersion");
        }else{
            var versionCookie=document.cookie.match(/appVersion=([\.|\d]+)/);
            if(versionCookie && versionCookie[1]){
                AppVersion=versionCookie[1];
            }
        }

        return AppVersion;
    }
    function isMweb() {
        var userAgentInfo = navigator.userAgent;
        var Agents = ["Android", "iPhone",
            "SymbianOS", "Windows Phone",
            "iPad", "iPod"];
        var flag = false;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = true;
                break;
            }
        }
        return flag;
    }
    function isShowChatEntry(options, callbackHandler) {
        var d = {};

        if(options.productId) {
            d = {
                productId: options.productId,
                productType: options.productType
            }
        }else if(options.orderId) {
            d = {
                orderId: options.orderId,
                orderType: options.orderType
            }
        }
        if(typeof options.productType != 'undefined') {
            d.productType = options.productType;
        }

        if(options.userId){
            d.userId = options.userId;
        }
        d.entryTemplateId = options.entryTemplateId;
        if(options.appVersion) {
            d.appVersion = options.appVersion;
        }else {
            d.appVersion = getAppVersion();
        }
        if(options.ct) {
            d.ct = options.ct;
        }else if(getCookie('deviceType') == 0) {
            d.ct = 10;
        }else if(getCookie('deviceType') == 1) {
            d.ct = 20;
        }else if(/m.tuniu.com/.test(location.host) || isMweb()) {
            d.ct = 30;
        }else {
            d.ct = 100;
        }
        if(options.parameters) {
            d.parameters = options.parameters;
        }else {
            d.parameters = {};
            d.parameters.entranceUrl = encodeURIComponent(location.pathname + location.search);
        }
        if (d.ct == 100 && d.entryTemplateId == 10001) {
            callbackHandler({
                groupId: -1,
                status: true,
                url: encodeURIComponent('http://www.tuniu.com/kefu/center')
            });
            return ;
        }

        d = JSON.stringify(d);
        jsonp({
            url:"//m.tuniu.com/japi/chat/api/entryService/isShowChatEntry",
            callback:"cb",
            data:{cb:'jsoncallback',d:d},
            success:function(res){
                callbackHandler(res.data);
            }
        })
    }

    if (typeof window.TNCHAT_isShowChatEntry == 'undefined') {
        window.TNCHAT_isShowChatEntry = isShowChatEntry;
    }

})();

