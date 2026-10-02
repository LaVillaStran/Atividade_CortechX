import requests
import json

# Procurar no pokeapi:
#  Número, nome, geração, região, tipo, sprite.

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
            url_pokemon = f"https://pokeapi.co/api/v2/pokemon/{pokemon["name"]}/"
            dados_pokemon = requests.get(url_pokemon).json()
            numero = dados_pokemon["id"]
            # Pega os tipos 
            tipos = [item["type"]["name"] for item in dados_pokemon["types"]]
            sprite = dados_pokemon["sprites"]["versions"]["generation-i"]["yellow"]

            lista_pokemons.append(
                (numero,pokemon["name"],i,regiao,tipos,sprite)
            )

    else:
        print("Erro:", resposta.status_code)

print(lista_pokemons)
with open('Lista_pokemons.json', 'w', encoding='utf-8') as f:
    json.dump(lista_pokemons, f, ensure_ascii=False, indent=4)