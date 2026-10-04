from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# arquivo SQL criado na pasta de onde o servidor for executado
SQLALCHEMY_DATABASE_URL = "sqlite:///./pokemons.db"

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
