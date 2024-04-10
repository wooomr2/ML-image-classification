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

  // web
  SAMPLES_TS: webDir + '/src/data/samples.ts',
  FEATURES_TS: webDir + '/src/data/features.ts',
  TRAINING_TS: webDir + '/src/data/training.ts',
  TESTING_TS: webDir + '/src/data/testing.ts',
  MIN_MAX_TS: webDir + '/src/data/minMax.ts',

  WEB_IMG_DIR: webDir + '/public/img',
}

export const IMAGE_LABELS = ['car', 'fish', 'house', 'tree', 'bicycle', 'guitar', 'pencil', 'clock'] as const
