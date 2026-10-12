from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from pathlib import Path


# pasta backend/data, onde ficam os arquivos .db e o JSON do seed
PASTA_DB = Path(__file__).resolve().parents[2] / "data"
PASTA_DB.mkdir(parents=True, exist_ok=True)
ARQUIVO_DB = PASTA_DB / "pokemons.db"

# caminho absoluto: funciona de qualquer pasta onde o servidor for executado
SQLALCHEMY_DATABASE_URL = f"sqlite:///{ARQUIVO_DB.as_posix()}"

# check_same_thread=False é necessario porque pode acabar usando threads diferentes por req
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    # abre uma nova sessao de bd para cara requisicao e fecha no final da requisicao
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
