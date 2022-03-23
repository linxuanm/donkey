import { EditorState, EditorView } from "@codemirror/basic-setup";
import { monaco, donkeySetup } from "./codemirror-theme";

let view;

export function initEditor(configs) {
    view = new EditorView({
        state: EditorState.create({extensions: [donkeySetup(configs), monaco]}),
        parent: document.getElementById('code-outer')
    });
}

export function getEditorContent() {
    const lines = [];
    view.state.doc.flatten(lines);
    return lines.join('\n');
}

export function setEditorContent(code) {
    const trans = view.state.update({
        changes: [{
                from: 0,
                to: view.state.doc.length,
                insert: code
        }]
    });
    view.dispatch(trans);
}

export function getLineCol(state) {
    const select = state.selection.main;
    const pos = select.from;
    const textLine = state.doc.lineAt(pos);
    return [textLine.number, pos - textLine.from + 1];
}
