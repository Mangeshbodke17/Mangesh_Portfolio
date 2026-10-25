import { useReducedMotion } from 'motion/react'
import { lazy, Suspense } from 'react'
import { About } from './components/About'
import { Contact } from './components/Contact'
import { Experience } from './components/Experience'
import { Hero } from './components/Hero'
import { Navbar } from './components/Navbar'
import { ScrollProgress } from './components/ScrollProgress'
import { Skills } from './components/Skills'
import { profile } from './content'

const SceneBackground = lazy(() =>
  import('./three/SceneBackground').then((mod) => ({
    default: mod.SceneBackground,
  })),
)

function App() {
  const reduce = useReducedMotion()

  return (
    <>
      <a className="skip-link" href="#home">
        Skip to content
      </a>
      {!reduce ? (
        <Suspense fallback={null}>
          <SceneBackground />
        </Suspense>
      ) : null}
      <div className="noise" aria-hidden="true" />
      <ScrollProgress />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <About />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <footer className="relative z-10 border-t border-white/8 px-5 py-8 text-center text-sm text-fog sm:px-8">
        © 2026 {profile.name}
        <span className="mt-1 block text-xs text-fog/70">
          Aircraft model by amvlab (CC BY 4.0)
        </span>
      </footer>
    </>
  )
}

export default App
