import { useState, useEffect } from "react";
import { API_URL, SPRITE_PADRAO, mensagemDeErro } from "../../api";
import './EscolherEquipe.css'

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

interface IEscolherEquipeProps {
    id_pokemon : number,
    name : string,
    img : string | null,
    onClose : () => void,
}

const TAMANHO_EQUIPE = 6;

const idsDaEquipe = (equipe : Equipe) => [
    equipe.pokemon_1, equipe.pokemon_2, equipe.pokemon_3,
    equipe.pokemon_4, equipe.pokemon_5, equipe.pokemon_6,
].filter((id) => id !== null);

// janela que abre pelo botao "+ EQUIPE" para escolher em qual treinador o pokemon entra
export const EscolherEquipe = (props : IEscolherEquipeProps) => {
    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [erro, setErro] = useState<string>('');
    const [sucesso, setSucesso] = useState<string>('');

    useEffect(() => {
        fetch(`${API_URL}/equipes/`)
        .then(async (response) => {
            if (response.ok) {
                setEquipes(await response.json());
            } else {
                setErro(await mensagemDeErro(response));
            }
        })
        .catch(() => setErro("Não foi possível conectar com a API."))
        .finally(() => setLoading(false));
    }, []);

    // fecha com a tecla Esc
    useEffect(() => {
        const fecharComEsc = (e : KeyboardEvent) => {
            if (e.key === 'Escape') props.onClose();
        };
        window.addEventListener('keydown', fecharComEsc);
        return () => window.removeEventListener('keydown', fecharComEsc);
    }, [props.onClose]);

    const adicionar = (equipe : Equipe) => {
        setErro('');
        fetch(`${API_URL}/equipes/${equipe.id}/pokemons/${props.id_pokemon}`, { method: 'POST' })
        .then(async (response) => {
            if (response.ok) {
                const atualizada : Equipe = await response.json();
                setEquipes((prev) => prev.map(e => e.id === atualizada.id ? atualizada : e));
                setSucesso(`${props.name.toUpperCase()} entrou na equipe de ${equipe.nome_treinador.toUpperCase()}!`);
            } else {
                setErro(await mensagemDeErro(response));
            }
        })
        .catch(() => setErro("Não foi possível conectar com a API."));
    };

    return (
        // clicar fora da janela tambem fecha
        <div className='choose-overlay' onClick={props.onClose}>
            <div className='choose-box' onClick={(e) => e.stopPropagation()}>
                <div className='choose-header'>
                    <img className='choose-img' src={props.img || SPRITE_PADRAO} alt={props.name} />
                    <span>ADICIONAR #{props.id_pokemon} {props.name.toUpperCase()} À EQUIPE DE:</span>
                </div>

                {erro && <div className='choose-message error'>{erro}</div>}
                {sucesso && <div className='choose-message success'>{sucesso}</div>}

                <div className='choose-list'>
                    {loading && <div className='choose-empty'>Carregando equipes...</div>}

                    {!loading && !erro && equipes.length === 0 && (
                        <div className='choose-empty'>
                            Nenhum treinador ainda. Crie um na aba EQUIPES.
                        </div>
                    )}

                    {equipes.map((equipe) => {
                        const ids = idsDaEquipe(equipe);
                        const jaEsta = ids.includes(props.id_pokemon);
                        const cheia = ids.length >= TAMANHO_EQUIPE;

                        return (
                            <button
                                key={equipe.id}
                                className='choose-item'
                                disabled={jaEsta || cheia}
                                onClick={() => adicionar(equipe)}
                            >
                                <span>{equipe.nome_treinador.toUpperCase()}</span>
                                <span className='choose-status'>
                                    {jaEsta ? 'JÁ ESTÁ' : cheia ? 'CHEIA' : `${ids.length}/${TAMANHO_EQUIPE}`}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <button className='choose-close' onClick={props.onClose}>
                    {sucesso ? 'PRONTO' : 'CANCELAR'}
                </button>
            </div>
        </div>
    );
}
