$(document).ready(function () {

    $('#answer').summernote({
        height: 300,
        minHeight: 300,
        lang: 'zh-CN'
    });

    var timer;
    $('[name="question"]').on('input change', function () {
        var $this = $(this);
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            $.ajax({
                url: '/robot/faq/edit/segment',
                type: 'POST',
                data: {
                    word: $this.val()
                }
            }).then(function (data) {
                var $keyword = $('#keyword');

                $keyword.tagsinput('removeAll');
                $.each(data, function (i, k) {
                    $keyword.tagsinput('add', k);
                });
            });
        }, 200);
    });

    $('#submit').on('click', function () {
        var id = $('[name="id"]').val();

        var picCodeReg = new RegExp('<img[^>]* src=\"(data:image/[a-z]+;base64,([a-zA-Z0-9/+=]*))\"( data-filename=\"([^"]*)\")?[^>]*>', 'img');
        var answer = $('#answer').summernote('code');
        var imgs = [];
        answer = answer.replace(picCodeReg, function (match, $1, $2, $3, $4, pos, str) {
            var url;
            $.ajax({
                url: '/robot/faq/edit/file',
                type: 'POST',
                data: {
                    filename: $4 || 'maybe.png',
                    base64: $2
                },
                async: false
            }).then(function(data){
                imgs.push(data.id);
                url = data.url;
            });
            return match.replace($1, url);
        });
        //console.info('answer', answer);

        var xhr;
        var json = {
            question: $('[name="question"]', '#editor').val(),
            keyword: $('#keyword', '#editor').tagsinput('items'),
            answer: answer
        };
        if (id) {
            xhr = $$.Object('PlanFAQ').put(id, json);
        } else {
            xhr = $$.Object('PlanFAQ').post(json);
        }
        xhr.then(function (data) {
            location.href = '/robot/faq';
        }, function(){
            //删除临时的图片
            imgs.forEach(function (img) {
                $$.ajax('DELETE', 'files/' + img);
            });
        });
    });
});
