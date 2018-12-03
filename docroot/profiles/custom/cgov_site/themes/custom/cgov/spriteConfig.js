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
            dest: './',
            sprite: 'images/sprites/svg-sprite.svg',
            render: {
                scss: {
                    dest: "../src/styles/sprites/_svg-sprite-map.scss",
                    template: 'src/styles/sprites/sprite-template.scss'
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