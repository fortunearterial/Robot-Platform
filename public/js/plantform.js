// plantform
(function (window, $) {
    var plantform = {};

    plantform.Object = function (className) {
        var api = 'classes/' + className;
        return {
            get: function () {
                return _ajax('GET', api);
            },
            post: function (data) {
                data = $.extend(data, {
                    "ACL": {
                        "*": {
                            "write": true,
                            "read": true
                        }
                    }
                });
                data = JSON.stringify(data);

                return _ajax('POST', api, data, {
                    "Content-Type": "application/json"
                });
            },
            put: function (id, data) {
                api = api + '/' + id;
                data = JSON.stringify(data);

                return _ajax('PUT', api, data, {
                    "Content-Type": "application/json"
                });
            },
            delete: function (id) {
                api = api + '/' + id;

                return _ajax('DELETE', api);
            }
        }
    }

    var _ajax = plantform.ajax = function (type, api, idOrJson, headers) {
        var deffer = $.Deferred();
        headers = headers || {};
        if (!!sessionStorage.getItem('user')) {
            headers["X-LC-Session"] = sessionStorage.getItem('user');
        }
        headers["X-LC-Id"] = "ktV0ndh0uUArRNo4LLQi5wua-gzGzoHsz";
        headers["X-LC-Key"] = "6a6XTRtof9LNiXMAjzjaptFm";

        $.ajax({
            type: type,
            url: 'https://api.leancloud.cn/1.1/' + api,
            headers: headers,
            dataType: "json",
            data: idOrJson
        }).done(function (data, textStatus, jqXHR) {
            deffer.resolve(data);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            deffer.reject();
        });

        return deffer;
    }

    window.$$ = plantform;
})(window, window.jQuery);