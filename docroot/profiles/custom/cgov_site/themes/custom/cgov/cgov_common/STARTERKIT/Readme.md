# Creating a CGOV Sub Theme

1. Copy the `cgov_themename` folder into the `themes/custom/cgov` folder
2. Rename all instances of `themename` and `Themename` with your new theme name using the proper letter casing and underscores for spaces (where necessary)
3. Add the new theme to the exported array in `themes/custm/cgov/themes.config.js`
4. Run `npm run watch` in the command line to ensure all themes are being built properly and assets are generated in a local `dist` folder
