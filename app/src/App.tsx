import { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Gallery } from './screens/Gallery'
import { Capture } from './screens/Capture'
import { Detail } from './screens/Detail'
import { Wall } from './screens/Wall'
import { migrateLegacyBlobs, requestPersistentStorage } from './db'
import { APP } from './config'
import type { Screen } from './nav'

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'gallery' })

  useEffect(() => {
    document.title = APP.title
    requestPersistentStorage()
    migrateLegacyBlobs()
  }, [])

  return (
    <div className="app">
      <Sidebar screen={screen} go={setScreen} />
      <main className="main">
        {screen.name === 'gallery' && <Gallery go={setScreen} />}
        {screen.name === 'favorites' && <Gallery lovedOnly go={setScreen} />}
        {screen.name === 'capture' && <Capture go={setScreen} />}
        {screen.name === 'wall' && <Wall go={setScreen} />}
        {screen.name === 'detail' && <Detail id={screen.id} go={setScreen} />}
      </main>
    </div>
  )
}
