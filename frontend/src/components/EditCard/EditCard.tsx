import { useState } from "react"
import './Editcard.css'

interface IEditCardProps {
    id_pokemon : number,
    name : string,
    generation : number,
    region : string,
    type_1 : string,
    type_2? : string,
    img : string,
    onCancel: () => void;
}

export const EditCard = (props : IEditCardProps) => {
    const [name, setName] = useState<string>(props.name);
    const [type1, setType1] = useState<string>(props.type_1);
    const [type2, setType2] = useState<string>(props.type_2 || '');
    const [region, setRegion] = useState<string>(props.region);
    const [sprite, setSprite] = useState<string>(props.img);
    const [generation, setGeneration] = useState<number>(props.generation);

    const EditPokemonAPI = () => {
        const updatedPokemon = {
            nome: name,
            geracao: generation,
            regiao: region,
            tipo_1: type1,
            tipo_2: type2 || null,
            sprite: sprite
        };

        fetch(`http://127.0.0.1:8000/pokemons/${props.id_pokemon}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedPokemon),
        })
        .then((response) => {
            if (response.ok) {
                console.log("Pokémon atualizado com sucesso!");
                props.onCancel();
                window.location.reload();
            } else {
                console.error("Erro ao atualizar o Pokémon");
            }
        })
        .catch((error) => console.error("Erro na requisição PUT:", error));
    };

    return (
        <div className='edit-card-container'>
            <div className='header-edit'>
                <span>EDITAR POKÉMON #{props.id_pokemon} - {props.name}</span>
            </div>

            <div className='card-img-edit'>
                <img src={sprite || props.img} alt={name}></img>
            </div>

            <div className='input-name-container'>
                <label>NOME:</label>
                <input 
                    className='input-name' 
                    type="text"
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="types-edit-container">
                <div className='type1-input-container'>
                    <label>TIPO 1:</label>
                    <select 
                        className="retro-select" 
                        value={type1} 
                        onChange={(e) => setType1(e.target.value)}
                    >
                        <option value="WATER">WATER</option>
                        <option value="FIRE">FIRE</option>
                        <option value="GRASS">GRASS</option>
                        <option value="ELECTRIC">ELECTRIC</option>
                        <option value="ICE">ICE</option>
                        <option value="GHOST">GHOST</option>
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
                        <option value="WATER">WATER</option>
                        <option value="FIRE">FIRE</option>
                        <option value="GRASS">GRASS</option>
                        <option value="ELECTRIC">ELECTRIC</option>
                        <option value="ICE">ICE</option>
                        <option value="GHOST">GHOST</option>
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
                        <option value="KANTO">KANTO</option>
                        <option value="JOHTO">JOHTO</option>
                        <option value="HOENN">HOENN</option>
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
                        <option value={1}>1ª</option>
                        <option value={2}>2ª</option>
                        <option value={3}>3ª</option>
                    </select>
                </div>
            </div>

            <div className='sprite-name-container'>
                <label>URL DO SPRITE:</label>
                <input 
                    className='input-sprite' 
                    type="text" 
                    onChange={(e) => setSprite(e.target.value)}
                />
            </div>

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