from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database.database_pokemons import Base, engine
from .database.database_equipes import BaseEquipes, engine_equipes
from .routers import pokemons,equipe
from .models import EquipeDB  # garante que a tabela está registrada na BaseEquipes

BaseEquipes.metadata.create_all(bind=engine_equipes)

# cria as tabelas no SQLite caso ainda não tenha
Base.metadata.create_all(bind=engine)
app = FastAPI(title="Pokédex API")

# registro de rotas 
app.include_router(pokemons.router)
app.include_router(equipe.router)

# integração com o frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, podes restringir para o URL exato
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
