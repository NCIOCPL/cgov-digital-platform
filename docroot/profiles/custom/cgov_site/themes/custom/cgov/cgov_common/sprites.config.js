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
            padding: 10      // Padding around all shapes - must remain 5 due to calculation bug in svg-sprite
        }
    },
    mode: {
        css: {       // Activate the «css» mode
            sprite: path.resolve(__dirname, './dist/images/sprites/svg-sprite.svg'),
            render: {
                scss: {
                    dest: path.resolve(__dirname, "./src/styles/sprites/_svg-sprite-map.scss"),
                    template: path.resolve(__dirname, '../src/styles/sprites/sprite-template.scss'),
                }
            },
            layout:"vertical",
            bust: false,
            example: false
        }
    },
    variables: {
        mapname: "icons"
    },
    svg: {
        precision: 5
    }

};
