import { movePlayerTo } from "@decentraland/RestrictedActions"
import { TriggerButton } from "./triggerButton"
import * as utils from '@dcl/ecs-scene-utils'
import { createCoin } from "./coin"
import { Sound } from "./sound"
import { movePlayerToVector3 } from "./movePlayerToVector3"

const museum = new Entity()
const museumcolliders = new Entity()
const assets = new Entity()
const rocketboard = new Entity()
const portal = new TriggerButton()
const portal2 = new TriggerButton()

const triggerBoxShape = new utils.TriggerBoxShape(
  new Vector3(1.5, 3, 1.5),
  new Vector3(0, 1, 0)
)

let coincounter = 0

const addCounter = () => {
  if (++coincounter === 10) {
    movePlayerToVector3(new Vector3(16.20, 24.88, 7.29), new Vector3(15.99, 24.88, 7.13))
  }
}





museum.addComponent(new GLTFShape('models/YW_MainGeo_1.glb'))
museumcolliders.addComponent(new GLTFShape('models/YW_Colliders_1.glb'))
assets.addComponent(new GLTFShape('models/YW_Assets_1.glb'))
rocketboard.addComponent(new GLTFShape('models/rocketBoard.glb'))
const rocketBoardTransform = rocketboard.addComponentOrReplace(new Transform({
  position: new Vector3(10.00, 24.88, 7.44),
  scale: new Vector3(1, 1, 1),
  rotation: new Quaternion().setEuler(0.000, 0.000, 0.000),
}))

const rocketFlames = new Entity()
rocketFlames.addComponent(new Transform({ scale: new Vector3(0, 0, 0) }))
rocketFlames.addComponent(new GLTFShape('models/rocketFlames.glb'))
rocketFlames.setParent(rocketboard)
const rocketBoosterSound = new Sound(
  new AudioClip('sounds/rocketBooster.mp3'),
  true
)

portal.addComponentOrReplace(new Transform({
  position: new Vector3(16.07, 1.19, 7.39),
  scale: new Vector3(1, 1, 1),
  rotation: new Quaternion().setEuler(0.000, 0.000, 0.000),
}))
portal.onClick = () => {
  movePlayerTo(new Vector3(16.20, 9.68, 10.29), new Vector3(15.99, 9.68, 3.13))
}

portal2.addComponentOrReplace(new Transform({
  position: new Vector3(16.07, 9.69, 7.39),
  scale: new Vector3(1, 1, 1),
  rotation: new Quaternion().setEuler(0.000, 0.000, 0.000)
}))


portal2.onClick = () => {
  movePlayerTo(new Vector3(16.20, 18.88, 10.29), new Vector3(15.99, 18.68, 3.13))
}

const coinShape = new GLTFShape('models/coin.glb')
const coinPositions = [
  new Vector3(20.33, 18.17, 13.29),
  new Vector3(10.33, 18.17, 13.29),
  new Vector3(18.90, 18.17, 13.29),
  new Vector3(17.90, 18.17, 13.29),
  new Vector3(16.90, 18.17, 13.29),
  new Vector3(15.90, 18.17, 13.29),
  new Vector3(14.90, 18.17, 13.29),
  new Vector3(13.90, 18.17, 13.29),
  new Vector3(12.90, 18.17, 13.29),
  new Vector3(11.90, 18.17, 13.29),
]
for (const coinPosition of coinPositions) {
  createCoin(
    coinShape,
    new Transform({ position: coinPosition }),
    triggerBoxShape,
    addCounter
  )
}

// vectors
let forwardVector = Vector3.Forward().rotate(Camera.instance.rotation)
const velocityScale = 250

// // world
const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)
const groundMaterial = new CANNON.Material('groundMaterial')

// //Create ground plane and apply physics material
const groundBody = new CANNON.Body({ mass: 0 }) //makes the body static
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2) //Reorient ground plane to be on the y axis

const groundShape: CANNON.Plane = new CANNON.Plane()
groundBody.addShape(groundShape)
groundBody.material = groundMaterial
world.addBody(groundBody)

const boxMaterial = new CANNON.Material('boxMaterial')

const rocketBody: CANNON.Body = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(
    rocketBoardTransform.position.x,
    rocketBoardTransform.position.y,
    rocketBoardTransform.position.z
  ),
  shape: new CANNON.Box(new CANNON.Vec3(2, 0.1, 2)), //Create a spherical body with radius 1
  type: CANNON.Body.DYNAMIC
})
rocketBody.material = boxMaterial //Add a bouncy material
world.addBody(rocketBody)

const fixedTimeStep: number = 1.0 / 60.0 //seconds
const maxSubSteps: number = 3

