import Request from "../../../libs/request"
import EditJson from "../../../components/edit-func"
import { PropTypes } from 'prop-types'
import React from "react"
import { Link } from 'next/link'

const cancelClick = () => {
    console.log("Cancel!")
}

const saveClick = () => {
    console.log("Save!")
}

const BasicButton = ({ id, onClick, isDisabled = false, children }) => {
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

BasicButton.propTypes = {
    id: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    isDisabled: PropTypes.bool,
}

const NavCancelButton = React.forwardRef(
    ({ id, href, onClick, isDisabled = false, children }, ref) => {
        return (
            <Link href={href} passHref>
                <BasicButton
                    onClick={onClick}
                    id={id}
                    disabled={isDisabled}
                    ref={ref}
                >
                    {children}
                </BasicButton>
            </Link>
        )
    }
)

NavCancelButton.propTypes = {
    id: PropTypes.string.required,
    onClick: PropTypes.func,
    isDisabled: PropTypes.bool,
    href: PropTypes.string,
}

NavCancelButton.displayName = "NavCancelButton"

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
            <NavCancelButton onClick={cancelClick} id="edit-cancel" href="/">Cancel</NavCancelButton>
            <BasicButton onClick={saveClick} id="edit-save">Save</BasicButton>
        </div>)
}

SaveCancelControl.propTypes = {
    cancelClick: PropTypes.func,
    saveClick: PropTypes.func,
}

const EditPage = ({ item }) => {
    return (
        <div>
            <EditJson data={item}/>
            <div style={{
                position: "relative",
                boder: "1px solid lightgray",
            }} className="form-edit__save-controls">
                <SaveCancelControl cancelClick={cancelClick} saveClick={saveClick}/>
            </div>
        </div>
    )
}

EditPage.propTypes = {
    item: PropTypes.obj,
}

export const getServerSideProps = async ({ params, req }) => {
    const request = new Request(req?.headers?.cookie)
    const obj = await request.getObject(`/${params.type}/${params.identifier}/`)
    console.log(obj)
    return { props: { item: obj } }
}

export default EditPage
