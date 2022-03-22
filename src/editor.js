import { EditorState, EditorView, basicSetup } from "@codemirror/basic-setup";

const monaco = EditorView.theme({
    "&": {
        height: "calc(100vh - 75px)",
        width: "100%"
    },
    ".cm-scroller": {
        overflow: "auto"
    }
}, {dark: true});

export function initEditor() {
    const view = new EditorView({
        state: EditorState.create({extensions: [basicSetup, monaco]}),
        parent: document.getElementById('code-outer')
    });
}

export function getEditorContent() {

}

export function setEditorContent(code) {

}
