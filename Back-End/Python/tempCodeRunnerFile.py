import requests
import json
# Procurar no pokeapi:
# Nome, número, geração, região, tipo, fraqueza.
lista_pokemons = []
for i in range(1,2):
    url = f"https://pokeapi.co/api/v2/generation/{i}/"
    resposta = requests.get(url)

    if resposta.status_code == 200:
        dados = resposta.json()
        pokemons = dados["pokemon_species"]
        regiao = dados["main_region"]["name"]
        
        for pokemon in pokemons:
            tipos = []
            fraquezas = []
            url_pokemon = f"https://pokeapi.co/api/v2/pokemon/{pokemon["name"]}/"
            dados_pokemon = requests.get(url_pokemon).json()

            numero = dados_pokemon["id"]

            # Pega os tipos e as fraquezas
            for tipo in dados_pokemon["types"]:

                nome_tipo = tipo["type"]["name"]
                tipos.append(nome_tipo)

                url_tipo = tipo["type"]["url"]
                dados_tipo = requests.get(url_tipo).json()

                for fraqueza in dados_tipo["damage_relations"]["double_damage_from"]:
                    fraquezas.append(fraqueza["name"])

            lista_pokemons.append(
                (pokemon["name"],numero,i,regiao,tipo,fraqueza)
            )
    else:
        print("Erro:", resposta.status_code)
with open('Lista_pokemons.json', 'w', encoding='utf-8') as f:
    json.dump(lista_pokemons, f, ensure_ascii=False, indent=4)