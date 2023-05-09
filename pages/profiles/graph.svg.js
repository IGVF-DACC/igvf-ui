// node_modules
import Image from "next/image";

// components
import Breadcrumbs from "../../components/breadcrumbs";
import PagePreamble from "../../components/page-preamble";
import { DataPanel, DataAreaTitle } from "../../components/data-area";

export default function GraphSvg() {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <>
        <DataAreaTitle>Graph</DataAreaTitle>
        <DataPanel>
          <a href="https://api.data.igvf.org/profiles/graph.svg">
            <Image
              src="https://api.data.igvf.org/profiles/graph.svg"
              height={5356}
              width={4703}
              alt="IGVF graph"
            />
          </a>
        </DataPanel>
      </>
    </>
  );
}
