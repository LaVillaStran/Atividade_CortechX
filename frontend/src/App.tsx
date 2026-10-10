import { PokemonCard } from './components/PokemonCard/PokemonCard'
import './App.css'
export function App() {  
  return (
    <>
      <body>
        <div className='pokedex'>
          <div className='screen'>
            <div className='grid'>
              <PokemonCard id_pokemon={1} name='BULBASAUR' type_1='PLANTA'
              type_2='VENENO' image='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/yellow/transparent/1.png'/>
              <PokemonCard id_pokemon={4} name='CHARMANDER' type_1='FOGO'
              type_2='' image='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/yellow/transparent/4.png'/>
              <PokemonCard id_pokemon={7} name='SQUIRTLE' type_1='AGUA'
              type_2='' image='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/yellow/transparent/7.png'/>
            </div>
          </div>
        </div>
      </body>
      
    </>
  )
}