import $ from 'jquery';
import Cookies from 'js.cookie';

import { lang } from './parser';
import { transpile } from './transpiler';
import * as Runtime from './runtime'

const COOKIE_NAME = 'code';
const config = {
    tabSize: 4
};
const editorInfo = {
    lineNo: 1,
};

function runCode(debugMode = false) {
    saveCode();
    updateStatusText(debugMode ? 'Debugging' : 'Executing');

    $('.main-action').hide();
    $(`.${debugMode ? 'debug' : 'run'}-action`).show();

    $('#output-panel').empty();
    printBold(`${debugMode ? 'Debugger' : 'Program'} Start`, '#00CDAF');

    parseAndRun($('#code').val(), debugMode);
}

function parseAndRun(code, debugMode=false) {
    const result = lang.Global.parse(code);

    if (!result.status) {
        let line = result.index.line;
        if (result.index.column === 0) line--;
        showError(`Syntax Error: Line ${line}`);

        printError(
            result.expected.filter(s => s.startsWith('$')).map(s => s.substring(1)),
            false
        );
        stopCode();
        return;
    }

    let funcs;
    try {
        funcs = transpile(result.value);
    } catch (error) {
        printError(error);
        stopCode();
        return;
    }

    const handles = {
        print(msg, color='#D4D4D4') {
            print(msg, color);
        },
        error(msgs) {
            printError(msgs);
            terminate();
        },
        exit() {
            printBold('Program End', '#00CDAF');
            terminate();
        }
    };

    const runtime = new Runtime.DonkeyRuntime(funcs, debugMode, handles);
    runtime.runMain();
}

function terminate() {
    if (global.currVM !== null) {
        clearInterval(global.currVM);
        global.currVM = null;
    } else {
        console.log('Emitting stop signal but there is no active runtime');
    }

    stopCode();
}

export function stopCode() {
    updateStatusText('Editing');
    $('.run-action').hide();
    $('.debug-action').hide()
    $('.main-action').show();
}

export function printError(errs, headerFirst=true) {
    // '$' is special simple to differentiate info msgs with expected symbols
    console.log(errs);
    errs.map((s, i) => showError(s, headerFirst && i === 0));
}

function showError(text, header=true) {
    if (header) {
        printBold('Your program failed, just like your life', '#FF3843');
        printBold('='.repeat(15), '#FF3843');
    }

    printBold(text, '#FF3843');
}

function saveCode() {
    let code = $('#code').val();
    code = encodeURIComponent(code);

    Cookies.set(COOKIE_NAME, code, { path: '', expires: 365 });
}

function loadCode() {
    const area = $('#code');
    const old = Cookies.get(COOKIE_NAME);

    if (old === undefined || old === null) return;

    const content = decodeURIComponent(old);
    area.val(content);
    editorInfo.lineNo = content.split('\n').length;
    updateLineNo($('#line-container'), editorInfo.lineNo);
}

function toggleClick(btn, panel) {

    // jQuery toggle doesn't work well with flex... fix this later?
    btn.click(e => {
        if (panel.css('flex-grow') !== '0') {
            btn.css('border-left-color', '#D4D4D4');
            btn.css('border-bottom', 'none');
            panel.css('flex-grow', '0');
            panel.css('padding', '0 15px 0 15px');
        } else {
            btn.css('border-left-color', '#0078CE');
            btn.css('border-bottom', '1px solid #404040');
            panel.css('flex-grow', '1');
            panel.css('padding', '15px');
        }
    });
}

export function printBold(text, color) {
    print(`<strong>${text}</strong>`, color, true);
}

export function print(text, color, raw=false) {
    const vals = {
        class: 'output-base',
        style: `color:${color};`
    };
    vals[raw ? 'html' : 'text'] = text;
    $('#output-panel').append($('<div>', vals));
}

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
    $('#status-text').text(text);
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
        if (e.which !== 9 && e.which !== 13 && e.which !== 8) return;

        const cmd = (navigator.platform.includes("Mac") ? e.metaKey : e.ctrlKey);
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const value = $(this).val();

        if (e.which === 9) { // tab
            e.preventDefault();

            $(this).val(
                value.substring(0, start) +
                ' '.repeat(config.tabSize) +
                value.substring(end)
            );
            this.selectionStart = this.selectionEnd = start + config.tabSize;
            $(this).trigger('input');
        } else if (e.which === 13) { // return
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
            
            // scroll to caret
            codeArea.blur();
            codeArea.focus();
            $(this).trigger('input');
        } else if (e.which === 8) { // backspace
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

    $('#run-code').on('click', () => runCode(false));
    $('#debug-code').on('click', () => runCode(true));
    $('#stop-code').on('click', () => {
        showError('Program Aborted', false);
        terminate();
    });

    toggleClick($('#output-btn'), $('#output-panel'));
    toggleClick($('#debug-btn'), $('#debugger-panel'));

    loadCode();
});
