from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from pathlib import Path


PASTA_DB = next(p / "BancoDeDados" for p in Path(__file__).resolve().parents
    if (p / "BancoDeDados").is_dir()
)
ARQUIVO_DB = PASTA_DB / "pokemons.db"

# arquivo SQL criado na pasta de onde o servidor for executado
SQLALCHEMY_DATABASE_URL = f"sqlite:///./{ARQUIVO_DB}"

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
