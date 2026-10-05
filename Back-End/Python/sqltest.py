import sqlite3
import json
import pandas as pd

NOME_JSON = "Lista_pokemons.json" ## o path do arquivo JSON

NOME_BANCO = "Pokemons.db" ## o arquivo que iremos criar/modificar (caso exista)

def criação_implementacao(): ## Criação do Banco de dados ou implementação de novas feats

    with open(NOME_JSON, "r", encoding="utf-8") as f:
            
            lista_de_tuplas = json.load(f) ## Aqui lemos o arquivo que usaremos durante todo o trabalho

    conn = sqlite3.connect("Pokemons.db") ## Fazemos a conexão com o banco de dados

    cursor = conn.cursor() ## com o cursor, somos capazes de manipular ou processar as infomações
                           ## dentro de um branco de dados (BD)
    cursor.execute("""

        CREATE TABLE IF NOT EXISTS pokemons (
            id INTEGER, 
            nome TEXT,
            geracao INTEGER,
            regiao TEXT,
            tipo_1 TEXT,
            tipo_2 TEXT,
            sprite TEXT

        )

    """) ## Criamos as colunas com as informações dentro do JSON


    cursor.executemany(
         
            "INSERT INTO pokemons (id, nome, geracao, regiao, tipo_1,tipo_2, sprite) VALUES(?,?,?,?,?,?,?)", lista_de_tuplas ## Aqui efetivamente inserimos os dados

    )

    conn.commit() ## mandamos as alterações que fizemos pro BD

    conn.close()  ## PRA finalizar, fechamos a conexão


def conexao(id):

    conn = sqlite3.connect(id)

    cursor = conn.cursor()

    cursor.execute("SELECT * FROM pokemons") ## pegamos as inforamções do BD

    for id, nome, geracao, regiao, tipo_1, tipo_2, sprite in cursor.fetchall(): ## Mostramos as informações

        print(f"ID: {id} | Nome: {nome}\n")

        print(f"Geração: {geracao} | Região: {regiao}\n")

        print(f"Tipos 1: {tipo_1}\n")

        print(f"Tipos 2: {tipo_2}\n")

        print(f"Sprites: {sprite}\n")

        print("-" * 40)

    conn.close() ## depois fecho a conexão

# Para criar um novo BD, se possível
## criação_implementacao()

# Para ver o dataset em JSON
## df = pd.read_json("Lista_pokemons.json")
## print(df)

# Para ver o BD em si 
conexao(NOME_BANCO)