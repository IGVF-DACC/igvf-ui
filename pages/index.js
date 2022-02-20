// components
import { useEffect } from "react"

const Home = () => {
  useEffect(() => {
    // For the home page, add a full-page background image. You cannot do this in _document.js
    // because there the body tag only gets rendered on the server and therefore can't be
    // customized per page.
    const defaultBodyClassName = document.body.className
    document.body.className +=
      " bg-[url('/img/home-bg.jpg')] dark:bg-[url('/img/home-dark-bg.jpg')] bg-center bg-no-repeat bg-cover"

    return () => {
      document.body.className = defaultBodyClassName
    }
  })

  return (
    <div className="flex h-screen w-full grow items-center justify-items-center" />
  )
}

export default Home
