import { EditorSelection, EditorState } from "@codemirror/state";
import { history, historyKeymap } from "@codemirror/history";
import { indentOnInput } from "@codemirror/language";
import { lineNumbers, highlightActiveLineGutter } from "@codemirror/gutter";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching } from "@codemirror/matchbrackets";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/closebrackets";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { rectangularSelection } from "@codemirror/rectangular-selection";
import { defaultHighlightStyle } from "@codemirror/highlight";
import { indentUnit } from "@codemirror/language";
import { HighlightStyle, tags } from "@codemirror/highlight";
import { StreamLanguage } from "@codemirror/stream-parser";
import {
    keymap, drawSelection,
    highlightActiveLine, EditorView
} from "@codemirror/view";

export const monaco = EditorView.theme({
    "&": {
        height: "calc(100vh - 75px)",
        width: "100%",
        color: "#D4D4D4",
        fontSize: "20px",
    },
    ".cm-scroller": {
        overflow: "auto",
        lineHeight: "1.5"
    },
    ".cm-gutters": {
        color: "#858585",
        backgroundColor: "#252525",
        borderRight: "1px solid #404040",
        width: "50px"
    },
    ".cm-content": {
        padding: "10px 0 10px 0",
    },
    ".cm-line": {
        paddingLeft: "10px",
        paddingRight: "10px"
    },
    ".cm-activeLineGutter": {
        color: "#C6C6C6",
        backgroundColor: "#1A1A1A"
    },
    ".cm-lineNumbers": {
        width: "100%"
    },
    ".cm-lineNumbers .cm-gutterElement": {
        paddingRight: "8px"
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
        backgroundColor: "#174F7C"
    },
    "&.cm-focused .cm-matchingBracket": {
        backgroundColor: "#00000000",
        outline: "1px solid #A3A3A3"
    },
    ".cm-cursor": {
        borderLeftColor: "#D4D4D4"
    }
}, {dark: true});

const langTokens = {
    comment: /\/\/.*/,
    name: /[a-zA-Z_][a-zA-Z0-9_]*/,
    number: /[0-9]+(\.[0-9]+)?/,
    string: /(".*?")|('.*?')/,
    operator: /(==)|(!=)|(>=)|(<=)|>|<|[+\-*%=!]/,
    punctuation: /[.,()\[\]]/
};

const keywordSets = {
    controlKeyword: new Set([
        'if', 'else', 'then', 'for', 'while', 'until',
        'loop', 'end', 'from', 'to'
    ]),
    operatorKeyword: new Set([
        'and', 'or', 'not', 'mod', 'div'
    ]),
    keyword: new Set([
        'input', 'output', 'return', 'break', 'continue'
    ]),
    null: new Set(['null']),
    bool: new Set(['true', 'false'])
};

const language = StreamLanguage.define({

    token: (stream, state) => {
        stream.eatSpace();

        for (let i in langTokens) {
            const match = stream.match(langTokens[i]);
            if (match !== null) {
                const value = match[0];

                if (i === 'name') {
                    for (let tok in keywordSets) {
                        if (keywordSets[tok].has(value)) {
                            return tok;
                        }
                    }
                }

                return i;
            }
        }

        stream.next();
        return '';
    }
});

const highlightStyle = HighlightStyle.define([
    {tag: tags.controlKeyword, color: '#00C0FF'},
    {tag: tags.keyword, color: '#00CDAF'},
    {tag: tags.null, color: '#DBDDA4'},
    {tag: tags.bool, color: '#DBDDA4'},
    {tag: tags.operatorKeyword, color: '#D081C4'},
    {tag: tags.string, color: '#DBDDA4'},
    {tag: tags.number, color: '#D081C4'},
    {tag: tags.name, color: '#8ADDFF'},
    {tag: tags.comment, color: '#8A8A8A'}
]);

const indentNextLine = ({state, dispatch}) => {
    if (state.readOnly) return false;
    
    const updated = state.changeByRange(range => {
        const line = state.doc.lineAt(range.from);
        const content = line.text;
        const indents = content.match(/^ */)[0];

        const changes = [{
            from: range.from,
            to: range.to,
            insert: '\n' + indents
        }];

        const changed = state.changes(changes);
        return {
            changes,
            range: EditorSelection.range(
                range.from + 1 + indents.length,
                range.from + 1 + indents.length
            )
        };
    });
    
    dispatch(state.update(updated, {userEvent: "input.type"}));
    return true;
};

function scrollToView(update) {
    if (update.docChanged || update.selectionSet) {
        const effect = EditorView.scrollIntoView(
            update.state.selection.main,
            {y: "center"}
        );
        update.view.dispatch(update.state.update({effects: effect}));
    }

    return false;
}

export const donkeySetup = (configs) => {
    const exts = [
        language,
        highlightStyle.extension,
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        drawSelection(),
        EditorState.allowMultipleSelections.of(true),
        indentUnit.of("    "),
        indentOnInput(),
        EditorView.updateListener.of(scrollToView),
        defaultHighlightStyle.fallback,
        bracketMatching(),
        closeBrackets(),
        rectangularSelection(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([
            {key: "Enter", run: indentNextLine},
            indentWithTab,
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...searchKeymap,
            ...historyKeymap
        ])
    ];

    if ('onUpdate' in configs) {
        exts.unshift(EditorView.updateListener.of(configs.onUpdate));
    }

    return exts;
};
