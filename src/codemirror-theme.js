import { keymap, drawSelection, highlightActiveLine } from "@codemirror/view"
import { EditorState } from "@codemirror/state"
import { history, historyKeymap } from "@codemirror/history"
import { indentOnInput } from "@codemirror/language"
import { lineNumbers, highlightActiveLineGutter } from "@codemirror/gutter"
import { defaultKeymap } from "@codemirror/commands"
import { bracketMatching } from "@codemirror/matchbrackets"
import { closeBrackets, closeBracketsKeymap } from "@codemirror/closebrackets"
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search"
import { rectangularSelection } from "@codemirror/rectangular-selection"
import { defaultHighlightStyle } from "@codemirror/highlight"
import { EditorView } from "@codemirror/view";

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
        caretColor: "#F00"
    },
    ".cm-cursor": {
        color: "#F00"
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
    "&.cm-focused .cm-selectionBackground, ::selection": {
        backgroundColor: "#174F7C"
    },
    "&.cm-focused .cm-matchingBracket": {
        backgroundColor: "#00000000",
        outline: "1px solid #A3A3A3"
    },
}, {dark: true});

export const donkeySetup = [
    lineNumbers(),
    highlightActiveLineGutter(),
    history(),
    drawSelection(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    defaultHighlightStyle.fallback,
    bracketMatching(),
    closeBrackets(),
    rectangularSelection(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap
    ])
  ];
