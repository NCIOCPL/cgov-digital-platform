<?php

// This class is autoloaded in some contexts, and explicitly required in others,
// so we're going to guard against accidentally defining it twice.
if(!class_exists('CgovIdpTools')){

  /**
   * Utility class for working with Identity Provider Metadata files.
   */
  class CgovIdpTools {

    /**
     * Returns the path to the appropriate IDP's metadata file based on the
     * current hosting environment and the specific current site.
     */
    public static function getIdpFilepath() {

      /*
       * When this class is loaded via the SAML return POST request, none of Acquia's support
       * scaffolding has been loaded. We could potentially reproduce the logic, but
       * that's a lot of stuff to get wrong.
       *
       * So we can't use anything that depends on that, such as which database is used with a
       * given site, or the name of the origin server. Instead we'll use the name Apache provides
       * in $_SERVER['SERVER_NAME'] (versus HTTP_HOST, among others, which reflects what was sent
       * by the user).
       */
      $hostname = '';

      $fullName = $_SERVER['SERVER_NAME'];
      $segments = explode('.', $fullName);
      $hostname = $segments[0];

      return sprintf('/mnt/files/%s.%s/saml/idp-metadata/%s.php', $_ENV['AH_SITE_GROUP'], $_ENV['AH_SITE_ENVIRONMENT'], $hostname);
    }

    /**
     * Returns the Entity ID of the IDP for the site in the current
     * login context.
     */
    public static function getIdpEntityId() {
      $metadataFile = CgovIdpTools::getIdpFilepath();

      require($metadataFile); // Defines $metadata.
      $idpData = array_pop($metadata);

      return $idpData['entityid'];
    }

    /**
     * Is this site running on Acquia Site Factory?
     */
    public static function isSiteFactorySite() {
      // This is kind of hacky, but the assumption is that sites.json is only defined
      // on ACSF sites.
      return file_exists("/mnt/files/{$_ENV['AH_SITE_GROUP']}.{$_ENV['AH_SITE_ENVIRONMENT']}/files-private/sites.json");
    }

  }
}
