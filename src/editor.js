import { EditorState, EditorView, basicSetup } from "@codemirror/basic-setup";

const monaco = EditorView.theme({
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
        padding: "10px 0 10px 0"
    },
    ".cm-line": {
        paddingLeft: "10px",
        paddingRight: "10px"
    },
    ".cm-activeLineGutter": {
        color: "#C6C6C6",
        backgroundColor: "#1A1A1A"
    },
}, {dark: true});

export function initEditor() {
    console.log(basicSetup);
    const view = new EditorView({
        state: EditorState.create({extensions: [basicSetup, monaco]}),
        parent: document.getElementById('code-outer')
    });
}

export function getEditorContent() {

}

export function setEditorContent(code) {

}
