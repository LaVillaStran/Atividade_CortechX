import { useState } from 'react'
import { Pokedex } from './components/Pokedex/Pokedex'
import { Equipes } from './components/Equipes/Equipes'
import './App.css'

type Aba = 'pokedex' | 'equipes'

export function App() {  
  const [aba, setAba] = useState<Aba>('pokedex')

  return (
    <div className='app'>
      <nav className='tabs'>
        <button className={`tab ${aba === 'pokedex' ? 'active' : ''}`} onClick={() => setAba('pokedex')}>
          POKÉDEX
        </button>
        <button className={`tab ${aba === 'equipes' ? 'active' : ''}`} onClick={() => setAba('equipes')}>
          EQUIPES
        </button>
      </nav>

      {aba === 'pokedex' ? <Pokedex/> : <Equipes/>}
    </div>
  )
}
