dicts: dict[str, int] = {
    "car": 0,
    "fish": 1,
    "house": 2,
    "tree": 3,
    "bicycle": 4,
    "guitar": 5,
    "pencil": 6,
    "clock": 7
}


def readFeatureFile(filePath: str):
    f = open(filePath, 'r')
    lines = f.readlines()
    print(len(lines))

    X: list[float] = []
    Y: list[str] = []

    for i in range(1, len(lines)):
        row = lines[i].split(',')
        X.append([float(row[j]) for j in range(len(row)-1)])
        Y.append(dicts[row[-1].strip()])

    return X, Y
