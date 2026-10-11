from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database.database_pokemons import get_db           # pokemons.db
from ..database.database_equipes import get_db_equipes    # equipes.db

router = APIRouter(
    prefix="/equipes",
    tags=["equipes"],
)
 # Os slots guardarão as informações dos pokemons
SLOTS = ["pokemon_1", "pokemon_2", "pokemon_3", "pokemon_4", "pokemon_5", "pokemon_6"]


def validar_pokemons(equipe: schemas.EquipeCreate, db_pokemons: Session):
    # confere no pokemons.db se cada id enviado existe
    for slot in SLOTS:
        # Aqui faremos uma busca pelos 
        pid = getattr(equipe, slot)
        if pid is not None and not db_pokemons.get(models.PokemonDB, pid):
            raise HTTPException(status_code=404, detail=f"Pokémon {pid} ({slot}) não existe.")


@router.get("/", response_model=List[schemas.EquipeOut])
def listar_equipes(db_eq: Session = Depends(get_db_equipes)):
    return db_eq.query(models.EquipeDB).order_by(models.EquipeDB.id).all()


@router.get("/{equipe_id}", response_model=schemas.EquipeDetalhe)
def buscar_equipe(
    equipe_id: int,
    db_eq: Session = Depends(get_db_equipes),
    db_pokemons: Session = Depends(get_db),
):
    equipe = db_eq.get(models.EquipeDB, equipe_id)
    if not equipe:
        raise HTTPException(status_code=404, detail="Equipe não encontrada.")

    ids = [getattr(equipe, s) for s in SLOTS if getattr(equipe, s) is not None]
    pokemons = db_pokemons.query(models.PokemonDB).filter(models.PokemonDB.id.in_(ids)).all()
    por_id = {p.id: p for p in pokemons}

    return schemas.EquipeDetalhe(
        id=equipe.id,
        nome_treinador=equipe.nome_treinador,
        # se um pokémon foi apagado do pokemons.db depois, ele é ignorado aqui
        pokemons=[
            schemas.PokemonOut.model_validate(por_id[i], from_attributes=True)
            for i in ids if i in por_id
        ],
    )


@router.post("/", response_model=schemas.EquipeOut, status_code=201)
def criar_equipe(
    equipe: schemas.EquipeCreate,
    db_eq: Session = Depends(get_db_equipes),
    db_pokemons: Session = Depends(get_db),
):
    validar_pokemons(equipe, db_pokemons)
    nova = models.EquipeDB(**equipe.model_dump())
    db_eq.add(nova)
    db_eq.commit()
    db_eq.refresh(nova)
    return nova


@router.put("/{equipe_id}", response_model=schemas.EquipeOut)
def atualizar_equipe(
    equipe_id: int,
    dados: schemas.EquipeCreate,
    db_eq: Session = Depends(get_db_equipes),
    db_pokemons: Session = Depends(get_db),
):
    equipe = db_eq.get(models.EquipeDB, equipe_id)
    if not equipe:
        raise HTTPException(status_code=404, detail="Equipe não encontrada.")

    validar_pokemons(dados, db_pokemons)
    for key, value in dados.model_dump().items():
        setattr(equipe, key, value)

    db_eq.commit()
    db_eq.refresh(equipe)
    return equipe


@router.delete("/{equipe_id}", status_code=204)
def deletar_equipe(equipe_id: int, db_eq: Session = Depends(get_db_equipes)):
    equipe = db_eq.get(models.EquipeDB, equipe_id)
    if not equipe:
        raise HTTPException(status_code=404, detail="Equipe não encontrada.")
    db_eq.delete(equipe)
    db_eq.commit()
    return None