export default class MLCron {
  static async run() {
    console.log('RUN MLCron')
    await MLCron._generate_dataset()
  }

  static async _generate_dataset() {
    console.log('GENERATING DATASET ...')
  }
}
