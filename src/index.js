import CodeMirror from 'codemirror';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/css/css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/monokai.css';
import { transformJsToCss } from './parser/parser';
import './style.css';
import throttle from './throttle';
import acceptedFormats from './accepted-formats.txt';

const inputEditor = document.querySelector('.input.editor');
const outputEditor = document.querySelector('.output.editor');

const editorConfig = {
    autoCloseBrackets: true,
    lineNumbers: true,
    extraKeys: {
        'Ctrl-/': (editor) => editor.execCommand('toggleComment'),
    },
    lineWrapping: true,
    smartIndent: false,
};

const inputCodeMirror = CodeMirror.fromTextArea(inputEditor, {
    ...editorConfig,
    mode: 'javascript',
    theme: 'monokai input',
});
const outputCodeMirror = CodeMirror.fromTextArea(outputEditor, {
    ...editorConfig,
    mode: 'css',
    theme: 'monokai output',
});

inputCodeMirror.on('change', (editor, changeObj) => {
    outputCodeMirror.setValue(transformJsToCss(editor.getValue()));
});

inputCodeMirror.setValue(acceptedFormats);

const BORDER_SIZE = 8;
const inputPanel = document.querySelector('.cm-s-input');
const inputEditorWrapper = document.querySelector('#input-editor-wrapper');
const outputEditorWrapper = document.querySelector('#output-editor-wrapper');

let panelWidth = document.body.offsetWidth / 2;
inputEditorWrapper.style.width = panelWidth + 'px';
outputEditorWrapper.style.width = panelWidth + 'px';

let x,
    startingWidth = panelWidth,
    leftPercentage = 0.5,
    rightPercentage = 0.5;
function resize(e) {
    const totalWidth = document.body.offsetWidth;
    const MIN_SIZE = 150;
    const MAX_SIXE = totalWidth - MIN_SIZE;
    const dx = e.clientX - x;

    let leftPanelWidth = startingWidth + dx;
    let rightPanelWidth = totalWidth - leftPanelWidth;
    if (leftPanelWidth < MIN_SIZE) {
        leftPanelWidth = MIN_SIZE;
        rightPanelWidth = MAX_SIXE;
    }
    if (rightPanelWidth < MIN_SIZE) {
        rightPanelWidth = MIN_SIZE;
        leftPanelWidth = MAX_SIXE;
    }

    inputEditorWrapper.style.width = `${leftPanelWidth}px`;

    outputEditorWrapper.style.width = `${rightPanelWidth}px`;

    leftPercentage = leftPanelWidth / totalWidth;
    rightPercentage = rightPanelWidth / totalWidth;
}

inputPanel.addEventListener(
    'mousedown',
    function (e) {
        if (e.target.offsetWidth - e.offsetX <= BORDER_SIZE) {
            x = e.clientX;
            startingWidth = inputEditorWrapper.offsetWidth;
            document.addEventListener('mousemove', resize, false);

            inputEditorWrapper.style.width;
        }
    },
    false,
);

document.addEventListener(
    'mouseup',
    function () {
        document.removeEventListener('mousemove', resize, false);
    },
    false,
);

function updateEditorsSize() {
    inputEditorWrapper.style.width = `${leftPercentage * document.body.offsetWidth}px`;
    outputEditorWrapper.style.width = `${rightPercentage * document.body.offsetWidth}px`;
}

const throttledUpdate = throttle(updateEditorsSize, 16);

const resizeObserver = new ResizeObserver((entries) => {
    throttledUpdate();
});

resizeObserver.observe(document.documentElement);
