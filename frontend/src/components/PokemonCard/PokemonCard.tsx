import './PokemonCard.css'

interface IPokemonCardProps {
    id_pokemon : number
    name : string
    type_1 : string
    type_2 : string
    image : string
}

export const PokemonCard = (props : IPokemonCardProps) => {
    
    return (
        <div className="pokemon-card">
            <div className="card-id-pokemon">#{props.id_pokemon}</div>

            <div className='card-body'>
                <div className='card-img-container'><img className='card-image-container img' src={props.image} alt={props.name}></img></div>
                <div className='card-details'>
                    <div className="card-name-pokemon">{props.name}</div>
                    <div className="types-container">
                        <span className={`badge ${props.type_1.toLowerCase()}`}>{props.type_1}</span>

                        {props.type_2 && (
                        <span className={`badge ${props.type_2.toLowerCase()}`}>
                        {props.type_2}
                        </span>
                    )}
                    </div>
                </div>
                
            </div>

            <div className='card-divider'></div>
            
            <div className="card-actions">
                <button className="btn btn-add">+ EQUIPE</button>
                <button className="btn btn-delete">DELETE</button>
            </div>
        </div>
    );
}