class physicsUpdateSystem implements ISystem {
  update(dt: number): void {
    world.step(fixedTimeStep, dt, maxSubSteps)

    if (isFKeyPressed && rocketBody.position.y < 28) {
      rocketBody.mass = 5
      rocketBody.updateMassProperties()
      rocketBody.applyForce(
        new CANNON.Vec3(0, 1 * velocityScale, 0),
        new CANNON.Vec3(
          rocketBody.position.x,
          rocketBody.position.y,
          rocketBody.position.z
        )
      )
    }
    if (isFKeyPressed && rocketBody.position.y > 30) {
      rocketBody.velocity.set(0, 0, 10)
      rocketBody.mass = 5
      rocketBody.updateMassProperties()
      rocketBody.applyForce(
        new CANNON.Vec3(
          0,
          0,
          1 * velocityScale
        ),
        new CANNON.Vec3(
          rocketBody.position.x,
          rocketBody.position.y,
          rocketBody.position.z
        )
      )
    }

    if (isFKeyPressed && rocketBody.position.z > 18) {
      rocketBody.velocity.set(0, -10, 0)
      rocketBody.mass = 5
      rocketBody.updateMassProperties()
      rocketBody.applyForce(
        new CANNON.Vec3(
          0,
          -1 * velocityScale,
          0
        ),
        new CANNON.Vec3(
          rocketBody.position.x,
          rocketBody.position.y,
          rocketBody.position.z
        )
      )
    }

    if (isFKeyPressed && rocketBody.position.y < 1) {
      rocketBody.velocity.set(10, 0, 0)
      rocketBody.mass = 5
      rocketBody.updateMassProperties()
      rocketBody.applyForce(
        new CANNON.Vec3(
          1 * velocityScale,
          0,
          0
        ),
        new CANNON.Vec3(
          rocketBody.position.x,
          rocketBody.position.y,
          rocketBody.position.z
        )
      )
    }

    if (isFKeyPressed && rocketBody.position.x > 16 && rocketBody.position.y < 1) {
      rocketBody.velocity.set(0, 0, -10)
      rocketBody.mass = 5
      rocketBody.updateMassProperties()
      rocketBody.applyForce(
        new CANNON.Vec3(
          0,
          0,
          -1 * velocityScale
        ),
        new CANNON.Vec3(
          rocketBody.position.x,
          rocketBody.position.y,
          rocketBody.position.z
        )
      )
    }

    if (isFKeyPressed && rocketBody.position.y < 1 && rocketBody.position.z < 10) {
      rocketBody.mass = 0
      rocketBody.updateMassProperties()
      rocketBody.velocity.set(0, 0, 0)
    }
    if (isEKeyPressed) {
      rocketBody.mass = 5
      rocketBody.updateMassProperties()
      rocketBody.applyForce(
        new CANNON.Vec3(
          0,
          0,
          1 * velocityScale
        ),
        new CANNON.Vec3(
          rocketBody.position.x,
          rocketBody.position.y,
          rocketBody.position.z
        )
      )
    }
    rocketBody.angularVelocity.setZero()
    rocketboard.getComponent(Transform).position.copyFrom(rocketBody.position)
    forwardVector = Vector3.Forward().rotate(Camera.instance.rotation)
  }
}

engine.addSystem(new physicsUpdateSystem())

const input = Input.instance
let isFKeyPressed = false
let isEKeyPressed = false

// E Key
input.subscribe('BUTTON_DOWN', ActionButton.PRIMARY, false, () => {
  activateRocketBooster((isEKeyPressed = true))
})
input.subscribe('BUTTON_UP', ActionButton.PRIMARY, false, () => {
  isEKeyPressed = false
  rocketBody.mass = 0
  rocketBody.updateMassProperties()
  rocketBody.velocity.set(0, 0, 0)
  if (!isFKeyPressed) {
    activateRocketBooster(false)
  }
})

// F Key
input.subscribe('BUTTON_DOWN', ActionButton.SECONDARY, false, () => {
  activateRocketBooster((isFKeyPressed = true))
})
input.subscribe('BUTTON_UP', ActionButton.SECONDARY, false, () => {
  isFKeyPressed = false
  rocketBody.mass = 0
  rocketBody.updateMassProperties()
  rocketBody.velocity.set(0, 0, 0)
  if (!isEKeyPressed) {
    activateRocketBooster(false)
  }
})

function activateRocketBooster(isOn: boolean) {
  if (isOn) {
    rocketBoosterSound.getComponent(AudioSource).playing = true
    rocketFlames.getComponent(Transform).scale.setAll(1)
  } else {
    rocketBoosterSound.getComponent(AudioSource).playing = false
    rocketFlames.getComponent(Transform).scale.setAll(0)
  }
}

engine.addEntity(portal)
engine.addEntity(museum)
engine.addEntity(museumcolliders)
engine.addEntity(assets)
engine.addEntity(rocketboard)
engine.addEntity(portal2)





