import $ from 'jquery';
import Cookies from 'js.cookie';

import { lang } from './parser';
import { repr } from './prelude';
import { transpile } from './transpiler';
import * as Runtime from './runtime';
import * as Editor from './editor';

const COOKIE_NAME = 'code';

function runCode(debugMode = false) {
    saveCode();
    updateStatusText(debugMode ? 'Debugging' : 'Executing');

    $('.main-action').hide();
    $(`.${debugMode ? 'debug' : 'run'}-action`).show();

    $('#output-panel').empty();
    $('#debugger-panel').empty();
    printBold(`${debugMode ? 'Debugger' : 'Program'} Start`, '#00CDAF');

    parseAndRun(Editor.getEditorContent(), debugMode);
}

function parseAndRun(code, debugMode=false) {
    const result = lang.Global.parse(code);

    if (!result.status) {
        let line = result.index.line;
        if (result.index.column === 0) line--;
        showError(`Syntax Error: Line ${line}`);
        console.log(result);

        printError(
            result.expected.filter(s => s.startsWith('$')).map(s => s.substring(1)),
            false
        );
        stopCode();
        return;
    }

    let funcs;
    try {
        funcs = transpile(result.value, debugMode);
    } catch (error) {
        if (Array.isArray(error)) {
            printError(error);
            stopCode();
        } else {
            printError([
                'Unexpected Internal Error',
                'Check log and report to author'
            ]);
            throw error;
        }
    }

    const handles = {
        print(msg, color='#D4D4D4', raw=false) {
            print(msg, color, raw);
        },
        error(msgs) {
            printError(msgs);
            terminate();
        },
        exit() {
            printBold('Program End', '#00CDAF');
            terminate();
        },
        handlePause(line) {
            $('#next-code').removeClass('disabled-div');
            const varData = global.currVM.getVariablesData();

            const debugTitle = (text, color) => {
                const vals = {
                    class: 'output-base debug-title',
                };

                if (color !== undefined) {
                    vals.style = `color:${color}`;
                }

                vals['html'] = `<strong>${text}</strong>`;
                $('#debugger-panel').append($('<div>', vals));
            };

            $('#debugger-panel').empty();
            debugTitle(`Breakpoint at line ${line.line}`, '#FF3843');
            if ('local' in varData) {
                debugTitle('Local:');
                for (var name in varData.local) {
                    debugObject(name, varData.local[name]);
                }
            }

            debugTitle('Global:');
            for (var name in varData.global) {
                debugObject(name, varData.global[name]);
            }
        },
        handleResume() {
            $('#next-code').addClass('disabled-div');
        }
    };

    if (global.currVM !== null) {
        console.log('Another runtime is running!');
        return;
    }

    global.currVM = new Runtime.DonkeyRuntime(funcs, debugMode, handles);
    global.currVM.runMain();
}

function terminate() {
    if (global.currVM !== null) {
        global.currVM.cleanUp();
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
    errs.map((s, i) => showError(s, headerFirst && i === 0));
}

function showError(text, header=true) {
    const red = '#FF3843';

    if (header) {
        const roast = 'Your program failed, just like your life';
        printBold(roast, red);
        printBold('='.repeat(20), red);
    }

    printBold(text, red);
}

function saveCode() {
    let code = Editor.getEditorContent();
    code = encodeURIComponent(code);

    Cookies.set(COOKIE_NAME, code, { path: '', expires: 365 });
}

function loadCode() {
    const old = Cookies.get(COOKIE_NAME);

    if (old === undefined || old === null) return;

    const content = decodeURIComponent(old);
    Editor.setEditorContent(content);
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

// color for a type repr
function colorType(typeName) {
    let color;
    switch (typeName) {
        case 'integer':
        case 'real':
            color = '#D081C4';
            break;
        case 'string':
            color = '#DBDDA4';
            break;
        case 'boolean':
            color = '#DBDDA4';
            break;
        default:
            color = '#8ADDFF';
    }

    return `(<span style="color:${color}">${typeName}</span>)`;
}

function debugObject(varName, dObject) {
    const vals = { class: 'output-base code-font' };

    const objType = colorType(dObject.type);
    const valRepr = repr(dObject);

    vals['html'] = `${objType} ${varName} = ${valRepr}`;
    $('#debugger-panel').append($('<div>', vals));
}

function updateStatusText(text) {
    $('#status-text').text(text);
}

function updateCaretPos(update) {
    const ranges = update.state.selection.ranges;
    if (ranges.length > 1) {
        $('#caret-pos').text(`${ranges.length} Selections`);
    } else {
        const [line, col] = Editor.getLineCol(update.state);
        $('#caret-pos').text(`Line ${line}, Col ${col}`);
    }
}

$(function() {
    Editor.initEditor({
        onUpdate: updateCaretPos
    });

    $('#run-code').on('click', () => runCode(false));
    $('#debug-code').on('click', () => runCode(true));
    $('#next-code').on('click', () => {
        global.currVM.resume();
    });
    $('#stop-code').on('click', () => {
        showError('Program Aborted', false);
        terminate();
    });

    toggleClick($('#output-btn'), $('#output-panel'));
    toggleClick($('#debug-btn'), $('#debugger-panel'));

    loadCode();
});
