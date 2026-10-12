import { useState, useEffect } from "react";
import { API_URL, SPRITE_PADRAO, mensagemDeErro } from "../../api";
import '../Pokedex/Pokedex.css'
import '../PokemonCard/PokemonCard.css'
import './Equipes.css'

interface Pokemon {
    id : number,
    nome : string,
    geracao : number,
    regiao : string,
    tipo_1 : string,
    tipo_2? : string | null,
    sprite : string | null,
}

// formato do GET /equipes/ (so os ids dos 6 slots)
interface Equipe {
    id : number,
    nome_treinador : string,
    pokemon_1 : number | null,
    pokemon_2 : number | null,
    pokemon_3 : number | null,
    pokemon_4 : number | null,
    pokemon_5 : number | null,
    pokemon_6 : number | null,
}

// formato do GET /equipes/{id} (com os dados de cada pokemon)
interface EquipeDetalhe {
    id : number,
    nome_treinador : string,
    pokemons : Pokemon[],
}

const TAMANHO_EQUIPE = 6;

const idsDaEquipe = (equipe : Equipe) => [
    equipe.pokemon_1, equipe.pokemon_2, equipe.pokemon_3,
    equipe.pokemon_4, equipe.pokemon_5, equipe.pokemon_6,
].filter((id) => id !== null);

