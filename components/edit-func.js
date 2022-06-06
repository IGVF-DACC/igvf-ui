import React from 'react'
import PropTypes from 'prop-types'
import dynamic from 'next/dynamic'

import { LinkButton } from './button'
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
        // eslint-disable-next-line react/display-name
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
        // height="600px"
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
    text: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    enabled: PropTypes.bool.isRequired,
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
            <ControlButton onClick={cancelClick} id="edit-cancel">Cancel</ControlButton>
            <ControlButton onClick={saveClick} id="edit-save">Save</ControlButton>
        </div>)
}

SaveCancelControl.propTypes = {
    cancelClick: PropTypes.func,
    saveClick: PropTypes.func,
}

const EditJson = ({ text, onChange, enabled = true, errors = [] }) => {
    return (
        <div>
            <div style={{
                position: "relative",
                border: "1px solid lightgray",
                margin: "auto",
                width: "100%",
            }}>
                <JsonEditor text={text} onChange={onChange} enabled={enabled} errors={errors}/>
            </div>
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
        return (<LinkButton href={`${path}/edit`} navigationClick={ () => {} }>Edit JSON</LinkButton>)
    } else {
        return null
    }
}

EditLink.propTypes = {
    path: PropTypes.string.isRequired,
    item: PropTypes.object.isRequired,
}

export default EditJson
