const path = require('path');

/*****************************************
 * SVG Sprite Generation
 ****************************************/
module.exports = {
    shape: {
        dimension: {		// Dimension related options
            precision: 5    // Floating point precision
        }
        ,
        spacing: {
            padding: 0      // Padding around all shapes - must remain 5 due to calculation bug in svg-sprite
        }
    },
    mode: {
        view: {       // Activate the «css» mode
            sprite: path.resolve(__dirname, './dist/images/sprites/svg-sprite.svg'),
            render: {
                scss: {
                    dest: path.resolve(__dirname, "./src/styles/sprites/_svg-sprite-map.scss"),
                    template: path.resolve(__dirname, '../src/styles/sprites/sprite-template.scss'),
                }
            },
            layout: "packed",
            bust: true,
            example: false
        }
    },
    variables: {
        mapname: "icons",
        // This is a helper to extract just the sprite filename. You can use {{sprite}}, however,
        // that is the full path to the destination, and not using the webpack alias.
        filename() {
          return (fullPath, render) => {
            // The string passed into mustach appears to be html encoded.
            const pathArr = render(fullPath).split('&#x2F;');
            return pathArr.at(-1);
          }
        }
    },
    svg: {
        precision: 5
    }

};
