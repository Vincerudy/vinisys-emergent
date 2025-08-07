const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Lister les sociétés
router.get('/dataGraphiqueFacture/:id', async (req, res) => {
    const userId = req.params.id;

    const [societeRows] = await db.query(
        'SELECT societe_id FROM users WHERE id = ?', [userId]
    );

    if (societeRows.length === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé ou sans société associée' });
    }
    const societeId = societeRows[0].societe_id;



    try {

// 1. Définir la langue française pour les mois
await db.query("SET lc_time_names = 'fr_FR'");

// 2. Lancer la requête principale
const [paye] = await db.query(
    `
    SELECT 
        DATE_FORMAT(STR_TO_DATE(ms.month_num, '%m'), '%b') AS month, 
        COALESCE(SUM(fac.total), 0) AS total
    FROM (
        SELECT DISTINCT DATE_FORMAT(date_facture, '%m') AS month_num
        FROM factures
    ) ms
    LEFT JOIN factures fac
        ON DATE_FORMAT(fac.date_facture, '%m') = ms.month_num
        AND fac.societe_id = ?
        AND EXISTS (
            SELECT 1 
            FROM Reglement_mode regl
            WHERE regl.numero_facture = fac.numero 
            AND regl.Reste_A_Payer = 0
        )
    GROUP BY ms.month_num
    ORDER BY ms.month_num
    LIMIT 0, 25
    `,
    [societeId]
);


        const [rows] = await db.query(
            `
            SELECT 
            ms.month, 
            COALESCE(SUM(fac.total), 0) AS total
        FROM (
            -- Générer la liste des mois distincts présents dans la table factures
            SELECT DISTINCT DATE_FORMAT(date_facture, '%b') AS month, DATE_FORMAT(date_facture, '%m') AS month_num
            FROM factures
        ) ms
        LEFT JOIN factures fac
            ON DATE_FORMAT(fac.date_facture, '%b') = ms.month
            AND fac.societe_id = ?
            AND EXISTS (
                SELECT 1
                FROM Reglement_mode regl
                WHERE regl.numero_facture = fac.numero 
                AND regl.Reste_A_Payer != 0
            )
        GROUP BY ms.month, ms.month_num  -- Ajout de ms.month_num dans GROUP BY
        ORDER BY ms.month_num
        LIMIT 0, 25;
            `,
            [societeId]
        );

        const chartOptions = {
            chart: {
                width: "100%",
                stacked: !1,
                toolbar: {
                    show: !1
                },
            },
            stroke: {
                width: [1, 2, 3],
                curve: "smooth",
                lineCap: "round"
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    borderRadiusApplication: "end",
                    columnWidth: "29%"
                }
            },
            colors: ["#3454d1", "#a2acc7", "#E1E3EA"],
            series: [
                {
                    name: "Facture payé",
                    type: "bar",
                    data: paye.map(row => row.total || 0)
                },
                {
                    name: "Factures en attente",
                    type: "bar",
                    data: rows.map(row => row.total || 0)
                },
                 
                {
                    name: "Awaiting en retard",
                    type: "line",
                    data: [44, 55, 41,  ]
                }
            ],
            fill: {
                opacity: [.85, .25, 1, 1],
                gradient: {
                    inverseColors: !1,
                    shade: "light",
                    type: "vertical",
                    opacityFrom: .5,
                    opacityTo: .1,
                    stops: [0, 100, 100, 100]
                }
            },
            markers: {
                size: 0
            },
            xaxis: {
                categories: paye.map(row => row.month || 'A vénir...'),
                axisBorder: {
                    show: !1
                },
                axisTicks: {
                    show: !1
                },
                labels: {
                    style: {
                        fontSize: "10px",
                        colors: "#A0ACBB"
                    }
                },
            },
            yaxis: {
                labels: {
                    formatter: function (e) {
                        return +e  
                    },
                    offsetX: 0,
                    offsetY: 0,
                    style: {
                        colors: "#A0ACBB"
                    }
                }
            },
            grid: {
                xaxis: {
                    lines: {
                        show: !1
                    }
                },
                yaxis: {
                    lines: {
                        show: !1
                    }
                },
                padding: {
                    left: 35,
                    right:28
                },
            },
            dataLabels: {
                enabled: !1
            },
            tooltip: {
                // intersect:false,
                // shared: !0,
                // inverseOrder: !0,
                y: {
                    formatter: function (e) {
                        return +e  
                    }
                },
                style: {
                    fontSize: "12px",
                    fontFamily: "Inter"
                }
            },
            legend: {
                show: !1,
                labels: {
                    fontSize: "12px",
                    colors: "#A0ACBB"
                },
                fontSize: "12px",
                fontFamily: "Inter"
            }
        };

        

        res.json({ chartOptions });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur du serveur' });
    }
});

module.exports = router;
