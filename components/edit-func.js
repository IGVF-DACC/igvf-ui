import React from 'react'
import { PropTypes } from 'prop-types'
// import AceEditor from "react-ace"
// import Head from 'next/head'
import dynamic from 'next/dynamic'
// import 'ace-builds/webpack-resolver'
// import "react-ace"
// import 'ace-builds/src-noconflict/ace'
// import "ace-builds/src-noconflict/mode-json"
// import "ace-builds/src-noconflict/theme-solarized_light"

/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "^_.*" }]*/

function sortedJson(obj) {
    if (obj instanceof Array) {
        return obj.map((value) => sortedJson(value))
    }
    if (obj instanceof Object) {
        const sorted = {}
        Object.keys(obj).sort().forEach((key) => {
            sorted[key] = obj[key]
        })
        return sorted
    }
    return obj
}

function onChange(newValue) {
    console.log("change", newValue)
}

function onLoad(newValue) {
    console.log("loaded", newValue)
}

const filterItem = (item) => {

    const { ['@type']: _type, ['@id']: _id, _uuid, ...filtered } = item
    return filtered
}

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

const annotations = [
    // {
    //   row: 0, // must be 0 based
    //   column: 0, // must be 0 based
    //   text: "error.message", // text to show in tooltip
    //   type: "error",
    // },
]

const JsonEditor = ({ data }) => {
    const editItem = filterItem(data)
    const editorValue = JSON.stringify(sortedJson(editItem), null, 4)
    // require("ace-builds/src-noconflict/mode-json")
    const editor = <Editor
        value={editorValue}
        mode="json"
        theme="solarized_light"
        name="JSON Editor"
        onLoad={onLoad}
        onChange={onChange}
        fontSize={14}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        annotations={annotations}
        setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: false,
            enableSnippets: false,
            showLineNumbers: true,
            useWorker: false,
            tabSize: 4,
        }}/>
    return editor
}

JsonEditor.propTypes = {
    data: PropTypes.object,
}

JsonEditor.defaultProps = {
    data: {},
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

const EditJson = ({ data }) => {
    return (
        <div>
            <div style={{
                position: "relative",
                border: "1px solid lightgray",
                margin: "auto",
                width: "100%",
            }}>
                <JsonEditor data={data}/>
            </div>
        </div>
    )
}

EditJson.propTypes = {
    data: PropTypes.obj,
}

export default EditJson
