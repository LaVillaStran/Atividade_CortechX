# Atividade_CortechX
Atividade 7 ~ 9 da CortechX

> *A lógica original de extração de dados da PokeAPI (web scraping) e a primeira versão do banco de dados foram desenvolvidas por Henrique no início do projeto. Na versão atual, esses dados foram integrados à nova arquitetura do FastAPI.*

## Backend (FastAPI + SQLite)

A arquitetura do projeto foi estruturada seguindo as melhores práticas do FastAPI, utilizando ORM (SQLAlchemy) para o banco de dados e separação de rotas por responsabilidade.

### Como Rodar o Projeto

1. Abra o terminal na pasta raiz e entre na pasta do backend:
```bash
cd backend
```

2. Crie e ative o ambiente virtual:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

4. Popule o banco de dados inicial:
```bash
python -m app.seed
```

5. Suba o servidor:
```bash
uvicorn app.main:app --reload
```

A **Documentação Interativa (Swagger)** ficará disponível em: http://127.0.0.1:8000/docs

---

### Endpoints (Rotas)
As rotas estão isoladas no arquivo `app/routers/pokemons.py`.

| Método | Rota                     | Descrição                           |
|--------|--------------------------|-------------------------------------|
| GET    | `/pokemons/`             | Lista todos os pokémons do banco    |
| POST   | `/pokemons/`             | Cadastra um novo pokémon            |
| PUT    | `/pokemons/{pokemon_id}` | Atualiza os dados de um pokémon     |
| DELETE | `/pokemons/{pokemon_id}` | Deleta um pokémon pelo ID           |

#### Exemplo de corpo JSON esperado no POST e PUT:

```json
{
  "id": 152,
  "nome": "chikorita",
  "geracao": 2,
  "regiao": "johto",
  "tipos": ["grass", "poison"],
  "sprite": "url_da_imagem_aqui"
}
```
