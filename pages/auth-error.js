// components
import { DataPanel } from "../components/data-area"
import PagePreamble from "../components/page-preamble"

const AuthError = () => {
  return (
    <>
      <PagePreamble pageTitle="Error" />
      <DataPanel>
        <div className="text-center text-xl italic">
          Unable to sign in. You can still explore the site without viewing
          unreleased data.
        </div>
      </DataPanel>
    </>
  )
}

export default AuthError
