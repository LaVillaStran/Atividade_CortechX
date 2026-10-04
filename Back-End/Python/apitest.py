import requests
import json

# Procurar no pokeapi:
#  Número da pokedex, nome, geração, região, tipo, sprite.

lista_pokemons = []


for i in range(1,2): ## Esse for ele foi criado para caso queirmos buscar mais de uma geração,
                     ## então, mas nesse caso, posteriormente podemos elencar alguns problemas do modelo

    url = f"https://pokeapi.co/api/v2/generation/{i}/"

  
    resposta = requests.get(url) ## Fazemos uma api diretamente no site com base na geração de nosso interesse
                                 ## que para o site, será a primeira geração de pokemons


    if resposta.status_code == 200: ## Caso obtenhamos uma resposta positiva da API do pokeapi, fazemos a 
                                    ## parte de incorporação desses dados

        dados = resposta.json()

        pokemons = dados["pokemon_species"] ## Nome

        regiao = dados["main_region"]["name"] ## regiao
        
        for pokemon in pokemons:

            
            tipos = [] ## Esses tipos eu deixei para os tipos de cada pokemon,
                       ## e não deixei unitário, pois existem pokemons de mais de um tipo

            url_pokemon = f"https://pokeapi.co/api/v2/pokemon/{pokemon["name"]}/"

            dados_pokemon = requests.get(url_pokemon).json()

            numero = dados_pokemon["id"] ## número da pokedex

            tipos = [item["type"]["name"] for item in dados_pokemon["types"]] ## tipos

            sprite = dados_pokemon["sprites"]["versions"]["generation-i"]["yellow"]["front_transparent"] ## sprites

            '''
            OBS.: Percebi um problema pertinente nessa parte, se pegarmos um pokemon em uma geração diferente da primeria, haverá 
            um erro no código pois, ele fará uma busca e não existará o caminho "['version']['generation-i']"
            mas como estamos fazendo apenas um teste e até então será na primeira geração, manteremos isso
            '''
            
            lista_pokemons.append(

                
                (numero,pokemon["name"],i,regiao,tipos,sprite) ## Aqui criamos a tupla com os valores obtidos

            )

    else:

        
        print("Erro:", resposta.status_code) ## Caso a requisição dê errado, mostrará uma mensagem de erro


print(lista_pokemons) ## Para termos uma noção do que pegamos, eu uso esse print


with open('Lista_pokemons.json', 'w', encoding='utf-8') as f: ## Aqui criamos o arquivo JSON que usaremos durante toda a aplicação
    json.dump(lista_pokemons, f, ensure_ascii=False, indent=4)