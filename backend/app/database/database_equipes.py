from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

PASTA_DB = Path(__file__).resolve().parents[2] / "BancoDeDados"
PASTA_DB.mkdir(parents=True, exist_ok=True)

ARQUIVO_DB = PASTA_DB / "equipes.db"

engine_equipes = create_engine(
    f"sqlite:///{ARQUIVO_DB.as_posix()}",
    connect_args={"check_same_thread": False},
)

SessionEquipes = sessionmaker(autocommit=False, autoflush=False, bind=engine_equipes)

# Base própria: assim o create_all de cada banco só cria as suas tabelas
BaseEquipes = declarative_base()


def get_db_equipes():
    db = SessionEquipes()
    try:
        yield db
    finally:
        db.close()