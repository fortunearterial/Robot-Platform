$(document).ready(function () {

    $('table.footable').footable();

    $('#modal').on('hidden.bs.modal', function (event) {
        var $this = $(this);
        if (!$this.is(':visible')) {
            location.href = '/robot/faq';
        }
    });

    $('.delete').on('click', function (e) {
        e.preventDefault();

        var id = $(this).parents('tr').first().data('id');

        $$.Object('PlanFAQ').delete(id)
            .then(function () {
                location.href = '/robot/faq';
            });
    });

});
