from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database.database_pokemons import get_db
from ..database.database_equipes import get_db_equipes
from .equipe import SLOTS
from ..seed.seed import CAMPOS, pokemons_originais

router = APIRouter(
    prefix="/pokemons",
    tags=["pokemons"],
)

# os 151 da 1a geracao vem do seed e sao a pokedex original: nao podem ser deletados
ULTIMO_POKEMON_ORIGINAL = 151

def para_schema(pokemon: models.PokemonDB) -> schemas.PokemonOut:
    return schemas.PokemonOut(
        id=pokemon.id,
        nome=pokemon.nome,
        geracao=pokemon.geracao,
        regiao=pokemon.regiao,
        tipo_1=pokemon.tipo_1,
        tipo_2=pokemon.tipo_2,
        sprite=pokemon.sprite,
        editado=foi_editado(pokemon),
    )

# compara com os dados do seed; pokemon criado nunca conta como editado
def foi_editado(pokemon: models.PokemonDB) -> bool:
    original = pokemons_originais().get(pokemon.id)
    if original is None:
        return False
    return any(getattr(pokemon, campo) != original[campo] for campo in CAMPOS)

# volta um pokemon para os dados do seed (usado pelas duas rotas de redefinir)
# ignorar_ids: os que estao sendo redefinidos juntos (no "redefinir todos" eles tambem vao voltar ao nome original)
def restaurar(pokemon: models.PokemonDB, db: Session, ignorar_ids: Optional[set] = None):
    original = pokemons_originais()[pokemon.id]
    # se alguem criou um pokemon com o nome original, nao da para voltar sem repetir o nome
    verificar_nome(original["nome"], db, ignorar_id=pokemon.id, ignorar_ids=ignorar_ids)
    for campo, valor in original.items():
        setattr(pokemon, campo, valor)

# nao deixa ter dois pikemons com o mesmo nome (o schema ja guarda o nome em minusculo)
def verificar_nome(nome: str, db: Session, ignorar_id: Optional[int] = None, ignorar_ids: Optional[set] = None):
    consulta = db.query(models.PokemonDB).filter(models.PokemonDB.nome == nome)
    if ignorar_id is not None:
        consulta = consulta.filter(models.PokemonDB.id != ignorar_id)
    if ignorar_ids:
        consulta = consulta.filter(models.PokemonDB.id.not_in(ignorar_ids))
    if consulta.first():
        raise HTTPException(status_code=409, detail="Já existe um pokémon com esse nome.")

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

    verificar_nome(pokemon.nome, db)

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

    verificar_nome(pokemon_atualizado.nome, db, ignorar_id=pokemon_id)

    # o id vem so da URL, o corpo nao tem id (ver PokemonUpdate)
    dados = pokemon_atualizado.model_dump()

    for key, value in dados.items():
        setattr(pokemon_db, key, value)

    db.commit()
    db.refresh(pokemon_db)
    return para_schema(pokemon_db)

# delete pikemons - deleta um pikemon do banco
@router.delete("/{pokemon_id}", status_code=204)
def deletar_pokemon(
    pokemon_id: int,
    db: Session = Depends(get_db),
    db_eq: Session = Depends(get_db_equipes),
):
    pokemon_db = db.get(models.PokemonDB, pokemon_id)
    if not pokemon_db:
        raise HTTPException(status_code=404, detail="Pokémon não encontrado.")

    if pokemon_id <= ULTIMO_POKEMON_ORIGINAL:
        raise HTTPException(status_code=403, detail="Os pokémons originais (1 a 151) não podem ser deletados.")
    
    db.delete(pokemon_db)
    db.commit()

    # tira o pikemon das equipes (ficam em outro banco, entao nao tem ForeignKey p fazer isso sozinho)
    for equipe in db_eq.query(models.EquipeDB).all():
        for slot in SLOTS:
            if getattr(equipe, slot) == pokemon_id:
                setattr(equipe, slot, None)
    db_eq.commit()
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
# GET por id - fica depois do /busca, senao o FastAPI tenta ler "busca" como id
@router.get("/{pokemon_id}", response_model=schemas.PokemonOut)
def buscar_pokemon(pokemon_id: int, db: Session = Depends(get_db)):
    pokemon_db = db.get(models.PokemonDB, pokemon_id)
    if not pokemon_db:
        raise HTTPException(status_code=404, detail="Pokémon não encontrado.")
    return para_schema(pokemon_db)

# POST redefinir - volta um dos 151 originais para os dados do seed
@router.post("/{pokemon_id}/redefinir", response_model=schemas.PokemonOut)
def redefinir_pokemon(pokemon_id: int, db: Session = Depends(get_db)):
    pokemon_db = db.get(models.PokemonDB, pokemon_id)
    if not pokemon_db:
        raise HTTPException(status_code=404, detail="Pokémon não encontrado.")
    if pokemon_id not in pokemons_originais():
        raise HTTPException(status_code=400, detail="Só os pokémons originais podem ser redefinidos.")

    restaurar(pokemon_db, db)
    db.commit()
    db.refresh(pokemon_db)
    return para_schema(pokemon_db)

# POST redefinir todos - volta todos os originais editados de uma vez
@router.post("/redefinir")
def redefinir_todos(db: Session = Depends(get_db)):
    editados = [
        p for p in db.query(models.PokemonDB).filter(models.PokemonDB.id.in_(pokemons_originais())).all()
        if foi_editado(p)
    ]
    # se um deles nao puder voltar (nome ja usado), da erro antes de mudar qualquer um
    ids = {p.id for p in editados}
    for pokemon in editados:
        restaurar(pokemon, db, ignorar_ids=ids)
    db.commit()
    return {"redefinidos": len(editados)}