export const Equipes = () => {
    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);
    const [selecionada, setSelecionada] = useState<EquipeDetalhe | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [erro, setErro] = useState<string>('');

    const [novoTreinador, setNovoTreinador] = useState<string>('');
    const [busca, setBusca] = useState<string>('');

    // nome sendo digitado ao renomear; null = nao esta renomeando
    const [novoNome, setNovoNome] = useState<string | null>(null);

    // chama a API e devolve o JSON, ou mostra o erro na tela e devolve null
    const chamarApi = async (caminho : string, metodo : string = 'GET', corpo? : object) => {
        try {
            const response = await fetch(`${API_URL}${caminho}`, {
                method: metodo,
                headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
                body: corpo ? JSON.stringify(corpo) : undefined,
            });
            if (!response.ok) {
                setErro(await mensagemDeErro(response));
                return null;
            }
            setErro('');
            return response.status === 204 ? {} : await response.json();
        } catch {
            setErro("Não foi possível conectar com a API. O backend está rodando?");
            return null;
        }
    };

    const carregarEquipes = async () => {
        const lista = await chamarApi('/equipes/');
        if (lista) setEquipes(lista);
    };

    const abrirEquipe = async (id : number) => {
        const detalhe = await chamarApi(`/equipes/${id}`);
        if (detalhe) {
            setSelecionada(detalhe);
            setNovoNome(null);
        }
    };

    useEffect(() => {
        Promise.all([chamarApi('/equipes/'), chamarApi('/pokemons/')]).then(([listaEquipes, listaPokemons]) => {
            if (listaEquipes) setEquipes(listaEquipes);
            if (listaPokemons) setPokemons(listaPokemons);
            setLoading(false);
        });
    }, []);

    const criarEquipe = async (e : React.FormEvent) => {
        e.preventDefault();
        const nova = await chamarApi('/equipes/', 'POST', { nome_treinador: novoTreinador });
        if (nova) {
            setNovoTreinador('');
            await carregarEquipes();
            await abrirEquipe(nova.id);
        }
    };

    // o PUT troca a equipe inteira, entao manda os 6 slots atuais junto com o nome novo
    const renomearEquipe = async (e : React.FormEvent) => {
        e.preventDefault();
        const equipe = equipes.find((eq) => eq.id === selecionada?.id);
        if (!equipe || novoNome === null) return;

        if (await chamarApi(`/equipes/${equipe.id}`, 'PUT', { ...equipe, nome_treinador: novoNome })) {
            await abrirEquipe(equipe.id);
            await carregarEquipes();
        }
    };

    const deletarEquipe = async () => {
        if (!selecionada) return;
        if (!window.confirm(`Deletar a equipe de ${selecionada.nome_treinador.toUpperCase()}?`)) return;

        if (await chamarApi(`/equipes/${selecionada.id}`, 'DELETE')) {
            setSelecionada(null);
            await carregarEquipes();
        }
    };

    // depois de adicionar ou remover, recarrega a equipe aberta e a contagem da lista
    const alterarPokemon = async (pokemonId : number, metodo : 'POST' | 'DELETE') => {
        if (!selecionada) return;
        if (await chamarApi(`/equipes/${selecionada.id}/pokemons/${pokemonId}`, metodo)) {
            await abrirEquipe(selecionada.id);
            await carregarEquipes();
        }
    };

    if (loading) {
        return <p className="equipes-loading">Carregando equipes...</p>
    }

    const idsNaEquipe = selecionada ? selecionada.pokemons.map((p) => p.id) : [];
    const equipeCheia = idsNaEquipe.length >= TAMANHO_EQUIPE;

    const termo = busca.trim().toLowerCase();
    const resultados = termo
        ? pokemons.filter((p) => p.nome.includes(termo) || String(p.id) === termo).slice(0, 12)
        : [];

    return (
        <div className='pokedex'>
            <div className='screen'>
                {erro && <div className='pokedex-error'>{erro}</div>}

                <div className='equipes-layout'>
                    <aside className='trainer-panel'>
                        <div className='panel-title'>TREINADORES</div>

                        <form className='new-trainer' onSubmit={criarEquipe}>
                            <input
                                className='retro-input'
                                type="text"
                                placeholder="NOME DO TREINADOR"
                                value={novoTreinador}
                                onChange={(e) => setNovoTreinador(e.target.value)}
                            />
                            <button className='btn-retro btn-create' type="submit" disabled={!novoTreinador.trim()}>
                                CRIAR
                            </button>
                        </form>

                        <div className='trainer-list'>
                            {equipes.length === 0 && <div className='empty-text'>Nenhum treinador ainda.</div>}

                            {equipes.map((equipe) => (
                                <button
                                    key={equipe.id}
                                    className={`trainer-item ${selecionada?.id === equipe.id ? 'active' : ''}`}
                                    onClick={() => abrirEquipe(equipe.id)}
                                >
                                    <span>{equipe.nome_treinador.toUpperCase()}</span>
                                    <span className='trainer-count'>{idsDaEquipe(equipe).length}/{TAMANHO_EQUIPE}</span>
                                </button>
                            ))}
                        </div>
                    </aside>

                    <main className='team-panel'>
                        {!selecionada ? (
                            <div className='empty-text team-empty'>
                                Escolha um treinador ou crie um novo para montar a equipe.
                            </div>
                        ) : (
                            <>
                                {novoNome !== null ? (
                                    <form className='team-header' onSubmit={renomearEquipe}>
                                        <input
                                            className='retro-input'
                                            type="text"
                                            value={novoNome}
                                            autoFocus
                                            onChange={(e) => setNovoNome(e.target.value)}
                                        />
                                        <button className='btn-retro btn-create' type="submit" disabled={!novoNome.trim()}>SALVAR</button>
                                        <button className='btn-retro' type="button" onClick={() => setNovoNome(null)}>CANCELAR</button>
                                    </form>
                                ) : (
                                    <div className='team-header'>
                                        <span className='panel-title'>EQUIPE DE {selecionada.nome_treinador.toUpperCase()}</span>
                                        <div className='team-actions'>
                                            <button className='btn-retro btn-create' onClick={() => setNovoNome(selecionada.nome_treinador)}>RENOMEAR</button>
                                            <button className='btn-retro btn-danger' onClick={deletarEquipe}>DELETAR EQUIPE</button>
                                        </div>
                                    </div>
                                )}

                                <div className='team-grid'>
                                    {Array.from({ length: TAMANHO_EQUIPE }, (_, i) => selecionada.pokemons[i]).map((pokemon, i) => (
                                        pokemon ? (
                                            <div className='team-slot' key={pokemon.id}>
                                                <div className='slot-id'>#{pokemon.id}</div>
                                                <img className='slot-img' src={pokemon.sprite || SPRITE_PADRAO} alt={pokemon.nome} />
                                                <div className='slot-name'>{pokemon.nome.toUpperCase()}</div>
                                                <div className='types-container slot-types'>
                                                    <span className={`badge ${pokemon.tipo_1}`}>{pokemon.tipo_1.toUpperCase()}</span>
                                                    {pokemon.tipo_2 && (
                                                        <span className={`badge ${pokemon.tipo_2}`}>{pokemon.tipo_2.toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <button className='btn-retro btn-danger btn-small' onClick={() => alterarPokemon(pokemon.id, 'DELETE')}>
                                                    REMOVER
                                                </button>
                                            </div>
                                        ) : (
                                            <div className='team-slot slot-empty' key={`vazio-${i}`}>
                                                <img className='slot-img' src={SPRITE_PADRAO} alt="" />
                                                <div className='slot-name'>VAZIO</div>
                                            </div>
                                        )
                                    ))}
                                </div>

                                <div className='card-divider'></div>

                                <div className='panel-title'>ADICIONAR POKÉMON</div>
                                <input
                                    className='retro-input'
                                    type="text"
                                    placeholder={equipeCheia ? "EQUIPE CHEIA (6/6)" : "BUSQUE POR NOME OU NÚMERO"}
                                    value={equipeCheia ? "" : busca}
                                    disabled={equipeCheia}
                                    onChange={(e) => setBusca(e.target.value)}
                                />

                                <div className='search-results'>
                                    {termo && resultados.length === 0 && <div className='empty-text'>Nenhum pokémon encontrado.</div>}

                                    {!equipeCheia && resultados.map((pokemon) => {
                                        const jaNaEquipe = idsNaEquipe.includes(pokemon.id);
                                        return (
                                            <div className='result-item' key={pokemon.id}>
                                                <img className='result-img' src={pokemon.sprite || SPRITE_PADRAO} alt={pokemon.nome} />
                                                <span className='result-name'>#{pokemon.id} {pokemon.nome.toUpperCase()}</span>
                                                <button
                                                    className='btn-retro btn-small'
                                                    disabled={jaNaEquipe}
                                                    onClick={() => alterarPokemon(pokemon.id, 'POST')}
                                                >
                                                    {jaNaEquipe ? 'NA EQUIPE' : '+ ADICIONAR'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
