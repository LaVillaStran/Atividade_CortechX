from typing import List, Literal, Optional
from pydantic import BaseModel, Field, field_validator, model_validator

"""
O QUE É O SCHEMAS E O PYDANTIC?

o schemas basicamente define a estrutura dos dados que entram e saem da API.
o Pydantic é usado p definir o formato exato do JSON que a API vai aceitar (POST/PUT) e devolver (GET).

vantagens:
1. validacao automatica: se tentar cadastrar um pikemon com nome vazio, etc, o Pydantic nao vai deixar chegar no banco.
2. documentacao: o FastAPI le e monta a interface do /docs.
"""

# valores aceitos: os 18 tipos e as 9 regioes dos jogos principais
TIPOS = (
    "normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground",
    "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
)
REGIOES = ("kanto", "johto", "hoenn", "sinnoh", "unova", "kalos", "alola", "galar", "paldea")

Tipo = Literal[TIPOS]
Regiao = Literal[REGIOES]


class PokemonBase(BaseModel):
    """
    Campos editaveis do pikemon. O id fica de fora porque nao muda depois de criado.
    """

    # min_length=1: nao aceita pikemon sem nome (nem so com espacos, o validator tira eles antes)
    nome: str = Field(..., min_length=1)

    # ge/le: so existem 9 geracoes
    geracao: int = Field(..., ge=1, le=9)

    # Literal: so aceita os valores da lista, qualquer outro da erro 422
    regiao: Regiao
    tipo_1: Tipo
    tipo_2: Optional[Tipo] = None

    # optional: pode ser nulo caso nao de p pegar a foto da api
    sprite: Optional[str] = None

    # aceita "FIRE" ou " Kanto " e guarda tudo minusculo, igual aos dados da PokeAPI
    @field_validator("nome", "regiao", "tipo_1", "tipo_2", mode="before")
    @classmethod
    def normalizar(cls, valor):
        if isinstance(valor, str):
            return valor.strip().lower()
        return valor

    # tipo_2 vazio ("") vira nulo: o pokemon so tem um tipo
    @field_validator("tipo_2", mode="before")
    @classmethod
    def tipo_2_vazio(cls, valor):
        if isinstance(valor, str) and not valor.strip():
            return None
        return valor

    # o segundo tipo nao pode repetir o primeiro (ex.: fire/fire)
    @model_validator(mode="after")
    def tipos_diferentes(self):
        if self.tipo_2 is not None and self.tipo_2 == self.tipo_1:
            raise ValueError("tipo_2 não pode ser igual ao tipo_1")
        return self


class PokemonCreate(PokemonBase):
    """
    Molde para quando alguem criar um pikemon (POST).
    """

    # gt=0: o id tem q ser maior que zero (greater than)
    id: int = Field(..., gt=0, description="Número da pokédex")


class PokemonUpdate(PokemonBase):
    """
    Molde para quando alguem editar um pikemon (PUT). Sem id: trocar o id
    deixaria as equipes apontando para um pikemon que nao existe mais.
    """


class PokemonOut(BaseModel):
    """
    Molde para quando a gente devolver o pikemon pro usuario (GET).
    Sem as validacoes de entrada: um dado antigo fora da lista nao pode quebrar a listagem.
    """
    id: int
    nome: str
    geracao: int
    regiao: str
    tipo_1: str
    tipo_2: Optional[str] = None
    sprite: Optional[str] = None

    model_config = {"from_attributes": True}


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