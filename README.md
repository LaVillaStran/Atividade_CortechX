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
python3.11 -m venv .venv  # precisa do Python 3.10 ou mais novo
source .venv/bin/activate
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

4. Popule o banco de dados inicial:
```bash
python -m app.seed.seed
```

5. Suba o servidor:
```bash
uvicorn app.main:app --reload
```

A **Documentação Interativa (Swagger)** ficará disponível em: http://127.0.0.1:8000/docs

---

### Endpoints (Rotas)
As rotas ficam em `app/routers/pokemons.py` e `app/routers/equipe.py`.

#### Pokémons

| Método | Rota                     | Descrição                                        |
|--------|--------------------------|--------------------------------------------------|
| GET    | `/pokemons/`             | Lista todos os pokémons do banco                 |
| GET    | `/pokemons/busca`        | Busca por `nome`, `regiao` e/ou `tipo` (query)   |
| GET    | `/pokemons/{pokemon_id}` | Busca um pokémon pelo ID                         |
| POST   | `/pokemons/`             | Cadastra um novo pokémon                         |
| PUT    | `/pokemons/{pokemon_id}` | Atualiza os dados de um pokémon (o id não muda)  |
| DELETE | `/pokemons/{pokemon_id}` | Deleta um pokémon e tira ele das equipes         |

Exemplo de corpo JSON no POST (no PUT é igual, só que sem o `id`):

```json
{
  "id": 152,
  "nome": "chikorita",
  "geracao": 2,
  "regiao": "johto",
  "tipo_1": "grass",
  "tipo_2": null,
  "sprite": "url_da_imagem_aqui"
}
```

Regras:
- `regiao` e os tipos só aceitam os valores oficiais (9 regiões e 18 tipos), em maiúsculo ou minúsculo
- `geracao` vai de 1 a 9
- `tipo_2` é opcional e não pode ser igual ao `tipo_1`
- não pode ter dois pokémons com o mesmo nome nem com o mesmo id

#### Equipes

| Método | Rota                                         | Descrição                                        |
|--------|----------------------------------------------|--------------------------------------------------|
| GET    | `/equipes/`                                  | Lista as equipes                                 |
| GET    | `/equipes/{equipe_id}`                       | Mostra a equipe com os dados dos pokémons        |
| POST   | `/equipes/`                                  | Cria uma equipe                                  |
| PUT    | `/equipes/{equipe_id}`                       | Atualiza o treinador e os 6 slots                |
| DELETE | `/equipes/{equipe_id}`                       | Deleta uma equipe                                |
| POST   | `/equipes/{equipe_id}/pokemons/{pokemon_id}` | Coloca um pokémon no primeiro slot vazio         |
| DELETE | `/equipes/{equipe_id}/pokemons/{pokemon_id}` | Tira um pokémon da equipe                        |

Exemplo de corpo JSON no POST e PUT:

```json
{
  "nome_treinador": "ash",
  "pokemon_1": 25,
  "pokemon_2": 6
}
```

Regras:
- no máximo 6 pokémons, sem repetir
- os pokémons precisam existir
- cada treinador tem uma equipe só (o nome não repete)
