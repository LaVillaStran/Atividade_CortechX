import { useState } from "react"
import './Editcard.css'
import { API_URL, TIPOS, REGIOES, SPRITE_PADRAO, mensagemDeErro } from '../../api'

export interface IPokemonAtualizado {
    id : number,
    nome : string,
    geracao : number,
    regiao : string,
    tipo_1 : string,
    tipo_2? : string,
    sprite : string | null,
}

interface IEditCardProps {
    id_pokemon : number,
    name : string,
    generation : number,
    region : string,
    type_1 : string,
    type_2? : string,
    img : string | null,
    onCancel: () => void;
    onSave: (pokemon : IPokemonAtualizado) => void;
}

export const EditCard = (props : IEditCardProps) => {
    const [name, setName] = useState<string>(props.name);
    const [type1, setType1] = useState<string>(props.type_1);
    const [type2, setType2] = useState<string>(props.type_2 || '');
    const [region, setRegion] = useState<string>(props.region);
    const [sprite, setSprite] = useState<string>(props.img ?? '');
    const [generation, setGeneration] = useState<number>(props.generation);
    const [erro, setErro] = useState<string>('');

    // o tipo 2 nao pode ser igual ao tipo 1: se o tipo 1 mudar para o mesmo valor, o tipo 2 volta para "nenhum"
    const changeType1 = (valor : string) => {
        setType1(valor);
        if (valor === type2) setType2('');
    };

    const EditPokemonAPI = () => {
        const updatedPokemon = {
            nome: name,
            geracao: generation,
            regiao: region,
            tipo_1: type1,
            tipo_2: type2 || null,
            // campo vazio vira nulo, ai o card mostra a imagem padrao
            sprite: sprite.trim() || null
        };

        fetch(`${API_URL}/pokemons/${props.id_pokemon}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedPokemon),
        })
        .then(async (response) => {
            if (response.ok) {
                // atualiza so esse pokemon na lista, sem recarregar a pagina
                props.onSave(await response.json());
            } else {
                setErro(await mensagemDeErro(response));
            }
        })
        .catch(() => setErro("Não foi possível conectar com a API."));
    };

    return (
        <div className='edit-card-container'>
            <div className='header-edit'>
                <span>EDITAR POKÉMON #{props.id_pokemon} - {props.name}</span>
            </div>

            <div className='card-img-edit'>
                <img src={sprite || SPRITE_PADRAO} alt={name}></img>
            </div>

            <div className='input-name-container'>
                <label>NOME:</label>
                <input 
                    className='input-name' 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="types-edit-container">
                <div className='type1-input-container'>
                    <label>TIPO 1:</label>
                    <select 
                        className="retro-select" 
                        value={type1} 
                        onChange={(e) => changeType1(e.target.value)}
                    >
                        {TIPOS.map((tipo) => (
                            <option key={tipo} value={tipo}>{tipo.toUpperCase()}</option>
                        ))}
                    </select>
                </div>

                <div className='type2-input-container'>
                    <label>TIPO 2:</label>
                    <select 
                        className="retro-select" 
                        value={type2} 
                        onChange={(e) => setType2(e.target.value)}
                    >
                        <option value="">NENHUM</option>
                        {TIPOS.filter((tipo) => tipo !== type1).map((tipo) => (
                            <option key={tipo} value={tipo}>{tipo.toUpperCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="region-edit-container">
                <div className='region-input-container'>
                    <label>REGIÃO:</label>
                    <select 
                        className="retro-select" 
                        value={region} 
                        onChange={(e) => setRegion(e.target.value)}
                    >
                        {REGIOES.map((regiao) => (
                            <option key={regiao} value={regiao}>{regiao.toUpperCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="generation-edit-container">
                <div className='generation-input-container'>
                    <label>GERAÇÃO:</label>
                    <select 
                        className="retro-select" 
                        value={generation} 
                        onChange={(e) => setGeneration(Number(e.target.value))}
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((geracao) => (
                            <option key={geracao} value={geracao}>{geracao}ª</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className='sprite-name-container'>
                <label>URL DO SPRITE:</label>
                <input 
                    className='input-sprite' 
                    type="text" 
                    value={sprite}
                    onChange={(e) => setSprite(e.target.value)}
                />
            </div>

            {erro && <div className='edit-error'>{erro}</div>}

            <div className="footer-edit">
                <button type="button" className="btn save-changes" onClick={EditPokemonAPI}>
                    SALVAR ALTERAÇÕES
                </button>

                <button type="button" className="btn cancel" onClick={props.onCancel}>
                    CANCELAR
                </button>

                <button className="btn-add">
                    + EQUIPE
                </button>
            </div>
        </div>
    );
}