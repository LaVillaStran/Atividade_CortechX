import json
import requests

url_pokemon = f"https://pokeapi.co/api/v2/pokemon/pikachu/"
dados_pokemon = requests.get(url_pokemon).json()
with open('dados1.json', 'w', encoding='utf-8') as f:
    json.dump(dados_pokemon, f, ensure_ascii=True, indent=4)