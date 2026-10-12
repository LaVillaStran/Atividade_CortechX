import './PokemonCard.css'

interface IPokemonCardProps {
    id_pokemon : number,
    name : string,
    generation : number,
    region : string,
    type_1 : string,
    type_2? : string,
    img : string,
    onDelete : (id : number) => void,
    onEdit : (id : number) => void
}

export const PokemonCard = (props : IPokemonCardProps) => {
    
    return (
        <div className="pokemon-card">
                <div className='card-header'>
                    <div className="card-id-pokemon">#{props.id_pokemon}</div>
                    <div className='btn-header'>
                        <button className='btn-edit' onClick={() => props.onEdit(props.id_pokemon)}>EDITAR</button>
                    </div>
                </div>
                
                <div className='card-world'>
                    <div className='card-region-pokemon'>{props.region.toUpperCase()}</div>
                    <div className='card-generation-pokemon'>{props.generation}ª GERAÇÃO</div>
                </div>
                
            

            <div className='card-body'>
                <div className='card-img-container'><img className='card-image-container img' src={props.img || "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"} alt={props.name}></img></div>
                <div className='card-details'>
                    <div className="card-name-pokemon">{props.name.toUpperCase()}</div>
                    <div className="types-container">
                        <span className={`badge ${props.type_1.toLowerCase()}`}>{props.type_1.toUpperCase()}</span>

                        {props.type_2 && (
                        <span className={`badge ${props.type_2.toLowerCase()}`}>
                        {props.type_2.toUpperCase()}
                        </span>
                    )}
                    </div>
                </div>
                
            </div>

            <div className='card-divider'></div>
            
            <div className="card-actions">
                <button className="btn btn-add">+ EQUIPE</button>
                <button className="btn btn-delete" onClick={() => props.onDelete(props.id_pokemon)}>
                    DELETAR
                </button>
            </div>
        </div>
    );
}