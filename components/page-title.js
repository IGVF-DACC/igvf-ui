/**
 * Show a standard page title for the top of any page.
 */
const PageTitle = ({ children }) => {
  return (
    <h1 className="border-b border-title-border text-4xl font-thin">
      {children}
    </h1>
  )
}

export default PageTitle
