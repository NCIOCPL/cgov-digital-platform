/*
** componentExists
**
** Check whether the given component exists in the components directory
*/

const fs = require('fs')
const path = require('path')

module.exports = function componentExists(component, componentPath) {
  const components = fs.readdirSync(path.join(__dirname, componentPath))

  return components.indexOf(component) >= 0
}
