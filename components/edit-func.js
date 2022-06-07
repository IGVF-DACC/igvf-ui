import React from 'react'
import PropTypes from 'prop-types'
import dynamic from 'next/dynamic'

import { Button, Linkr } from './button'
import { canEdit } from '../libs/general'

/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "^_.*" }]*/

const Editor = dynamic(
    async () => {
        const ace = await import("react-ace")
        require("ace-builds/src-noconflict/mode-json")
        require("ace-builds/src-noconflict/theme-solarized_light")
        return ace
    },
    {
        loading: () => {
            console.log("LOADING")
            return <div>Loading...</div>
        },
        ssr: false,
    }
)

const JsonEditor = ({ text, onChange, enabled, errors = [] }) => {

    const annotations = errors.map((msg) => ({ row: 0, column: 0, text: msg, type: "error" }) )

    const editor = <Editor
        value={text}
        mode="json"
        theme="solarized_light"
        name="JSON Editor"
        onLoad={() => ({})}
        onChange={onChange}
        fontSize={14}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        annotations={annotations}
        width="100%"
        readOnly={!enabled}
        setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: false,
            enableSnippets: false,
            showLineNumbers: true,
            useWorker: false,
            tabSize: 4,
            maxLines: 1000,
            minLines: 24,
        }}/>
    return editor
}

JsonEditor.propTypes = {
    // The text that will be shown in the editor
    text: PropTypes.string.isRequired,
    // Function that will be called whenever the contents of the editor changes
    onChange: PropTypes.func.isRequired,
    // When false, the text field on the editor cannot be changed, and when true
    // editing is allowed
    enabled: PropTypes.bool.isRequired,
    // If there are any errors in the text, these are passed on to the react-ace `annotations`
    // prop and are rendered in the editor component. Array elements are the error
    // messages as strings.
    errors: PropTypes.array,
}

const ControlButton = ({ id, onClick, isDisabled = false, children }) => {
    return (
        <button
            onClick={onClick}
            data-testid={id}
            disabled={isDisabled}
            className="items-center rounded-sm border px-2 py-1 text-left text-white no-underline hover:bg-nav-highlight disabled:text-gray-500 md:text-black md:hover:border md:hover:border-highlight-border md:hover:bg-highlight md:dark:text-gray-200 text-base font-medium bg-slate-300"
        >
            {children}
        </button>
    )
}

ControlButton.propTypes = {
    id: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    isDisabled: PropTypes.bool,
}

const SaveCancelControl = ({ cancelClick, saveClick }) => {
    return (
        <div>
            <Button onClick={cancelClick} id="edit-cancel">Cancel</Button>
            <Button onClick={saveClick} id="edit-save">Save</Button>
        </div>)
}

SaveCancelControl.propTypes = {
    cancelClick: PropTypes.func,
    saveClick: PropTypes.func,
}

const EditJson = ({ text, onChange, enabled = true, errors = [] }) => {
    return (
        <div className='w-full m-px border-2 border-solid border-slate-300 relative'>
            <JsonEditor text={text} onChange={onChange} enabled={enabled} errors={errors}/>
        </div>
    )
}

EditJson.propTypes = {
    text: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    enabled: PropTypes.bool,
    errors: PropTypes.array,
}

export const EditLink = ({ path, item }) => {
    if (canEdit(item)) {
        return (<Linkr href={`${path}/edit`} navigationClick={ () => {} }>Edit JSON</Linkr>)
    }
    return null
}

EditLink.propTypes = {
    path: PropTypes.string.isRequired,
    item: PropTypes.object.isRequired,
}

export default EditJson
