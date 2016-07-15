$(document).ready(function () {
    $("form")
        .on('submit', function (e) {
            e.preventDefault();

            var $this = $(this);

            $$.ajax('POST', 'users', {
                "username": $this.find('[name="email"]').val(),
                "password": $this.find('[name="password"]').val(),
                "email": $this.find('[name="email"]').val() + "@mysoft.com.cn"
            }).then(function (data) {
                /*
                 "sessionToken":"qmdj8pdidnmyzp0c7yqil91oc",
                 "createdAt":"2015-07-14T02:31:50.100Z",
                 "objectId":"55a47496e4b05001a7732c5f"
                 */
                sessionStorage.setItem('user', data.sessionToken);
                location.href = '/login/' + data.sessionToken;
            });
        })
        .validate({
            errorPlacement: function ($error, $input) {
                $input.parents('.form-group').first().append($error);
            },
            rules: {
                email: "required",
                password: {
                    required: true
                },
                _password_confirm: {
                    required: true,
                    equalTo: "#password"
                },
                vccode: {
                    required: true,
                    remote: {
                        url: "/register/verification-code",
                        type: "POST"
                    }
                }
            }
        });

    $('[name="email"]').on('input change', function () {
        $('#sendvc').prop('disabled', !$(this).val());
    })

    $('.i-checks').iCheck({
        checkboxClass: 'icheckbox_square-green',
        radioClass: 'iradio_square-green',
    });

    $('#sendvc').on('click', function () {
        var $this = $(this);
        $.ajax({
            type: 'POST',
            url: '/register/send-mail',
            data: {
                email: $('[name="email"]').val() + "@mysoft.com.cn"
            }
        }).then(function (data) {
            if (data.success) {
                var seconds = 60;
                $this.prop('disabled', true);
                var timer = setInterval(function () {
                    if (seconds <= 0) {
                        clearInterval(timer);
                        $this.text('重新发送').prop('disabled', false);
                    } else {
                        $this.text('重新发送(' + seconds-- + ')')
                    }
                }, 1000);
            }
        });
    });
});