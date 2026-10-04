import json
from pathlib import Path

from .database import Base, SessionLocal, engine
from .models import PokemonDB

# achar a pasta raiz independete da maquina
ARQUIVO_JSON = Path(__file__).resolve().parents[2] / "Lista_pokemons.json"


def popular():
    Base.metadata.create_all(bind=engine)

    with open(ARQUIVO_JSON, encoding="utf-8") as f:
        lista = json.load(f) 

    db = SessionLocal()
    inseridos = 0
    
    try:
        for numero, nome, geracao, regiao, tipos, sprite in lista:

            if db.get(PokemonDB, numero):
                continue  
                
            db.add(PokemonDB(
                id=numero,
                nome=nome,
                geracao=geracao,
                regiao=regiao,
                tipos=json.dumps(tipos, ensure_ascii=False),
                sprite=sprite,
            ))
            inseridos += 1
            
        db.commit()
    finally:
        db.close()

    print(f"{inseridos} pokémons inseridos com sucesso!")


if __name__ == "__main__":
    popular()
