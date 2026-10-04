from fastapi import FastAPI
from .database import Base, engine
from .routers import pokemons

# cria as tabelas no SQLite caso ainda não tenha
Base.metadata.create_all(bind=engine)
app = FastAPI(title="Pokédex API")

# registro de rotas 
app.include_router(pokemons.router)