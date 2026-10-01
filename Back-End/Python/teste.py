import json
lista =[]

for i in range(1,10):
    lista.append(
        (i,i+i,i+i+i)
    )

with open('dados1.json', 'w', encoding='utf-8') as f:
    json.dump(lista, f, ensure_ascii=True, indent=4)