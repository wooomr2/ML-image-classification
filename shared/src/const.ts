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

  // web
  WEB_IMG_DIR: webDir + '/public/img',
  WEB_SAMPLES_TS: webDir + '/src/data/samples.ts',
  WEB_FEATURES_TS: webDir + '/src/data/features.ts',
}

export const IMAGE_LABELS = ['car', 'fish', 'house', 'tree', 'bicycle', 'guitar', 'pencil', 'clock'] as const
