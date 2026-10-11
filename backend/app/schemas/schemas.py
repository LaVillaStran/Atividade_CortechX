from typing import List, Optional
from pydantic import BaseModel, Field

"""
O QUE É O SCHEMAS E O PYDANTIC?

o schemas basicamente define a estrutura dos dados que entram e saem da API.
o Pydantic é usado p definir o formato exato do JSON que a API vai aceitar (POST/PUT) e devolver (GET).

vantagens:
1. validacao automatica: se tentar cadastrar um pikemon com nome vazio, etc, o Pydantic nao vai deixar chegar no banco.
2. documentacao: o FastAPI le e monta a interface do /docs.
"""

class PokemonBase(BaseModel):
    
    # gt=0: o id tem q ser maior que zero (greater than)
    id: int = Field(..., gt=0, description="Número da pokédex")
    
    # min_length=1: nao aceita pikemon sem nome e sem regiao
    nome: str = Field(..., min_length=1)
    geracao: int = Field(..., gt=0)
    regiao: str = Field(..., min_length=1)
    
    tipo_1: str 
    
    tipo_2: str | None = None

    # optional: pode ser nulo caso nao de p pegar a foto da api
    sprite: Optional[str] = None


class PokemonCreate(PokemonBase):
    """
    Molde para quando alguem criar um pikemon (POST).
    """


class PokemonOut(PokemonBase):
    """
    Molde para quando a gente devolver o pikemon pro usuario (GET).
    """
    
class Equipe(BaseModel):
    nome_treinador: str = Field(...,min_length=1, description="Nome do treinador")

    pokemon_1: int | None = None

    pokemon_2: int | None = None

    pokemon_3: int | None = None

    pokemon_4: int | None = None

    pokemon_5: int | None = None

    pokemon_6: int | None = None

class EquipeCreate(Equipe):
    pass


class EquipeOut(Equipe):
    id: int

    model_config = {"from_attributes": True}


class EquipeDetalhe(BaseModel):
    id: int
    nome_treinador: str
    pokemons: List[PokemonOut]