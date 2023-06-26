prod = {"prod_name": "", "ingredient": "", "price": ""}
prods = []


while 1:
    prods.append({"prod_name" : input("Prod name : "), "ingredient" : input("ingredient : "), "price" : input("Price: ")})
    if (input("Done ?") == "y"): break

print(prods)
with open("data.txt", "a") as f:
    for e in prods:
        f.write(str(e) + ",\n")
