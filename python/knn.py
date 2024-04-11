from helpers import readFeatureFile
from sklearn.neighbors import KNeighborsClassifier

X, Y = readFeatureFile('../data/dataset/training.csv')

knn = KNeighborsClassifier(n_neighbors=50)
knn.fit(X, Y)

X, Y = readFeatureFile('../data/dataset/testing.csv')
accuracy = knn.score(X, Y)

print("Accuracy: ", accuracy*100, "%")
