import path from 'path'

const dataDir = path.join(__dirname, '../../../data')
const webDir = path.join(__dirname, '../../../web')

export const FILE_PATH = {
  DATA_DIR: dataDir,
  RAW_DIR: dataDir + '/raw',
  MODEL_DIR: dataDir + '/model',
  DATASET_DIR: dataDir + '/dataset',
  JSON_DIR: dataDir + '/dataset/json',
  IMG_DIR: dataDir + '/dataset/img',

  MODEL_JSON: dataDir + '/model/model.json',

  SAMPLES_JSON: dataDir + '/dataset/samples.json',
  FEATURES_JSON: dataDir + '/dataset/features.json',
  TRAINING_JSON: dataDir + '/dataset/training.json',
  TESTING_JSON: dataDir + '/dataset/testing.json',

  TRAINING_CSV: dataDir + '/dataset/training.csv',
  TESTING_CSV: dataDir + '/dataset/testing.csv',

  DECISION_BOUNDARY_IMG: dataDir + '/model/decision-boundary.png',

  // web
  SAMPLES_TS: webDir + '/src/data/samples.ts',
  FEATURES_TS: webDir + '/src/data/features.ts',
  TRAINING_TS: webDir + '/src/data/training.ts',
  TESTING_TS: webDir + '/src/data/testing.ts',
  MIN_MAX_TS: webDir + '/src/data/minMax.ts',
  MODEL_TS: webDir + '/src/data/model.ts',

  // web-public
  WEB_IMG_DIR: webDir + '/public/img',
  WEB_DECISION_BOUNDARY_IMG: webDir + '/public/model/decision-boundary.png',
}
