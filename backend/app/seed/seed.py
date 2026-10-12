import json
from functools import lru_cache
from pathlib import Path

from ..database import Base, SessionLocal, engine
from ..models.models import PokemonDB

# achar a pasta raiz independete da maquina
ARQUIVO_JSON = Path(__file__).resolve().parents[2] / "data" / "Lista_pokemons.json"

CAMPOS = ("nome", "geracao", "regiao", "tipo_1", "tipo_2", "sprite")


# dados originais dos 151, por id. Tambem usado pelo "redefinir" da API.
# lru_cache: le o arquivo uma vez so, nao a cada requisicao
@lru_cache
def pokemons_originais() -> dict:
    with open(ARQUIVO_JSON, encoding="utf-8") as f:
        lista = json.load(f)
    return {linha[0]: dict(zip(CAMPOS, linha[1:])) for linha in lista}


def popular():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    inseridos = 0
    
    try:
        for numero, dados in pokemons_originais().items():

            if db.get(PokemonDB, numero):
                continue  
                
            db.add(PokemonDB(id=numero, **dados))
            inseridos += 1
            
        db.commit()
    finally:
        db.close()

    print(f"{inseridos} pokémons inseridos com sucesso!")


if __name__ == "__main__":
    popular()
