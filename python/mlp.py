import json

from helpers import readFeatureFile
from sklearn.neural_network import MLPClassifier

hidden = (10, 10, 10)
mlp = MLPClassifier(
    hidden,
    max_iter=10000,
    random_state=1,
    activation='tanh'
)

X, Y = readFeatureFile("../data/dataset/training.csv")

mlp.fit(X, Y)

X, Y = readFeatureFile("../data/dataset/testing.csv")

accuracy = mlp.score(X, Y)
print("Accuracy:", accuracy)


classes = [
    "car", "fish", "house", "tree",
    "bicycle", "guitar", "pencil", "clock"
]

jsonObj = {
    "neuronCounts": [len(X[0]), hidden, len(classes)],
    "classes": classes,
    "network": {
        "levels": []
    }
}

for i in range(0, len(mlp.coefs_)):
    level = {
        "inputs": [0]*len(mlp.coefs_[i]),
        "outputs": [0]*len(mlp.intercepts_[i]),
        "weights": mlp.coefs_[i].tolist(),
        "biases": mlp.intercepts_[i].tolist()
    }
    jsonObj["network"]["levels"].append(level)

json_object = json.dumps(jsonObj, indent=2)


with open('../data/model/model.json', "w") as outfile:
    outfile.write(json_object)

with open('../web/src/data/model.ts', "w") as outfile:
    outfile.write("export const model="+json_object+';')
