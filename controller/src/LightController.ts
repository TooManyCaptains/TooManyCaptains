import * as _ from 'lodash'
import { Light, LightColor } from './types'
const ws281x = require('rpi-ws281x-native') // tslint:disable-line

export class LightController {

  public readonly numLights: number
  private lights: Light[] = []
  private lightsFlashingTimer: null | NodeJS.Timer = null
  private lightsFlashingCounter: number = 0

  constructor(numLights: number) {
    this.numLights = numLights
    this.setup()
  }

  public setLights(lights: Light[]): void {
    this.lights = lights
    this.updateLights()
  }

  public teardown(): void {
    ws281x.reset()
  }

  public startFlashingLights(color: LightColor, limit = this.numLights, delay = 750) {
    this.stopFlashingLights()
    const op = () => {
      if (this.lightsFlashingCounter % 2 === 0) {
        this.setLights(_.times(limit, index => ({index, color})))
      } else {
        this.setLights([])
      }
      this.lightsFlashingCounter += 1
    }
    op()
    this.lightsFlashingTimer = global.setInterval(op, delay)
  }

  public stopFlashingLights() {
    this.lightsFlashingCounter = 0
    if (this.lightsFlashingTimer) {
      global.clearInterval(this.lightsFlashingTimer)
    }
  }

  private updateLights() {
    const pixelData = new Uint32Array(this.numLights)
    _.times(this.numLights, i => {
      const light = this.lights.find(({index}) => index === i)
      if (light) {
        pixelData[i] = light.color
      }
    })
    ws281x.render(pixelData)
  }

  private setup(): void {
    ws281x.init(this.numLights)
  }

}
