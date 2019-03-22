<?php
/**
 * SAML 2.0 remote IdP metadata for SimpleSAMLphp.
 *
 * Remember to remove the IdPs you don't use from this file.
 *
 * See: https://simplesamlphp.org/docs/stable/simplesamlphp-reference-idp-remote
 */

// DEV
$metadata['https://authdev.nih.gov/SAML2/IDP'] = array (
  'entityid' => 'https://authdev.nih.gov/SAML2/IDP',
  'contacts' =>
  array (
  ),
  'metadata-set' => 'saml20-idp-remote',
  'sign.authnrequest' => true,
  'SingleSignOnService' =>
  array (
    0 =>
    array (
      'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
      'Location' => 'https://authdev.nih.gov/affwebservices/public/saml2sso',
    ),
    1 =>
    array (
      'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      'Location' => 'https://authdev.nih.gov/affwebservices/public/saml2sso',
    ),
  ),
  'SingleLogoutService' =>
  array (
  ),
  'ArtifactResolutionService' =>
  array (
  ),
  'NameIDFormats' =>
  array (
    0 => 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
  ),
  'keys' =>
  array (
    0 =>
    array (
      'encryption' => false,
      'signing' => true,
      'type' => 'X509Certificate',
      'X509Certificate' => '
MIIGFTCCA/2gAwIBAgIJAJj7NfIjPUlYMA0GCSqGSIb3DQEBCwUAMIGgMQswCQYD
VQQGEwJVUzERMA8GA1UECAwITWFyeWxhbmQxETAPBgNVBAcMCEJldGhlc2RhMQww
CgYDVQQKDANOSUgxDDAKBgNVBAsMA05JSDElMCMGA1UEAwwcc2lnbmluZ3dhbWZl
ZGVyYXRpb24ubmloLmdvdjEoMCYGCSqGSIb3DQEJARYZbmlobG9naW4uaW50ZXJu
YWxAbmloLmdvdjAeFw0xNjA1MTMxOTQwNDZaFw0yNjA1MTExOTQwNDZaMIGgMQsw
CQYDVQQGEwJVUzERMA8GA1UECAwITWFyeWxhbmQxETAPBgNVBAcMCEJldGhlc2Rh
MQwwCgYDVQQKDANOSUgxDDAKBgNVBAsMA05JSDElMCMGA1UEAwwcc2lnbmluZ3dh
bWZlZGVyYXRpb24ubmloLmdvdjEoMCYGCSqGSIb3DQEJARYZbmlobG9naW4uaW50
ZXJuYWxAbmloLmdvdjCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAMql
xmqKtEBpA9QchVYBIPkkc8VfxspPnQK5x497iDRInaW+e6tt1r+wst5r6oaHxHkm
N/vA5ZN8sv7R2dCFsQTwJUTw3pMkg3V+1IQcitgNBaeEoFWZU7kRFc47+vuER+T8
/zvFtu3z+V/zS3r4fKWJ7g0ykiHIomEpmz0JMBmRsY1TCRGkxM/RDeRSKE9bCXTu
MKg1tvHiBqYw9CIHPqVwMmebDDLT9VxWH0DAVzWip0Gn/o0h+OplgRycJfSmxtNF
Vqxv3UyMQXr4zfzdEWYbyZbE/foTb1uPVdhgpvD1dK/VvLAcdcz95Y9xq9ZPkkCN
aXglE+e+JTSimvqj0flh9xs6kFXiQCBITW+bEywyfQMa6uFWaDbyyvhTwHa9HXwL
D/A7ooAJ9BAFBB6yvdKWpVcmtDp6IxvPujdm2YXg+u9De6OCNNxcTpOczostEJDI
KRJ0SA9vx+ax5vaNtY9fOdXcd8SOVigFIcpGDk119QQp9EV+DyOLZLRBE1hUJCKw
JvLjJrYjzf1ST1OXSKa95d5CL7hw3nysr4fpJVQVxp1juqTWDNboh0wlP8D4JkiO
gngK9NazK0E5L0eugcBJMaZeX/AkETPhb5bP7q2gm+xarMUGiklUaTrMYS9zs16f
BN4Fwl7YTWhYHt0UA87YgiEJ+DdKgxAs1fQX9KjjAgMBAAGjUDBOMB0GA1UdDgQW
BBS3iVA29GHMano8PKa7ifUc/CggLTAfBgNVHSMEGDAWgBS3iVA29GHMano8PKa7
ifUc/CggLTAMBgNVHRMEBTADAQH/MA0GCSqGSIb3DQEBCwUAA4ICAQBTiFsKgSMD
D0HRF6iDX3fhmpSXlTFUYc/JSN7yKKAO+zbO7Ll62CGx2yJaNjTjivVKGzzvMdfR
5FPv0P7BeEiD+stCDC78mYh/Fzvg79NNWm7vSEJNPRRUKxWc2dxUaqCXbbwPcmfU
OurVcQQF45fm8bxWkHigd8pEIoECTveU7GKQprmgzZFHoBMhYVZpC5JunA/oPETo
ymNHGpz3KQV+qhuSC3gGKGwwCwacmoFi/oCojEuk5fW0napHve+OjL3OVGpq1xep
EZXGD48yDUMoNa+AbkKlHTlP0M25xDMoExLyz7Pc6P540txISxxOk+UQQYegv79N
FtcLEfDHbctum/fYDzexI4u4Jl7winrJCqUOuGdPkg0aljSGeNdIXbky1AFs7tbU
gpeMoQyx1oMcGkDvGMNPQZS25M0mhqjE/8XpEVrMsVwGoJcJXZIxQ6mfsHP9CppM
X/L2ELQAdKM8gWjroUjb10INclEuF2WQgVlJkoMA/v6GfU1FENPTmTyXpsrhBWgU
mnn/s+1o5vEL/QoXNSEJMsLyWV5oOSD6J/zJCtOUJ/NfLeep4dGmtZkgJsC6L5dQ
mFrtzlTr19Sv4uhvWXun8eNjWFajh1dYaFTLRGIzZmREd8tX0eAmSpJ5YQt3QnQ9
AFzlbwDEQtKt7B5fKmuBCmAwDhP5Mv4AJQ==
                    ',
    ),
  ),
);
