// endereço do backend (FastAPI), usado em todos os fetch
export const API_URL = 'http://127.0.0.1:8000';

// mesmos valores aceitos pelo backend (backend/app/schemas/schemas.py)
export const TIPOS = [
    'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground',
    'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

// imagem usada quando o pokemon nao tem sprite
export const SPRITE_PADRAO = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

export const REGIOES = ['kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'kalos', 'alola', 'galar', 'paldea'];

// pega a mensagem de erro que o FastAPI manda no "detail"
export const mensagemDeErro = async (response: Response): Promise<string> => {
    try {
        const corpo = await response.json();
        if (typeof corpo.detail === 'string') return corpo.detail;
        if (Array.isArray(corpo.detail)) return corpo.detail.map((e: { msg: string }) => e.msg).join(' / ');
    } catch {
        // resposta sem JSON
    }
    return `Erro ${response.status}`;
};
