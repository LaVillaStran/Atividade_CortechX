import json
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database.database_pokemons import get_db

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
        tipo_1=pokemon.tipo_1,
        tipo_2=pokemon.tipo_2,
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

    novo = models.PokemonDB(**dados)
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return para_schema(novo)

# put pikemons - atualiza um pikemon nn banco
@router.put("/{pokemon_id}", response_model=schemas.PokemonOut)
def atualizar_pokemon(pokemon_id: int, pokemon_atualizado: schemas.PokemonUpdate, db: Session = Depends(get_db)):
    pokemon_db = db.get(models.PokemonDB, pokemon_id)
    # caso o id nao exsta
    if not pokemon_db:
        raise HTTPException(status_code=404, detail="Pokémon não encontrado.")

    # o id vem so da URL, o corpo nao tem id (ver PokemonUpdate)
    dados = pokemon_atualizado.model_dump()

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

# EXTRAS:

# GET nome 
@router.get("/busca", response_model=List[schemas.PokemonOut])
def buscar_pokemons(
    nome: Optional[str] = Query(None, description="Nome exato do pokémon"),
    regiao: Optional[str] = Query(None, description="Região do pokémon"),
    tipo: Optional[str] = Query(None, description="Tipo 1 ou tipo 2"),
    db: Session = Depends(get_db),
):
    consulta = db.query(models.PokemonDB)

    if nome:
        consulta = consulta.filter(func.lower(models.PokemonDB.nome) == nome.strip().lower())

    if regiao:
        consulta = consulta.filter(func.lower(models.PokemonDB.regiao) == regiao.strip().lower())

    if tipo:
        t = tipo.strip().lower()
        consulta = consulta.filter(
            or_(
                func.lower(models.PokemonDB.tipo_1) == t,
                func.lower(models.PokemonDB.tipo_2) == t,
            )
        )

    # sem resultado devolve lista vazia, a busca em si não deu erro
    pokemons = consulta.order_by(models.PokemonDB.id).all()

    return [para_schema(p) for p in pokemons]