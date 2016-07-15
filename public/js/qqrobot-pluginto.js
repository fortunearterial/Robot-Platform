$(function () {
    var socket = io.connect('http://10.5.103.65:3000/qqrobot');
    socket.on('data', function (data) {
        console.log(data);
    });
    socket.on('error', function (error) {
        console.error(error);
    });
    socket.on('exit', function (msg) {
        console.warning(msg);
    });
    socket.on('qrcode.ready', function (data) {
        console.info('qrcode.ready', data);

        $('#qrcode').find('.qrcode').html('<img class="max-img-responsive" src="data:image/png;base64,' + data + '" alt="扫描二维码登录QQ" />')
        $('#qrcode').modal('show');
    });
    socket.on('qrcode.success', function (data) {
        console.info('qrcode.success', data);

        $('#qrcode').find('.qrcode').html('手机QQ扫码成功，请在手机上点击[允许登录smartQQ]按钮...');
    });
    socket.on('login.fail', function (data) {
        console.error('qrcode.fail', data);

        alert(data);
        $('#pluginto').button('reset');
        $('#qrcode').modal('hide');
    });
    socket.on('login.success', function (data) {
        console.info('success', data);

        $$.Object('QQPlugInto').post({
            qq: data
        });
        alert('恭喜，已经成功托管QQ：' + data);
        $('#pluginto').button('reset');
        $('#qrcode').modal('hide');
    });
    socket.on('fail', function (data) {
        console.info('fail', data);
    });
    socket.on('success', function (data) {
        console.info('fail', data);
    });


    $('#pluginto').on('click', function () {
        $(this).button('pluginto');

        var qq = $('[name="qq"]').val();
        $.get('/qqrobot/plug-into/' + qq, function () {

        });
    });

    $('#cancel').on('click', function () {
        $(this).button('pluginto');

        var qq = $('[name="qq"]').val();
        $.get('/qqrobot/cancel/' + qq, function () {

        });
    });
});