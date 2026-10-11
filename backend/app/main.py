from fastapi import FastAPI
from .database import Base, engine
from .routers import pokemons
from fastapi.middleware.cors import CORSMiddleware

# cria as tabelas no SQLite caso ainda não tenha
Base.metadata.create_all(bind=engine)
app = FastAPI(title="Pokédex API")

# registro de rotas 
app.include_router(pokemons.router)

# integração com o frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, podes restringir para o URL exato
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)