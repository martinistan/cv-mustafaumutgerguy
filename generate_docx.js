const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { 
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
    WidthType, AlignmentType, BorderStyle, ShadingType 
} = require('docx');

const ACCENT = "B38B59"; // #b38b59 gold/bronze
const TEXT_D = "1A1A1A";
const TEXT_M = "555555";
const BG_L = "FAF9F7";

function secTitle(title) {
    return new Paragraph({
        spacing: { before: 90, after: 30 },
        children: [
            new TextRun({ 
                text: title.toUpperCase(), 
                bold: true, 
                font: "Segoe UI", 
                size: 17, 
                color: ACCENT 
            })
        ],
        border: { 
            bottom: { 
                color: ACCENT, 
                space: 2, 
                style: BorderStyle.SINGLE, 
                size: 8 
            } 
        }
    });
}

function itemBullet(text, badge) {
    const children = [
        new TextRun({ text: "•  " + text, bold: true, font: "Segoe UI", size: 15, color: TEXT_D })
    ];
    if (badge) {
        children.push(new TextRun({ text: "  [" + badge + "]", bold: true, font: "Segoe UI", size: 13.5, color: ACCENT }));
    }
    return new Paragraph({
        spacing: { before: 18, after: 18 },
        children: children
    });
}

async function buildDocx() {
    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: { font: "Segoe UI", color: TEXT_D }
                }
            }
        },
        sections: [{
            properties: {
                page: {
                    margin: { top: 400, bottom: 400, left: 520, right: 520 }
                }
            },
            children: [
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 15 },
                    children: [
                        new TextRun({ text: "MUSTAFA UMUT GERGUY", bold: true, size: 26, font: "Segoe UI", color: TEXT_D }),
                        new TextRun({ text: "   |   ", size: 18, color: ACCENT }),
                        new TextRun({ text: "BOEKHOUDKUNDIG ASSISTENT", bold: true, size: 18, font: "Segoe UI", color: ACCENT })
                    ]
                }),

                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 20 },
                    children: [
                        new TextRun({ text: "GSM: ", bold: true, size: 14, color: ACCENT }),
                        new TextRun({ text: "+32 470 86 61 59   •   ", size: 14 }),
                        new TextRun({ text: "E-MAIL: ", bold: true, size: 14, color: ACCENT }),
                        new TextRun({ text: "mustafagerguy52@gmail.com   •   ", size: 14 }),
                        new TextRun({ text: "ADRES: ", bold: true, size: 14, color: ACCENT }),
                        new TextRun({ text: "Gent   •   ", size: 14 }),
                        new TextRun({ text: "GEBOORTE: ", bold: true, size: 14, color: ACCENT }),
                        new TextRun({ text: "18/05/2008", size: 14 })
                    ]
                }),

                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 50 },
                    children: [
                        new TextRun({ text: "MOBILITEIT: ", bold: true, size: 12.5, color: ACCENT }),
                        new TextRun({ text: "Elektrische Step, Elektrische Fiets, Openbaar Vervoer, Voorlopig rijbewijs B   •   ", size: 12.5 }),
                        new TextRun({ text: "INTERESSES: ", bold: true, size: 12.5, color: ACCENT }),
                        new TextRun({ text: "Software & Programmeren, Fitness & Gym, Gamen, Koken", size: 12.5 })
                    ]
                }),

                secTitle("Over Mezelf"),
                new Paragraph({
                    spacing: { before: 20, after: 50 },
                    children: [new TextRun({
                        text: "Ik ben een gemotiveerde en leergierige student Boekhoudkundig Assistent. Ik leer snel en sta altijd open voor nieuwe dingen. Ik ben goed met computers, wiskunde en cijfers. Daarnaast ben ik nauwkeurig, verantwoordelijk, flexibel, klantvriendelijk, stipt en goed georganiseerd. Ik kom altijd op tijd, kan goed omgaan met stress en werk goed zelfstandig én in teamverband.",
                        size: 15.5
                    })]
                }),

                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                        insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
                    },
                    rows: [new TableRow({
                        children: [
                            new TableCell({
                                width: { size: 50, type: WidthType.PERCENTAGE },
                                children: [
                                    secTitle("Opleiding"),
                                    new Paragraph({
                                        spacing: { before: 15, after: 5 },
                                        children: [
                                            new TextRun({ text: "KISP Mariakerke", bold: true, size: 15.5, color: TEXT_D }),
                                            new TextRun({ text: "  |  2026 – heden", size: 14.5, color: ACCENT, bold: true })
                                        ]
                                    }),
                                    new Paragraph({
                                        spacing: { before: 0, after: 30 },
                                        children: [new TextRun({ text: "Boekhoudkundig Assistent", size: 14.5, color: TEXT_M })]
                                    }),
                                    new Paragraph({
                                        spacing: { before: 15, after: 5 },
                                        children: [
                                            new TextRun({ text: "OLVI GENT", bold: true, size: 15.5, color: TEXT_D }),
                                            new TextRun({ text: "  |  2021 – 2024", size: 14.5, color: ACCENT, bold: true })
                                        ]
                                    }),
                                    new Paragraph({
                                        spacing: { before: 0, after: 30 },
                                        children: [new TextRun({ text: "Economie en Organisatie", size: 14.5, color: TEXT_M })]
                                    })
                                ]
                            }),
                            new TableCell({
                                width: { size: 50, type: WidthType.PERCENTAGE },
                                children: [
                                    secTitle("Werkervaring"),
                                    new Paragraph({
                                        spacing: { before: 15, after: 30 },
                                        children: [new TextRun({
                                            text: "Hoewel ik nog geen ervaring heb in boekhouding of economie, ben ik van jongs af aan sterk met computers en wiskunde. Cijfers en logisch denken lagen mij altijd goed en op dit vlak liep ik vaak voor op mijn leeftijdsgenoten.",
                                            size: 15
                                        })]
                                    })
                                ]
                            })
                        ]
                    })]
                }),

                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                        insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
                    },
                    rows: [new TableRow({
                        children: [
                            new TableCell({
                                width: { size: 50, type: WidthType.PERCENTAGE },
                                children: [
                                    secTitle("Competenties"),
                                    itemBullet("Nauwkeurig", "STERK"),
                                    itemBullet("Georganiseerd", "STERK"),
                                    itemBullet("Betrouwbaar", "STERK"),
                                    itemBullet("Leergierig", "STERK"),
                                    itemBullet("Stipt", "STERK"),
                                    itemBullet("Stressbestendig", "STERK")
                                ]
                            }),
                            new TableCell({
                                width: { size: 50, type: WidthType.PERCENTAGE },
                                children: [
                                    secTitle("Talenkennis"),
                                    itemBullet("Nederlands: Moedertaal", "C2"),
                                    itemBullet("Engels: Goed", "B2"),
                                    itemBullet("Turks: Moedertaal", "C2"),
                                    secTitle("IT & Digitale Vaardigheden"),
                                    itemBullet("Word, Excel, Outlook, PowerPoint, Teams", "UITSTEKEND"),
                                    itemBullet("Algemene computervaardigheden & Tools", "UITSTEKEND")
                                ]
                            })
                        ]
                    })]
                }),

                secTitle("Motivatie & Doelstelling"),
                new Paragraph({
                    spacing: { before: 15, after: 30 },
                    children: [new TextRun({
                        text: "Sinds mijn kindertijd heb ik een grote interesse in computers, cijfers en economie. De opleiding Boekhoudkundig Assistent past bij mij omdat ik hier mijn interesse in economie, cijfers en computers kan combineren. Ik ben leergierig, gemotiveerd en wil praktijkervaring opbouwen om uit te groeien tot een betrouwbare en professionele boekhoudkundig assistent.",
                        size: 15
                    })]
                }),

                secTitle("Sollicitatiebrief (Stage Boekhoudkundig Assistent)"),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 6, color: ACCENT },
                        bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT },
                        left: { style: BorderStyle.SINGLE, size: 6, color: ACCENT },
                        right: { style: BorderStyle.SINGLE, size: 6, color: ACCENT }
                    },
                    rows: [new TableRow({
                        children: [new TableCell({
                            shading: { type: ShadingType.CLEAR, fill: BG_L },
                            margins: { top: 50, bottom: 50, left: 90, right: 90 },
                            children: [
                                new Paragraph({
                                    spacing: { before: 0, after: 15 },
                                    children: [new TextRun({ text: "Geachte heer/mevrouw,", bold: true, size: 15 })]
                                }),
                                new Paragraph({
                                    spacing: { before: 10, after: 15 },
                                    children: [new TextRun({ text: "Graag stel ik mij kandidaat voor een stage als Boekhoudkundig Assistent binnen uw bedrijf. Momenteel volg ik de opleiding Boekhoudkundig Assistent bij KISP Mariakerke en ben ik op zoek naar een stageplaats waar ik kan meewerken aan administratieve en boekhoudkundige taken. Ik werk graag met cijfers en computers en kan goed overweg met programma’s zoals Word, Excel, Outlook en Teams. Ik kijk ernaar uit om tijdens mijn stage ervaring op te doen in een professionele werkomgeving.", size: 14.5 })]
                                }),
                                new Paragraph({
                                    spacing: { before: 15, after: 5 },
                                    children: [
                                        new TextRun({ text: "Met vriendelijke groeten,  ", bold: true, size: 14.5 }),
                                        new TextRun({ text: "Mustafa Umut Gerguy", bold: true, size: 14.5, color: ACCENT })
                                    ]
                                })
                            ]
                        })]
                    })]
                }),

                secTitle("Waarom Ik?"),
                new Paragraph({
                    spacing: { before: 15, after: 10 },
                    children: [
                        new TextRun({ text: "1. Digitaal vaardig  ", bold: true, size: 14.5, color: ACCENT }),
                        new TextRun({ text: "•  2. Microsoft 365-kennis  ", bold: true, size: 14.5, color: ACCENT }),
                        new TextRun({ text: "•  3. Sterk in rekenen  ", bold: true, size: 14.5, color: ACCENT }),
                        new TextRun({ text: "•  4. Nauwkeurig werken  ", bold: true, size: 14.5, color: ACCENT }),
                        new TextRun({ text: "•  5. Leert snel bij", bold: true, size: 14.5, color: ACCENT })
                    ]
                })
            ]
        }]
    });

    const docxPath = path.resolve(__dirname, 'Mustafa_Umut_Gerguy_cv.docx');
    const pdfPath = path.resolve(__dirname, 'Word_Exported_cv.pdf');

    const buf = await Packer.toBuffer(doc);
    fs.writeFileSync(docxPath, buf);
    console.log("[1/2] Word (.DOCX) generated successfully:", docxPath, "(" + buf.length + " bytes)");

    try {
        console.log("[2/2] Converting Word -> PDF using Microsoft Word COM...");
        const psScript = `
            $word = New-Object -ComObject Word.Application
            $word.Visible = $false
            $doc = $word.Documents.Open('${docxPath.replace(/\\/g, '\\\\')}')
            $doc.ExportAsFixedFormat('${pdfPath.replace(/\\/g, '\\\\')}', 17, $false, 1)
            $doc.Close()
            $word.Quit()
        `;
        fs.writeFileSync('convert.ps1', psScript);
        execSync('powershell -ExecutionPolicy Bypass -File convert.ps1', { stdio: 'inherit' });
        fs.unlinkSync('convert.ps1');

        const pdfStat = fs.statSync(pdfPath);
        const pdfBuf = fs.readFileSync(pdfPath, 'latin1');
        const pages = (pdfBuf.match(/\/Type\s*\/Page[^s]/g) || []).length;
        console.log(`[2/2] Word -> PDF successfully exported! Page count: ${pages} | Size: ${pdfStat.size} bytes`);
    } catch (err) {
        console.error("Word conversion error:", err);
    }
}

buildDocx().catch(console.error);
