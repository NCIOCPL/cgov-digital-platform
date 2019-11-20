//import { CTSSimpleFormSetup } from "UX/AppModuleSpecific/BasicCTS/Search/Enhancements/cts-simple-form-setup";

const ctsSpanishSettings = {
    urls: [
        '/espanol/cancer/tratamiento/medicamentos',
        '/espanol/cancer/tratamiento/medicamentos/indice-de-medicamentos',
        '/espanol/cancer/tratamiento/medicamentos/enfermedades-relacionadas-con-cancer',
        '/espanol/cancer/tratamiento/medicamentos/uso-extraoficial',
        '/espanol/cancer/tratamiento/estudios-clinicos',
        '/espanol/cancer/tratamiento/estudios-clinicos/guia-estudios-clinicos',
        '/espanol/cancer/tratamiento/estudios-clinicos/que-son-estudios',
        '/espanol/cancer/tratamiento/estudios-clinicos/que-son-estudios/donde-se-realizan',
        '/espanol/cancer/tratamiento/estudios-clinicos/que-son-estudios/tipos',
        '/espanol/cancer/tratamiento/estudios-clinicos/que-son-estudios/fases',
        '/espanol/cancer/tratamiento/estudios-clinicos/que-son-estudios/asignacion-azar',
        '/espanol/cancer/tratamiento/estudios-clinicos/que-son-estudios/placebo',
        '/espanol/cancer/tratamiento/estudios-clinicos/que-son-estudios/miembros-equipo-investigacion',
        '/espanol/cancer/tratamiento/estudios-clinicos/pago',
        '/espanol/cancer/tratamiento/estudios-clinicos/pago/cobertura-de-seguro',
        '/espanol/cancer/tratamiento/estudios-clinicos/pago/gestion-con-plan-de-salud',
        '/espanol/cancer/tratamiento/estudios-clinicos/pago/programas-federales',
        '/espanol/cancer/tratamiento/estudios-clinicos/seguridad-paciente',
        '/espanol/cancer/tratamiento/estudios-clinicos/seguridad-paciente/consentimiento',
        '/espanol/cancer/tratamiento/estudios-clinicos/seguridad-paciente/asentimiento-ninos',
        '/espanol/cancer/tratamiento/estudios-clinicos/seguridad-paciente/revision-cientifica',
        '/espanol/cancer/tratamiento/estudios-clinicos/seguridad-paciente/terminacion-estudio',
        '/espanol/cancer/tratamiento/estudios-clinicos/decidir-participar',
        '/espanol/cancer/tratamiento/estudios-clinicos/preguntas',
        '/espanol/cancer/tratamiento/estudios-clinicos/patrocinados-por-nci',
    ],
    popupDelaySeconds: 30, // Number of seconds to delay before displaying the popup.
    popupID: 'Spanish-CTSPrompt',
    popupBody: `
        <h2 class="title">¿Necesita ayuda en encontrar un estudio clínico?</h2>
        <div class="content spanish-livehelp">
            <p>Especialistas de Información están disponibles para ayudarle en hacer una búsqueda y contestar a sus preguntas.</p>
            <!--
            <form onsubmit="return false;">
                <input id="chat-button" type="button" name="rn_nciChatLaunchButton_4_Button" class="chat-button" value="Iniciar Chat">
            </form>
            -->
            <form action="https://livehelp-es.cancer.gov/app/chat/chat_landing" id="bar" method="POST">
                <input name="_icf_22" style="display: none !important;" type="text" value="2174">
                <button type="submit">Iniciar Chat</button>
            </form>
            <div class="live-help"></div>
        </div>
    `,
    optOutDurationDays: 30,
    timerIntervalSeconds: 5,
    interactionDelaySeconds: 10,    // Minimum number of seconds to wait after a user interaction before displaying the prompt.
    startDate: new Date(0), // default start data is 1/1/1970
    endDate: null
}

export default ctsSpanishSettings;
