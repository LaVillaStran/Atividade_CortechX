import { useState, useEffect } from "react";
import { PokemonCard } from "../PokemonCard/PokemonCard";
import { EditCard } from "../EditCard/EditCard";
import { API_URL, mensagemDeErro } from "../../api";
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
    const [erro, setErro] = useState<string>('');

    const DeletePokemon = (id : number) => {
        const pokemon = pokemons.find(p => p.id === id);
        if (!window.confirm(`Deletar ${pokemon?.nome.toUpperCase() ?? 'o pokémon'}? Ele também sai das equipes.`)) {
            return;
        }

        fetch(`${API_URL}/pokemons/${id}`, {
            method: 'DELETE',
        })
        .then(async (response) => {
            if (response.ok) {
                setErro('');
                setPokemons((prevPokemons) => prevPokemons.filter(p => p.id !== id));
                // se apagou o ultimo da ultima pagina, volta uma pagina em vez de mostrar a pagina vazia
                const paginas = Math.max(1, Math.ceil((pokemons.length - 1) / itemsPerPage));
                setCurrentPage((pagina) => Math.min(pagina, paginas));
            } else {
                setErro(await mensagemDeErro(response));
            }
        })
        .catch(() => setErro("Não foi possível conectar com a API."));
    };

    useEffect(() => {
        fetch(`${API_URL}/pokemons/`).then((response) => response.json())
        .then((data) => {
            setPokemons(data);
            setLoading(false);
        })
        .catch(() => {
            setErro("Não foi possível carregar os pokémons. O backend está rodando?");
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
                {erro && <div className='pokedex-error'>{erro}</div>}
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
                        onSave={(atualizado) => {
                            setPokemons((prev) => prev.map(p => p.id === atualizado.id ? atualizado : p));
                            setEditPokemonId(null);
                        }}
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