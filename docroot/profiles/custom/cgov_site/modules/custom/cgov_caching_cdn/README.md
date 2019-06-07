# Additional Notes for This Module
1. '/sites/default/settings/cgov_caching.settings.php' controls the edgerc_path setting of the Akamai module.
   * The path should be '/mnt/gfs/${AH_SITE}.${AH_ENVIRONMENT}/protected/.edgerc'
   * This means you need to make sure there is a .edgerc file at the path. Lots of stuff breaks if this module is not configured correctly.
1. The cgov_site CgovFeaturesAlter FeaturesAssignment makes sure this setting is stripped from config export.
