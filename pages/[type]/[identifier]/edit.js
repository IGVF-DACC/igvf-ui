import Request from "../../../libs/request"
import EditJson from "../../../components/edit-func"
import PropTypes from "prop-types"
import React from "react"
import { useContext, useState } from "react"
// import { Button, Link } from "../../../components/button"
import { API_URL } from "../../../libs/constants"
import { canEdit } from "../../../libs/general"
import SessionContext from "../../../components/session-context"
import { useRouter } from "next/router"
import Button, { Linkr } from "../../../components/button"

/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "^_.*" }]*/

const updateItem = async (path, item, session) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": session._csrft_,
    },
    body: JSON.stringify(item),
  })
    .then((response) => {
      return response
    })
    .catch(() => {
      return {
        errors: [
          {
            description: "Network error while saving",
            names: ["unknown"],
          },
        ],
      }
    })
  return response
}

const SaveCancelControl = ({
  cancelClick,
  saveClick,
  itemPath,
  saveEnabled,
}) => {
  return (
    <div className="flex space-x-1">
      <Linkr href={itemPath} navigationClick={cancelClick}>
        Cancel
      </Linkr>
      <Button
        onClick={saveClick}
        enabled={saveEnabled}
        type={saveEnabled ? "primary" : "info"}
      >
        Save
      </Button>
    </div>
  )
}

SaveCancelControl.propTypes = {
  cancelClick: PropTypes.func.isRequired,
  saveClick: PropTypes.func.isRequired,
  itemPath: PropTypes.string.isRequired,
  saveEnabled: PropTypes.bool.isRequired,
}

const filterItem = (item) => {
  const {
    ["@type"]: _type,
    ["@id"]: _id,
    ["@context"]: _context,
    ["uuid"]: _uuid,
    ["actions"]: _actions,
    ["access_keys"]: _access,
    ["schema_version"]: _version,
    ["title"]: _title,
    ...filtered
  } = item
  return filtered
}

function sortedJson(obj) {
  if (obj instanceof Array) {
    return obj.map((value) => sortedJson(value))
  }
  if (obj instanceof Object) {
    const sorted = {}
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        sorted[key] = obj[key]
      })
    return sorted
  }
  return obj
}

const SavedErrors = ({ errors = [] }) => {
  return (
    <div>
      <p className="text-lg text-rose-600">Errors from Save:</p>
      <ul className="list-disc">
        {errors.map((error) => (
          <li key={error.description} className="text-base text-rose-600">
            {error.description}
          </li>
        ))}
      </ul>
    </div>
  )
}

SavedErrors.propTypes = {
  errors: PropTypes.array.isRequired,
}

const EditPage = ({ item, path }) => {
  const editable = (session, item) => {
    // cannot edit if not logged in or object not editable
    const loggedIn =
      session != null &&
      "auth.userid" in session &&
      session["auth.userid"].length > 0
    const editable = canEdit(item)
    return loggedIn && editable
  }

  const jsonErrors = (json) => {
    // cannot save if we cannot edit or if the JSON is wrong
    try {
      JSON.parse(json)
      return []
    } catch (err) {
      // Save the error
      return [err.message]
    }
  }

  const { session } = useContext(SessionContext)

  const editorValue = sortedJson(item)

  console.log(editorValue)

  const [text, setText] = useState(() => JSON.stringify(editorValue, null, 4))

  const [saveErrors, setErrors] = useState([])

  const [editorStatus, setEditorStatus] = useState({
    canEdit: editable(session, item),
    canSave: editable(session, item),
    errors: [],
  })

  const router = useRouter()

  const onChange = (newValue) => {
    setText(newValue)
    const errors = jsonErrors(newValue)
    const status = {
      canEdit: editable(session, item),
      canSave: errors.length == 0 && editable(session, item),
      errors,
    }
    setEditorStatus(status)
  }

  const save = () => {
    setEditorStatus({
      canEdit: false,
      canSave: false,
      errors: [],
    })
    const value = sortedJson(filterItem(JSON.parse(text)))
    updateItem(path, value, session).then((response) => {
      if (response.ok) {
        setErrors([])
        router.push(path)
      } else {
        setEditorStatus({
          canEdit: true,
          canSave: true,
          errors: [],
        })
        const errors = response.errors.map((err) => ({
          description: err.description,
          keys: err.names
            .map((val) => {
              `\`${val}\``
            })
            .join(", "),
        }))
        setErrors(errors)
      }
    })
  }

  return (
    <div className="space-y-1">
      <EditJson
        text={text}
        onChange={onChange}
        enabled={editorStatus.canEdit}
        errors={editorStatus.errors}
      />
      <div>
        <SaveCancelControl
          cancelClick={() => ({})}
          saveClick={save}
          itemPath={path}
          saveEnabled={editorStatus.canSave}
        />
        {saveErrors.length > 0 && <SavedErrors errors={saveErrors} />}
      </div>
    </div>
  )
}

EditPage.propTypes = {
  item: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
}

export const getServerSideProps = async ({ params, req }) => {
  const request = new Request(req?.headers?.cookie)
  const obj = await request.getObject(`/${params.type}/${params.identifier}?frame=edit`)
  if (obj && obj.status !== "error") {
    return {
      props: {
        item: obj,
        path: `/${params.type}/${params.identifier}/`,
      },
    }
  } else {
    return { notFound: true }
  }
}

export default EditPage
