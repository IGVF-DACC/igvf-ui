// nextjs
import Head from "next/head"
import Link from "next/link"
// components
import PageTitle from "../../components/page-title"
// libs
import { UC } from "../../libs/constants"
import { getCollection } from "../../libs/request"

const AwardList = ({ awards, siteContext, pageContext }) => {
  return (
    <>
      <Head>
        <title>{`${siteContext.title} ${UC.mdash} ${pageContext.title}`}</title>
      </Head>
      <PageTitle>Awards</PageTitle>
      {awards.map((award) => (
        <Link href={award["@id"]} key={award.uuid}>
          <a className="block px-2 py-4 hover:bg-slate-50 hover:dark:bg-slate-800">
            <div>{award.name}</div>
            <div>{award.title}</div>
          </a>
        </Link>
      ))}
    </>
  )
}

export default AwardList

export const getServerSideProps = async () => {
  const awards = await getCollection("awards")
  return {
    props: {
      awards: awards["@graph"],
      pageContext: { title: awards.title },
    },
  }
}
