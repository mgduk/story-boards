export default class RobotBall {

  // directions can be:
  // - turn left
  // - turn right
  // - straight on

  when(we_see) {
    if (we_see === 'suit of armour') {
      return 'turn left'

    } else if (we_see === 'large mirror') {
      return 'turn right'

    } else if (we_see === 'tiger painting') {
      return 'straight on'

    } else if (we_see === 'chair') {
      return 'turn right'
    }
  }
}
