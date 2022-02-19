const config = {
    tabSize: 4
};
const editorInfo = {
    lineNo: 1
};

function updateLineNo(container, num) {
    const children = container.children();
    const diff = num - container.children().length;

    if (diff > 0) {
        for (var i = 1; i <= diff; i++) {
            const div = $('<div>', {class: 'line-no font-mono'});
            const span = $('<span>', {
                class: 'line-no-inner', text: children.length + i
            });
            div.append(span);
            container.append(div);
        }
    } else {
        for (var i = 1; i <= -diff; i++) {
            $(children[children.length - i]).remove();
        }
    }
}

$(function() {
    const container = $('#line-container');
    const codeArea = $('#code');
    updateLineNo(container, editorInfo.lineNo);

    codeArea.on('input', function() {
        const codeLength = codeArea.val().split(/\r|\r\n|\n/).length;

        if (editorInfo.lineNo !== codeLength) {
            editorInfo.lineNo = codeLength;
            updateLineNo(container, editorInfo.lineNo);
        }
    });

    codeArea.on('scroll', function() {
        container.scrollTop(codeArea.scrollTop());
    });

    codeArea.keydown(function(e) {
        if (e.keyCode === 9) { // tab
            e.preventDefault();

            const start = this.selectionStart;
            const end = this.selectionStart;
            const value = $(this).val();

            $(this).val(
                value.substring(0, start) +
                ' '.repeat(config.tabSize) +
                value.substring(end)
            );
            this.selectionStart = this.selectionEnd = start + config.tabSize;
        }
    });
});
