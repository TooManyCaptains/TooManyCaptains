import { flatten } from 'lodash'
import * as colors from 'colors/safe'
import { Client } from './client'
import { panels } from './panels'
import { buttons } from './buttons'
import { GameState, Event, LightColor, Light } from './types'
import { ButtonController } from './ButtonController'
import { PanelController } from './PanelController'
import { LightController } from './LightController'

(function main() {

  let gameState: GameState = 'before'

  function onGameStateChanged(state: GameState) {
    if (state === gameState) {
      return
    }
    console.info('new game state: ', state)
    gameState = state
    updatePanelLights()
  }

  // Create a client to interact with the server
  const url = process.env.GANGLIA_SERVER_URL || 'http://server.toomanycaptains.com'
  const client = new Client(url, onGameStateChanged, () => panelController.emitAll())

  // Create a panel controller to manage plugging and unplugging wires into panels
  const panelController = new PanelController(panels, onEvent, () => gameState)

  // Create a button controller to manage button presses
  const buttonController = new ButtonController(buttons, onEvent, () => gameState)

  // Create a light controller for the wire/panel LEDs
  const numLights = flatten(panels.map(p => p.lightIndicies)).length
  const lightController = new LightController(numLights)

  // Update lights (all at once, since they are daisy-chained via PWM)
  function updatePanelLights() {
    let lights: Light[] = []
    if (gameState === 'before') {
      lightController.startFlashingLights(LightColor.green, 6, 100000)
    } else if (gameState === 'over') {
      lightController.startFlashingLights(LightColor.red)
    } else if (gameState === 'start') {
      lightController.stopFlashingLights()
      lights = flatten(panelController.panels.map(panel => panel.lights))
      lightController.setLights(lights)
    }
  }

  // Dispatch event to client and update other state as needed
  function onEvent(event: Event) {
    console.info(`${event.name} => ${event.data}`)
    client.emit(event)
    updatePanelLights()
  }

  console.info(`\n${colors.bold('Wire poll rate')}: ${1000 / panelController.pollRateMsec} Hz`)
  console.info(`${colors.bold('Button poll rate')}: ${1000 / buttonController.pollRateMsec} Hz`)
  console.info(`${colors.bold('Server')}: ${client.url}\n`)
  updatePanelLights()

  function teardownAndExitCleanly() {
    lightController.teardown()
    process.nextTick(() => process.exit(0))
  }

  process.on('SIGINT', teardownAndExitCleanly)
  process.on('SIGTERM', teardownAndExitCleanly)
})()
