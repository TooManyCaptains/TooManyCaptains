import { flatten } from 'lodash'
import * as colors from 'colors/safe'
import { Client } from './client'
import { panels } from './panels'
import { buttons } from './buttons'
import { GameState, Packet, LightColor, Light } from './types'
import { ButtonController } from './ButtonController'
import { PanelController } from './PanelController'
import { LightController } from './LightController'

(function main() {

  let gameState: GameState = 'wait_for_players'

  function onPacket(packet: Packet) {
    if (packet.kind === 'gamestate') {
      // Update local copy of game state if different
      if (packet.state !== gameState) {
        gameState = packet.state
        console.info('new game state: ', gameState)
        updatePanelLights()
      }
    }
  }

  // Create a client to interact with the server
  const url = process.env.GANGLIA_SERVER_URL || 'http://server.toomanycaptains.com'
  const client = new Client(url, onPacket)

  // Create a panel controller to manage plugging and unplugging wires into panels
  const panelController = new PanelController(panels, client.sendPacket.bind(client), () => gameState)

  // Create a button controller to manage button presses
  const buttonController = new ButtonController(buttons, client.sendPacket.bind(client), () => gameState)

  // Create a light controller for the wire/panel LEDs
  const numLights = flatten(panels.map(p => p.lightIndicies)).length
  const lightController = new LightController(numLights)

  // Update lights (all at once, since they are daisy-chained via PWM)
  function updatePanelLights() {
    let lights: Light[] = []
    if (gameState === 'wait_for_players') {
      lightController.startFlashingLights(LightColor.green, 6, 100000)
    } else if (gameState === 'game_over') {
      lightController.startFlashingLights(LightColor.red)
    } else if (gameState === 'in_game') {
      lightController.stopFlashingLights()
      lights = flatten(panelController.panels.map(panel => panel.lights))
      lightController.setLights(lights)
    }
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
