import { EditorState, EditorView } from "@codemirror/basic-setup";
import { monaco, donkeySetup } from "./codemirror-theme";

let view;

export function initEditor() {
    view = new EditorView({
        state: EditorState.create({extensions: [donkeySetup, monaco]}),
        parent: document.getElementById('code-outer')
    });
}

export function getEditorContent() {

}

export function setEditorContent(code) {

}
