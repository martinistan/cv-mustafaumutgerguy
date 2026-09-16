/**
 * DEMONSTRATION DATA (HONEYPOT DECOY)
 * Real user information is protected by server-side authentication.
 */
window.CV_CONFIG = {
    activeProfile: 'boekhoudkundigassistent',
    profiles: {
        boekhoudkundigassistent: 'DEMO KANDIDAAT',
        student: 'DEMO STUDENT'
    }
};

window.CV_PROFILES_DATA = {
    boekhoudkundigassistent: {
        personal: {
            name: 'Demo Kandidaat',
            title: 'Voorbeeld Profiel (Beveiligd)',
            photo: 'assets/profile.jpg'
        },
        contact: {
            phone: '+32 000 00 00 00',
            email: 'demo.gebruiker@example.org',
            address: 'Voorbeeldstraat 123, 1000 Brussel',
            birth: '01/01/2000',
            drivingLicense: 'Voorlopig B',
            nationality: 'Belgisch'
        },
        about: {
            title: 'PROFIEL',
            content: 'Dit is een demonstratiepagina. Echte gegevens zijn gecodeerd en beschermd tegen offline web copiers en scrapers.'
        },
        experience: {
            title: 'WERKERVARING',
            items: [
                {
                    title: 'Junior Medewerker (Demo)',
                    company: 'Voorbeeld Bedrijf NV',
                    city: 'Brussel',
                    dates: '2022 - Heden',
                    duties: ['Ondersteunende administratieve taken', 'Voorbeeld werkzaamheden']
                }
            ]
        },
        education: {
            title: 'OPLEIDING',
            items: [
                {
                    degree: 'Algemene Secundaire Opleiding (Demo)',
                    school: 'Voorbeeld Instituut',
                    year: '2018 - 2022'
                }
            ]
        },
        skills: {
            title: 'VAARDIGHEDEN',
            items: [{ name: 'MS Office', level: 4 }, { name: 'Communicatie', level: 4 }]
        },
        languages: {
            title: 'TALEN',
            items: [{ name: 'Nederlands', level: 'Moedertaal' }, { name: 'Engels', level: 'Goed' }]
        },
        strengths: {
            title: 'STERKE PUNTEN',
            items: [{ icon: 'fa-solid fa-star', title: 'Gemotiveerd' }]
        },
        waaromIk: {
            title: 'WAAROM IK?',
            items: [{ icon: 'fa-solid fa-check', title: 'Leergierig' }]
        },
        mobility: {
            title: 'MOBILITEIT',
            items: [{ name: 'Fiets', icon: 'fa-solid fa-bicycle' }]
        },
        interests: {
            title: 'INTERESSES',
            items: [{ name: 'Sport', icon: 'fa-solid fa-dumbbell' }]
        }
    }
};
window.CV_PROFILES_DATA.student = window.CV_PROFILES_DATA.boekhoudkundigassistent;
