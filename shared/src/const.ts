const dataDir = '../data'

export const FILE_PATH = {
  DATA_DIR: dataDir,
  RAW_DIR: dataDir + '/raw',
  PRE_PROCESSED_DIR: dataDir + '/pre-processed',
  DATASET_DIR: dataDir + '/dataset',
  JSON_DIR: dataDir + '/dataset/json',
  IMG_DIR: dataDir + '/dataset/image',
  SAMPLES: dataDir + '/dataset/samples.json',
}

export const IMAGE_LABELS = ['car', 'fish', 'house', 'tree', 'bicycle', 'guitar', 'pencil', 'clock'] as const
