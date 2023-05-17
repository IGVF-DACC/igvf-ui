/**
 * Use this in places you would have used the NextJS router.push() function in situations where
 * NextJS might not have loaded environment variables, e.g. 404 page. This wrapper has the option
 * of reloading the browser before going to the `href` page. Reloading before going to the `href`
 * page lets NextJS load those environment variables, allowing us to make proper requests to the
 * data provider. For simplicity, only use this for navigation you can do directly from an error
 * page, such as navigation. Other places that use router.push() only after loading a non-error
 * page should keep using router.push().
 * @param {string} href Link to go to on click
 * @param {object} linkReload Object from GlobalContext
 * @param {object} router Object from useRouter()
 */
export default function linkReloadable(href, linkReload, router) {
  if (linkReload.isEnabled) {
    // Certain static pages (e.g. the 404.js page) set `linkReload.isEnabled` to `true`. This
    // function clears it for safety, though it gets cleared by reloading the page anyway.
    linkReload.setIsEnabled(false);
    window.location = href;
  } else {
    // For the usual case where we navigate to a new page, retrieving just the data needed to
    // render that page.
    router.push(href);
  }
}
