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

function updateStatusText(text) {

}

function updateCaretPos(line, col) {
    $('#caret-pos').text(`Line ${line}, Col ${col}`);
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
        if (e.keyCode !== 9 && e.keyCode !== 13 && e.keyCode !== 8) return;

        const cmd = (navigator.platform.includes("Mac") ? e.metaKey : e.ctrlKey);
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const value = $(this).val();

        if (e.keyCode === 9) { // tab
            e.preventDefault();

            $(this).val(
                value.substring(0, start) +
                ' '.repeat(config.tabSize) +
                value.substring(end)
            );
            this.selectionStart = this.selectionEnd = start + config.tabSize;
            $(this).trigger('input');
        } else if (e.keyCode === 13) { // return
            e.preventDefault();

            const lines = value.substring(0, start).split(/\r|\r\n|\n/);
            const last = lines[lines.length - 1];
            const indent = last.match(/^ */)[0];
            $(this).val(
                value.substring(0, start) +
                '\n' + indent +
                value.substring(end)
            );
            this.selectionStart = this.selectionEnd = start + indent.length + 1;
            $(this).trigger('input');
        } else if (e.keyCode === 8) { // backspace
            if (start !== end || start === 0) return;
            if (value[start - 1] !== ' ' && !cmd) return;

            const lines = value.substring(0, start).split(/\r|\r\n|\n/);
            const last = lines[lines.length - 1];
            if (last === '') { // prevent delete all
                if (cmd) e.preventDefault();
                return;
            }

            if (value[start - 1] === ' ' && last.trim() === '' && !cmd) {
                let amount = last.length % config.tabSize;
                if (amount === 0) amount = config.tabSize;

                $(this).val(
                    value.substring(0, start - amount) + value.substring(start)
                );

                this.selectionStart = this.selectionEnd = start - amount;
                e.preventDefault();
                $(this).trigger('input');
            }
        }
    });

    codeArea.on("keyup click focus", function() {
        const start = this.selectionStart;
        const lines = $(this).val().substring(0, start).split(/\r|\r\n|\n/);
        const col = lines.length === 0 ? 0 : lines[lines.length - 1].length;

        updateCaretPos(lines.length, col);
    });
});
