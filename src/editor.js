import { EditorState, EditorView, basicSetup } from "@codemirror/basic-setup";
import { monaco, donkeySetup } from "./codemirror-theme";

export function initEditor() {
    const view = new EditorView({
        state: EditorState.create({extensions: [donkeySetup, monaco]}),
        parent: document.getElementById('code-outer')
    });
}

export function getEditorContent() {

}

export function setEditorContent(code) {

}
