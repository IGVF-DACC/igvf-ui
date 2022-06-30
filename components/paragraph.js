/**
 * Displays a paragraph with standard styles. If you need a paragraph with different styles, either
 * style it with Tailwind CSS classes directly where you need it, or add another paragraph
 * component in this file.
 */
const Paragraph = ({ children }) => {
  return <p className="my-3 first:mt-0 last:mb-0">{children}</p>
}

export default Paragraph
