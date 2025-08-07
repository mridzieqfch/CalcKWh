// File: assets/js/prabayar.js

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('content-prabayar')) return;

    const form = document.getElementById('form-prabayar');
    const hasilSection = document.getElementById('hasil-prabayar');
    const selectGolongan = document.getElementById('prabayar-golongan-tarif');
    const tarifDisplay = document.getElementById('prabayar-tarif-display');
    const inputNominal = document.getElementById('prabayar-nominal-beli');
    const inputPpj = document.getElementById('prabayar-ppj');

    const initGolonganSelect = () => {
        selectGolongan.innerHTML = '';
        TARIF_DATA.golongan.forEach(g => {
            const option = document.createElement('option');
            option.value = g.tarif_kwh;
            option.textContent = g.nama;
            selectGolongan.appendChild(option);
        });
        updateTarifDisplay();
    };

    const updateTarifDisplay = () => {
        tarifDisplay.textContent = `${formatRupiah(parseFloat(selectGolongan.value))}/kWh`;
    };

    inputNominal.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        e.target.value = value ? parseInt(value, 10).toLocaleString('id-ID') : '';
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const tarifPerKwh = parseFloat(selectGolongan.value) || 0;
        const nominalBeli = parseFloat(inputNominal.value.replace(/\./g, '')) || 0;
        const ppjPersen = (parseFloat(inputPpj.value) || 0) / 100;
        
        if (tarifPerKwh <= 0) {
            showErrorModal("Silakan pilih golongan tarif yang valid.");
            return;
        }
        if (nominalBeli <= 0) {
            showErrorModal("Nominal pembelian harus lebih besar dari nol.");
            return;
        }
        if (ppjPersen < 0) {
            showErrorModal("Persentase PPJ tidak boleh negatif.");
            return;
        }

        const ppj = ppjPersen * nominalBeli;
        const stroom = nominalBeli - ppj;
        const kwhDidapat = stroom / tarifPerKwh;

        hasilSection.innerHTML = `
            <div class="bg-gradient-to-br from-yellow-300 to-teal-500 p-1 rounded-2xl shadow-lg slide-fade-in">
                <div class="bg-white p-5 sm:p-7 rounded-xl">
                    <h2 class="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-6">Rincian Pembelian Token</h2>
                    
                    <div class="bg-gradient-to-br from-yellow-400/50 via-teal-500/80 to-teal-500 text-white p-5 rounded-xl space-y-2">
                        <div class="flex justify-between items-baseline">
                            <span class="text-sm font-semibold uppercase opacity-90">kWh Yang Didapat</span>
                            <span class="text-xl font-extrabold tracking-tight">${formatAngka(kwhDidapat, 2)} kWh</span>
                        </div>
                    </div>

                    <div class="mt-6">
                        <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">Detail Perhitungan</h3>
                        <div class="p-4 bg-teal-50 border-2 border-teal-100 rounded-lg text-center font-mono text-slate-600 text-sm sm:text-base">
                            (${formatRupiah(nominalBeli)} - ${formatRupiah(ppj)} (PPJ)) / ${formatRupiah(tarifPerKwh)} = <strong class="text-slate-800">${formatAngka(kwhDidapat, 2)} kWh</strong>
                        </div>
                        <p class="text-center text-xs text-slate-500 mt-2 px-2">
                            *Nominal pembelian dikurangi PPJ (${(ppjPersen * 100).toFixed(1)}%).
                        </p>
                    </div>

                    <div class="mt-8">
                        <button class="reset-button w-full bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-300">Hitung Ulang</button>
                    </div>
                </div>
            </div>`;

        hasilSection.classList.remove('hidden');
        
        hasilSection.querySelector('.reset-button').addEventListener('click', () => {
            form.reset();
            inputPpj.value = '3';
            updateTarifDisplay();
            hasilSection.classList.add('hidden');
        });
        setTimeout(() => hasilSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    });

    selectGolongan.addEventListener('change', updateTarifDisplay);
    initGolonganSelect();
});