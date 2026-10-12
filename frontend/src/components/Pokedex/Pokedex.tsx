import { useState, useEffect } from "react";
import { PokemonCard } from "../PokemonCard/PokemonCard";
import { EditCard } from "../EditCard/EditCard";
import { API_URL } from "../../api";
import './Pokedex.css'

interface Pokemon {
    id : number,
    nome : string,
    geracao : number,
    regiao : string,
    tipo_1 : string,
    tipo_2? : string,
    sprite : string,
}

export const Pokedex = () => {
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 30;

    const [editPokemonId, setEditPokemonId] = useState<number | null>(null);

    const DeletePokemon = (id : number) => {
        fetch(`${API_URL}/pokemons/${id}`, {
            method: 'DELETE',
        })
        .then((response) => {
            if (response.ok) {
                console.log("Pokémon deletado com sucesso");
                setPokemons((prevPokemons) => prevPokemons.filter(p => p.id !== id));
            }
        })
        .catch((error) => console.log("Não foi possível deletar o pokémon", error));
    };

    useEffect(() => {
        fetch(`${API_URL}/pokemons/`).then((response) => response.json())
        .then((data) => {
            setPokemons(data);
            setLoading(false);
        })
        .catch((error) => {
            console.error("Erro ao buscar os pokemons", error);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <p>Carregando Pokédex...</p>
    }

    const indexLastItem = currentPage * itemsPerPage;
    const indexFirstItem = indexLastItem - itemsPerPage;
    const currentPokemons = pokemons.slice(indexFirstItem, indexLastItem);

    const totalPages = Math.ceil(pokemons.length / itemsPerPage);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const previousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    const pokemonToEdit = pokemons.find(p => p.id === editPokemonId);

    return (
        <div className='pokedex'>
            <div className='screen'>
                {editPokemonId && pokemonToEdit ? (
                    <EditCard 
                        key={pokemonToEdit.id}
                        id_pokemon={pokemonToEdit.id}
                        name={pokemonToEdit.nome}
                        generation={pokemonToEdit.geracao}
                        region={pokemonToEdit.regiao}
                        type_1={pokemonToEdit.tipo_1}
                        type_2={pokemonToEdit.tipo_2}
                        img={pokemonToEdit.sprite}
                        onCancel={() => setEditPokemonId(null)}
                    />
                ) : (
                    <>
                        <div className='grid'>
                            {currentPokemons.map((pokemon) => (
                                <PokemonCard 
                                    key={pokemon.id}
                                    id_pokemon={pokemon.id} 
                                    name={pokemon.nome} 
                                    type_1={pokemon.tipo_1}
                                    type_2={pokemon.tipo_2} 
                                    img={pokemon.sprite} 
                                    region={pokemon.regiao}
                                    generation={pokemon.geracao} 
                                    onDelete={DeletePokemon}
                                    onEdit={(id) => setEditPokemonId(id)}
                                />
                            ))}
                        </div>

                        <div className="page-controls">
                            <div className="btn-page">
                                <button 
                                    className="btn-previous"
                                    onClick={previousPage}
                                    disabled={currentPage === 1}
                                >
                                    PREVIOUS
                                </button>
                            </div>
                        
                            <span className="current-page">PÁGINA {currentPage} DE {totalPages}</span>

                            <div className="btn-page">
                                <button 
                                    className="btn-next"
                                    onClick={nextPage}
                                    disabled={currentPage >= totalPages}
                                >
                                    NEXT
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}