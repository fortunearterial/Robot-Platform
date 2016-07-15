$(document).ready(function () {
    $("form")
        .on('submit', function (e) {
            e.preventDefault();

            var $this = $(this);

            $$.ajax('GET', 'login', {
                "username": $this.find('[name="email"]').val(),
                "password": $this.find('[name="password"]').val()
            }).then(function (data) {
                sessionStorage.setItem('user', data.sessionToken);
                location.href = '/login/' + data.sessionToken;
            });
        });

    $('.i-checks').iCheck({
        checkboxClass: 'icheckbox_square-green',
        radioClass: 'iradio_square-green',
    });
});