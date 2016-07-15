var AV = require('leancloud-storage');

var APP_ID = 'ktV0ndh0uUArRNo4LLQi5wua-gzGzoHsz';
var APP_KEY = '6a6XTRtof9LNiXMAjzjaptFm';
AV.init({
    appId: APP_ID,
    appKey: APP_KEY
});

module.exports = AV;