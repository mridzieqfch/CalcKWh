// File: assets/js/data/tarif.js

const TARIF_DATA = {
    ppj_persen: 0.03,
    materai: {
        biaya: 10000,
        batas: 1000000
    },
    golongan: [
        { id: "R1-900", nama: "R-1/TR (900 VA)", tipe: "Rumah Tangga", tarif_kwh: 1352.00 },
        { id: "R1-1300", nama: "R-1/TR (1300 VA)", tipe: "Rumah Tangga", tarif_kwh: 1444.70 },
        { id: "R1-2200", nama: "R-1/TR (2200 VA)", tipe: "Rumah Tangga", tarif_kwh: 1444.70 },
        { id: "R2-3500", nama: "R-2/TR (3.500-5.500 VA)", tipe: "Rumah Tangga", tarif_kwh: 1699.53 },
        { id: "R3-6600", nama: "R-3/TR (6.600 VA ke atas)", tipe: "Rumah Tangga", tarif_kwh: 1699.53 },
        { id: "B2-6600", nama: "B-2/TR (6.600 VA - 200 kVA)", tipe: "Bisnis", tarif_kwh: 1444.70 },
        { id: "P1-6600", nama: "P-1/TR (6.600 VA - 200 kVA)", tipe: "Pemerintahan", tarif_kwh: 1699.53 }
    ],
    industri: {
        harga_wbp: 1553.67,
        harga_lwbp: 1035.77,
        harga_kvarh: 1114.74,
        faktor_tan_phi: 0.62
    }
};

window.TARIF_DATA = TARIF_DATA;