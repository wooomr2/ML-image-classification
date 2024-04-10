const dataDir = '../data'
const webDir = '../web'

export const FILE_PATH = {
  DATA_DIR: dataDir,
  RAW_DIR: dataDir + '/raw',
  PRE_PROCESSED_DIR: dataDir + '/pre-processed',
  DATASET_DIR: dataDir + '/dataset',
  JSON_DIR: dataDir + '/dataset/json',
  IMG_DIR: dataDir + '/dataset/img',

  SAMPLES_JSON: dataDir + '/dataset/samples.json',
  FEATURES_JSON: dataDir + '/dataset/features.json',
  TRAINING_JSON: dataDir + '/dataset/training.json',
  TESTING_JSON: dataDir + '/dataset/testing.json',

  TRAINING_CSV: dataDir + '/dataset/training.csv',
  TESTING_CSV: dataDir + '/dataset/testing.csv',

  DECISION_BOUNDARY_IMG: dataDir + '/dataset/model/decision-boundary.png',

  // web
  SAMPLES_TS: webDir + '/src/data/samples.ts',
  FEATURES_TS: webDir + '/src/data/features.ts',
  TRAINING_TS: webDir + '/src/data/training.ts',
  TESTING_TS: webDir + '/src/data/testing.ts',
  MIN_MAX_TS: webDir + '/src/data/minMax.ts',
  
  // web-public
  WEB_IMG_DIR: webDir + '/public/img',
  WEB_DECISION_BOUNDARY_IMG: webDir + '/public/model/decision-boundary.png',
}

export const IMAGE_LABELS = ['car', 'fish', 'house', 'tree', 'bicycle', 'guitar', 'pencil', 'clock'] as const

export const IMAGE_STYLES = {
  car: { color: 'gray', text: '🚗' },
  fish: { color: 'red', text: '🐠' },
  house: { color: 'yellow', text: '🏠' },
  tree: { color: 'green', text: '🌳' },
  bicycle: { color: 'cyan', text: '🚲' },
  guitar: { color: 'blue', text: '🎸' },
  pencil: { color: 'magenta', text: '✏️' },
  clock: { color: 'lightgray', text: '🕒' },
  //
  '?': { color: 'red', text: '❓' },
}
