import { useState, useEffect } from "react";
import { PokemonCard } from "../PokemonCard/PokemonCard";
import { EditCard } from "../EditCard/EditCard";
import { EscolherEquipe } from "../EscolherEquipe/EscolherEquipe";
import { API_URL, TIPOS, REGIOES, mensagemDeErro } from "../../api";
import './Pokedex.css'

interface Pokemon {
    id : number,
    nome : string,
    geracao : number,
    regiao : string,
    tipo_1 : string,
    tipo_2? : string,
    sprite : string | null,
}

export const Pokedex = () => {
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 30;

    const [editPokemonId, setEditPokemonId] = useState<number | null>(null);
    const [erro, setErro] = useState<string>('');

    // pokemon que abriu a janela de escolher equipe (botao "+ EQUIPE")
    const [teamPokemonId, setTeamPokemonId] = useState<number | null>(null);

    // filtros da busca
    const [busca, setBusca] = useState<string>('');
    const [filtroTipo, setFiltroTipo] = useState<string>('');
    const [filtroRegiao, setFiltroRegiao] = useState<string>('');

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
            } else {
                setErro(await mensagemDeErro(response));
            }
        })
        .catch(() => setErro("Não foi possível conectar com a API."));
    };

    useEffect(() => {
        fetch(`${API_URL}/pokemons/`)
        .then(async (response) => {
            // se a API der erro, o corpo nao e uma lista e o .slice() mais abaixo quebraria a tela toda
            if (response.ok) {
                setPokemons(await response.json());
            } else {
                setErro(await mensagemDeErro(response));
            }
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

    // busca por parte do nome ou pelo numero exato, junto com os filtros de tipo e regiao
    const termo = busca.trim().toLowerCase().replace('#', '');
    const filtrados = pokemons.filter((p) =>
        (!termo || p.nome.includes(termo) || String(p.id) === termo) &&
        (!filtroTipo || p.tipo_1 === filtroTipo || p.tipo_2 === filtroTipo) &&
        (!filtroRegiao || p.regiao === filtroRegiao)
    );
    const temFiltro = Boolean(termo || filtroTipo || filtroRegiao);

    const totalPages = Math.max(1, Math.ceil(filtrados.length / itemsPerPage));
    // se a lista diminuiu (filtro ou delete), nao deixa ficar numa pagina que nao existe mais
    const pagina = Math.min(currentPage, totalPages);

    const indexLastItem = pagina * itemsPerPage;
    const indexFirstItem = indexLastItem - itemsPerPage;
    const currentPokemons = filtrados.slice(indexFirstItem, indexLastItem);

    // qualquer mudanca nos filtros volta para a pagina 1
    const mudarFiltro = (setter : (valor : string) => void, valor : string) => {
        setter(valor);
        setCurrentPage(1);
    };

    const limparFiltros = () => {
        setBusca('');
        setFiltroTipo('');
        setFiltroRegiao('');
        setCurrentPage(1);
    };

    const nextPage = () => {
        if (pagina < totalPages) {
            setCurrentPage(pagina + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const previousPage = () => {
        if (pagina > 1) {
            setCurrentPage(pagina - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    const pokemonToEdit = pokemons.find(p => p.id === editPokemonId);
    const pokemonToTeam = pokemons.find(p => p.id === teamPokemonId);

    return (
        <div className='pokedex'>
            <div className='screen'>
                {erro && <div className='pokedex-error'>{erro}</div>}
                {pokemonToTeam && (
                    <EscolherEquipe
                        id_pokemon={pokemonToTeam.id}
                        name={pokemonToTeam.nome}
                        img={pokemonToTeam.sprite}
                        onClose={() => setTeamPokemonId(null)}
                    />
                )}
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
                        onAddTeam={(id) => setTeamPokemonId(id)}
                    />
                ) : (
                    <>
                        <div className='search-bar'>
                            <input
                                className='search-input'
                                type="text"
                                placeholder="BUSCAR POR NOME OU NÚMERO"
                                value={busca}
                                onChange={(e) => mudarFiltro(setBusca, e.target.value)}
                            />
                            <select
                                className='search-select'
                                value={filtroTipo}
                                onChange={(e) => mudarFiltro(setFiltroTipo, e.target.value)}
                            >
                                <option value="">TODOS OS TIPOS</option>
                                {TIPOS.map((tipo) => (
                                    <option key={tipo} value={tipo}>{tipo.toUpperCase()}</option>
                                ))}
                            </select>
                            <select
                                className='search-select'
                                value={filtroRegiao}
                                onChange={(e) => mudarFiltro(setFiltroRegiao, e.target.value)}
                            >
                                <option value="">TODAS AS REGIÕES</option>
                                {REGIOES.map((regiao) => (
                                    <option key={regiao} value={regiao}>{regiao.toUpperCase()}</option>
                                ))}
                            </select>
                            <button className='search-clear' onClick={limparFiltros} disabled={!temFiltro}>
                                LIMPAR
                            </button>
                        </div>

                        {temFiltro && (
                            <div className='search-count'>
                                {filtrados.length === 0
                                    ? 'NENHUM POKÉMON ENCONTRADO'
                                    : `${filtrados.length} POKÉMON${filtrados.length > 1 ? 'S' : ''} ENCONTRADO${filtrados.length > 1 ? 'S' : ''}`}
                            </div>
                        )}

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
                                    onAddTeam={(id) => setTeamPokemonId(id)}
                                />
                            ))}
                        </div>

                        <div className="page-controls">
                            <div className="btn-page">
                                <button 
                                    className="btn-previous"
                                    onClick={previousPage}
                                    disabled={pagina === 1}
                                >
                                    PREVIOUS
                                </button>
                            </div>
                        
                            <span className="current-page">PÁGINA {pagina} DE {totalPages}</span>

                            <div className="btn-page">
                                <button 
                                    className="btn-next"
                                    onClick={nextPage}
                                    disabled={pagina >= totalPages}
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