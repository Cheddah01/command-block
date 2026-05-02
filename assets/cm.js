// CodeMirror bundle — re-exports from pinned versions with shared deps
// to avoid "multiple instances of @codemirror/state" errors.

import { EditorView, basicSetup } from 'https://esm.sh/codemirror@6.0.1';
import { EditorState } from 'https://esm.sh/@codemirror/state@6.4.1';
import { keymap } from 'https://esm.sh/@codemirror/view@6.26.3?deps=@codemirror/state@6.4.1';
import { yaml } from 'https://esm.sh/@codemirror/lang-yaml@6.1.1?deps=@codemirror/state@6.4.1,@codemirror/view@6.26.3,@codemirror/language@6.10.2';
import { indentWithTab } from 'https://esm.sh/@codemirror/commands@6.6.0?deps=@codemirror/state@6.4.1,@codemirror/view@6.26.3';

export { EditorView, basicSetup, EditorState, keymap, yaml, indentWithTab };
