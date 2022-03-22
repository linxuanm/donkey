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
                changed.mapPos(range.anchor, 1),
                changed.mapPos(range.head, 1)
            )
        };
    });
    
    dispatch(state.update(updated, {userEvent: "input.indent"}));
    return true;
};

const preserveIndent = {key: "Enter", run: indentNextLine};

export const donkeySetup = (configs) => {
    const exts = [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        drawSelection(),
        EditorState.allowMultipleSelections.of(true),
        indentUnit.of("    "),
        indentOnInput(),
        defaultHighlightStyle.fallback,
        bracketMatching(),
        closeBrackets(),
        rectangularSelection(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([
            preserveIndent,
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
