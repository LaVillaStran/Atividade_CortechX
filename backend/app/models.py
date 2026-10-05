import json
from typing import List

from sqlalchemy import Column, Integer, String

from .database import Base

"""
O QUE É O ORM?

no codigo de henrique, a criacao do banco de dados era feita
escrevendo comandos SQL diretamente. No entanto, alem de ser um padrao atual 
de desenvolvimento, tambem é um requisito do desafio.

o ORM (SQLAlchemy) é uma ferramenta que mapeia as tabelas
do banco de dados para classes em python. 

mas quais sao as vantagens do uso do ORM em uma arquitetura?
1. código limpo: a gente nao vai precisar escrever codigos SQL puro.
2. segurança: tem uma protecao automatica contra ataques SQL injection (nao se aplica ao nosso caso kkkkkk)
3. portabilidade: se a gente decidir trocar o banco SQLite para um outro banco de dados mais robusto,
   a classe abaixo não muda em nada, o ORM ja faz a traducao quase que automatica.
"""


# ao herdar de 'Base', a ORM entende que isso é uma tabela, cada instancia vai ser uma linha na tabela
class PokemonDB(Base):

    # defininicao do nome da tabela no bd
    __tablename__ = "pokemons"

    # definição das colunas:
    # primary_key=True: id da pokedex é a chave primaria na tabela, é unico
    # index=True: cria um índice no banco, acaba melhorando a performance de buscas pelo campo id
    id = Column(Integer, primary_key=True, index=True)
    
    # nullable=False: significa basicamente que este campo é obrigatório
    nome = Column(String, nullable=False, index=True)
    geracao = Column(Integer, nullable=False)
    regiao = Column(String, nullable=False)
    
    # os tipos de pokemons tiveram algumas reformulações e fizemos a criação,
    # de duas colunas contendo os tipos de um pokemon

    tipo_1 = Column(String, nullable=False)

    # nullable=True: caso o pokemon tenha apenas um tipo

    tipo_2 = Column(String, nullable=True)
    
    # nullable=True: caso o link da imagem quebre na API original,
    # a gnt vai aceitar que seja nulo (opcional) p evitar quebrar a API
    sprite = Column(String, nullable=True)
