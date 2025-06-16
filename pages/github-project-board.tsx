/**
 * GitHub can override links to project boards depending on your browser's session state, producing
 * the wrong results on the project board. You can work around this by linking instead to this page
 * that redirects to the IGVF GitHub project board. This causes GitHub to ignore the session state.
 */

/**
 * NextJS requires a default export even though the component is not used in this case.
 */
export default function GitHubProjectBoard() {
  return null;
}

export async function getServerSideProps() {
  const githubUrl =
    "https://github.com/orgs/IGVF/projects/1/views/2?filterQuery=tag%3A%22Data%20Portal%22%20-status%3ADone&visibleFields=%5B%22Title%22,%22Assignees%22,%22Status%22,114383190%5D";
  return {
    redirect: {
      destination: githubUrl,
      permanent: false,
    },
  };
}
