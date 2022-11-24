import { movePlayerTo } from "@decentraland/RestrictedActions"

export const movePlayerToVector3 = (position: Vector3, cameraTarget: Vector3) => {
    movePlayerTo({
        x: position.x,
        y: position.y,
        z: position.z,
    },{
        x: cameraTarget.x,
        y: cameraTarget.y,
        z: cameraTarget.z,
    })
}