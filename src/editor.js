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
    return view.state.doc.text.join('\n');
}

export function setEditorContent(code) {

}

export function getLineCol(state) {
    const select = state.selection.main;
    const pos = select.from;
    const textLine = state.doc.lineAt(pos);
    return [textLine.number, pos - textLine.from + 1];
}
