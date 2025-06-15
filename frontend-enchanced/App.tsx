import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import Home from '../pages/Home'
import Transcription from '../pages/Transcription'
import Summary from '../pages/Summary'
import Translate from '../pages/Translate'
import ResearchAssistant from '../pages/ResearchAssistant'
import Navbar from '../components/Navbar'

const App = () => {
  return (
    <>
      <Navbar />
      <SignedIn>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/transcription" element={<Transcription />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/translate" element={<Translate />} />
          <Route path="/research" element={<ResearchAssistant />} />
        </Routes>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

export default App
