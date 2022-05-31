// URL: /about-cancer/treatment/clinical-trials/paying
/** This scenario is a tree that is 4-levels deep, with the active item being the current page. */
export const deepTreeNav = `
<nav aria-label="Secondary navigation">
  <ul class="usa-sidenav usa-sidenav--nci-sidenav">

    <li class="usa-sidenav__item">
      <a href="/about-cancer/treatment" data-menu-id="11844" class="usa-current usa-current--nci-ancestor">Cancer Treatment</a>
      <ul class="usa-sidenav__sublist">
        <li class="usa-sidenav__item">
          <a href="/about-cancer/treatment/types" data-menu-id="911277" class="nci-has-children">Types of Cancer Treatment</a>
        </li>

        <li class="usa-sidenav__item">
          <a href="/about-cancer/treatment/side-effects" data-menu-id="898464">Side Effects of Cancer Treatment</a>
        </li>

        <li class="usa-sidenav__item">
          <a href="/about-cancer/treatment/clinical-trials" data-menu-id="941577" class="usa-current usa-current--nci-ancestor">Clinical Trials Information</a>
          <ul class="usa-sidenav__sublist">
            <li class="usa-sidenav__item">
              <a href="/about-cancer/treatment/clinical-trials/search" data-menu-id="16374"
                class="nci-has-children">Find NCI-Supported Clinical Trials</a>
            </li>

            <li class="usa-sidenav__item">
              <a href="/about-cancer/treatment/clinical-trials/what-are-trials" data-menu-id="396047" class="nci-has-children">What Are Clinical Trials? </a>
            </li>

            <li class="usa-sidenav__item">
              <a href="/about-cancer/treatment/clinical-trials/paying" data-menu-id="63846" class="usa-current">Paying for Clinical Trials</a>
              <ul class="usa-sidenav__sublist">
                <li class="usa-sidenav__item">
                  <a href="/about-cancer/treatment/clinical-trials/paying/insurance" data-menu-id="804863">Insurance Coverage and Clinical Trials</a>
                </li>

                <li class="usa-sidenav__item">
                  <a href="/about-cancer/treatment/clinical-trials/paying/work-with-insurance" data-menu-id="802441">How to Work With Your Health Insurance Plan</a>
                </li>

                <li class="usa-sidenav__item">
                  <a href="/about-cancer/treatment/clinical-trials/paying/federal-programs" data-menu-id="420514">Federal Government Programs</a>
                </li>
              </ul>
            </li>

            <li class="usa-sidenav__item">
              <a href="/about-cancer/treatment/clinical-trials/patient-safety" data-menu-id="63848" class="nci-has-children">Patient Safety</a>
            </li>

            <li class="usa-sidenav__item">
              <a href="/about-cancer/treatment/clinical-trials/taking-part" data-menu-id="396057">Deciding to Take Part in a Trial</a>
            </li>

            <li class="usa-sidenav__item">
              <a href="/about-cancer/treatment/clinical-trials/questions" data-menu-id="420504">Questions to Ask about Treatment Clinical Trials</a>
            </li>

            <li class="usa-sidenav__item">
              <a href="/about-cancer/treatment/clinical-trials/nci-supported" data-menu-id="941579">Selected NCI-Supported Trials</a>
            </li>
          </ul>
        </li>

        <li class="usa-sidenav__item">
          <a href="/about-cancer/treatment/drugs" data-menu-id="918919" class="nci-has-children">A to Z List of Cancer Drugs</a>
        </li>

        <li class="usa-sidenav__item">
          <a href="/about-cancer/treatment/cam" data-menu-id="917500" class="nci-has-children">Complementary &amp; Alternative Medicine (CAM)</a>
        </li>

        <li class="usa-sidenav__item">
          <a href="/about-cancer/treatment/questions" data-menu-id="936692">Questions to Ask about Your Treatment</a>
        </li>

        <li class="usa-sidenav__item">
          <a href="/about-cancer/treatment/research" data-menu-id="937976">Research</a>
        </li>
      </ul>
    </li>
  </ul>
</nav>
`;

// URL: /about-cancer/treatment/side-effects/anemia
/** Scenario where the active navigation item is a parent of the current URL, which does not show in the navigation. */
export const currentUrlNotInNav = `
<nav aria-label="Secondary navigation">
  <ul class="usa-sidenav usa-sidenav--nci-sidenav">
    <li class="usa-sidenav__item">
      <a href="/about-cancer/treatment" data-menu-id="11844" class="usa-current usa-current--nci-ancestor">Cancer Treatment</a>
      <ul class="usa-sidenav__sublist">
        <li class="usa-sidenav__item">
          <a href="/about-cancer/treatment/types" data-menu-id="911277" class="nci-has-children">Types of Cancer Treatment</a>
        </li>

        <li class="usa-sidenav__item">
          <a href="/about-cancer/treatment/side-effects" data-menu-id="898464" class="usa-current usa-current--nci-ancestor">Side Effects of Cancer Treatment</a>
        </li>

        <li class="usa-sidenav__item">
          <a href="/about-cancer/treatment/clinical-trials" data-menu-id="941577" class="nci-has-children">Clinical Trials Information</a>
        </li>

        <li class="usa-sidenav__item">
          <a href="/about-cancer/treatment/drugs" data-menu-id="918919" class="nci-has-children">A to Z List of Cancer Drugs</a>
        </li>

        <li class="usa-sidenav__item">
          <a href="/about-cancer/treatment/cam" data-menu-id="917500" class="nci-has-children">Complementary &amp; Alternative Medicine (CAM)</a>
        </li>

        <li class="usa-sidenav__item">
          <a href="/about-cancer/treatment/questions" data-menu-id="936692">Questions to Ask about Your Treatment</a>
        </li>

        <li class="usa-sidenav__item">
          <a href="/about-cancer/treatment/research" data-menu-id="937976">Research</a>
        </li>
      </ul>
    </li>
  </ul>
</nav>
`;

// URL: /research/nci-role
/** This scenario is where the active nav item is the root of the nav. */
export const currentIsRoot = `
<nav aria-label="Secondary navigation">
  <ul class="usa-sidenav usa-sidenav--nci-sidenav">

    <li class="usa-sidenav__item">
      <a href="/research/nci-role" data-menu-id="916488" class="usa-current">NCI’s Role in Cancer Research</a>
      <ul class="usa-sidenav__sublist">
        <li class="usa-sidenav__item">
          <a href="/research/nci-role/intramural" data-menu-id="12758">Intramural Research</a>
        </li>

        <li class="usa-sidenav__item">
          <a href="/research/nci-role/extramural" data-menu-id="916666">Extramural Research</a>
        </li>

        <li class="usa-sidenav__item">
          <a href="/research/nci-role/cancer-research-workforce" data-menu-id="1151061">Cancer Research Workforce</a>
        </li>

        <li class="usa-sidenav__item">
          <a href="/research/nci-role/partners-collaborators" data-menu-id="12770">Tech Transfer &amp; Small Business
            Partnerships</a>
        </li>
      </ul>
    </li>
  </ul>
</nav>
`;
