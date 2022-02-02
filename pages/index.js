import { Logo } from "../components/logo"

const Home = () => {
  return (
    <div className="flex h-screen w-full grow items-center justify-items-center">
      <div className="w-full text-center text-xl uppercase tracking-[0.4rem]">
        <Logo />
        Impact of Genomic Variation on Function
      </div>
    </div>
  )
}

export default Home
