import {
    getURL,
    onClickAnalytics,
    getContent,
} from '../utilities';

const email = {
    hook: '.page-options--email a',
    textContent: {
        title: {
            'en': () => 'Email',
            'es': () => 'Enviar por correo electrónico',
        },
        href: {
            'en': url => `
                ${
                    encodeURI(`mailto:?subject=Information from the National Cancer Institute Web Site&body=I found this information on www.cancer.gov and I'd like to share it with you: `)
                }${
                    encodeURIComponent(url)
                }${
                    encodeURI(`\n\n NCI's Web site, www.cancer.gov, provides accurate, up-to-date, comprehensive cancer information from the U.S. government's principal agency for cancer research. If you have questions or need additional information, we invite you to contact NCI’s LiveHelp instant messaging service at https://livehelp.cancer.gov, or call the NCI's Contact Center 1-800-4-CANCER (1-800-422-6237) (toll-free from the United States).`)
                }`,
            'es': url => `
                ${
                    encodeURI(`mailto:?subject=Información del portal de Internet del Instituto Nacional del Cáncer&body=Encontré esta información en cancer.gov/espanol y quiero compartirla contigo: `)
                }${
                    encodeURIComponent(url)
                }${
                    encodeURI(`\n\n El sitio web del Instituto Nacional del Cáncer (NCI), www.cancer.gov/espanol, provee información precisa, al día y completa de la dependencia principal del gobierno de EE. UU. sobre investigación de cáncer. Si tiene preguntas o necesita más información, le invitamos a que se comunique en español con el servicio de mensajería instantánea LiveHelp del NCI en https://livehelp-es.cancer.gov, o llame el Centro de Contacto del NCI al 1-800-422-6237 (1-800-4-CANCER) sin cargos en los Estados Unidos.`)
                }`,
        }
    },
    initialize: language => settings => node => {
        const title = getContent(settings.textContent.title, language)();
        node.title = title;
        node.setAttribute('aria-label', title);
        node.addEventListener('click', event => {
            const url = getURL(document);
            const href = getContent(settings.textContent.href, language)(url);
            node.href = href;
            return true;
        })
        return node;
    },
    initializeAnalytics: node => {
        const detail = {
            type: 'eMailLink',
        };
        node.addEventListener('click', onClickAnalytics({ node, detail }))
        return node;
    },
};

export default email;
