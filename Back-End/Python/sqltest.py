import sqlite3
import json

NOME_JSON = "Lista_pokemons.json"
NOME_BANCO = "Pokemons.db"

def criação_implementacao():
    with open(NOME_JSON, "r", encoding="utf-8") as f:
            lista_de_tuplas = json.load(f)

    conn = sqlite3.connect("Pokemons.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pokemons (
            id INTEGER,
            nome TEXT,
            geracao INTEGER,
            regiao TEXT,
            tipo TEXT,
            sprite TEXT
        )
    """)

    dados_para_inserir = []

    for pokemon in lista_de_tuplas:
        linha = list(pokemon)

        linha[4] = json.dumps(linha[4], ensure_ascii=False)  # tipos
        linha[5] = json.dumps(linha[5], ensure_ascii=False)  # sprites

        dados_para_inserir.append(linha)

    cursor.executemany(
            "INSERT INTO pokemons (id, nome, geracao, regiao, tipo, sprite) VALUES(?,?,?,?,?,?)", dados_para_inserir
    )

    conn.commit()
    conn.close()    

def conexao(id):
    conn = sqlite3.connect(id)
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM pokemons")

    for id, nome, geracao, regiao, tipo, sprite in cursor.fetchall():
        print(f"ID: {id} | Nome: {nome}\n")
        print(f"Geração: {geracao} | Região: {regiao}\n")
        print(f"Tipos: {json.loads(tipo)}\n")
        print(f"Sprites: {json.loads(sprite)}\n")
        print("-" * 40)

    conn.close()
conexao(NOME_BANCO)