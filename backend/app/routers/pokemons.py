import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/pokemons",
    tags=["pokemons"],
)

def para_schema(pokemon: models.PokemonDB) -> schemas.PokemonOut:
    return schemas.PokemonOut(
        id=pokemon.id,
        nome=pokemon.nome,
        geracao=pokemon.geracao,
        regiao=pokemon.regiao,
        tipos=pokemon.tipos_lista(),
        sprite=pokemon.sprite,
    )

# get pikemons - busca todos os pikemons no banco de dados e retorna ordenado por ID
@router.get("/", response_model=List[schemas.PokemonOut])
def listar_pokemons(db: Session = Depends(get_db)):
    pokemons = db.query(models.PokemonDB).order_by(models.PokemonDB.id).all()
    return [para_schema(p) for p in pokemons]

# post pikemons - cria um novo pikemon no banco de dados
@router.post("/", response_model=schemas.PokemonOut, status_code=201)
def criar_pokemon(pokemon: schemas.PokemonCreate, db: Session = Depends(get_db)):
    # caso o id nao exista
    if db.get(models.PokemonDB, pokemon.id):
        raise HTTPException(status_code=409, detail="Já existe um pokémon com esse id.")

    dados = pokemon.model_dump()
    dados["tipos"] = json.dumps(dados["tipos"], ensure_ascii=False)

    novo = models.PokemonDB(**dados)
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return para_schema(novo)

# put pikemons - atualiza um pikemon nn banco
@router.put("/{pokemon_id}", response_model=schemas.PokemonOut)
def atualizar_pokemon(pokemon_id: int, pokemon_atualizado: schemas.PokemonCreate, db: Session = Depends(get_db)):
    pokemon_db = db.get(models.PokemonDB, pokemon_id)
    # caso o id nao exsta
    if not pokemon_db:
        raise HTTPException(status_code=404, detail="Pokémon não encontrado.")

    # verifica se tentou alterar o id pra um id que ja pertence a um pokemon no banco
    if pokemon_id != pokemon_atualizado.id and db.get(models.PokemonDB, pokemon_atualizado.id):
        raise HTTPException(status_code=409, detail="Já existe outro pokémon com esse id.")

    dados = pokemon_atualizado.model_dump()
    dados["tipos"] = json.dumps(dados["tipos"], ensure_ascii=False)

    for key, value in dados.items():
        setattr(pokemon_db, key, value)

    db.commit()
    db.refresh(pokemon_db)
    return para_schema(pokemon_db)

# delete pikemons - deleta um pikemon do banco
@router.delete("/{pokemon_id}", status_code=204)
def deletar_pokemon(pokemon_id: int, db: Session = Depends(get_db)):
    pokemon_db = db.get(models.PokemonDB, pokemon_id)
    if not pokemon_db:
        raise HTTPException(status_code=404, detail="Pokémon não encontrado.")
    
    db.delete(pokemon_db)
    db.commit()
    return None

# TODO - GET nome 

# TODO - GET regiao

# TODO - GET tipo
