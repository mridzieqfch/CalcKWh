document.addEventListener('DOMContentLoaded', () => {
    const PAJAK_PERSEN = 2.36;

    // --- ELEMEN DOM ---
    const form = document.getElementById('form-prabayar');
    const hasilSection = document.getElementById('hasil-prabayar');
    const inputs = {
        tarif_kwh: document.getElementById('prabayar-tarif-kwh'),
        nominal_beli: document.getElementById('prabayar-nominal-beli'),
    };

    // Keluar jika form tidak ditemukan
    if (!form) return;

    // --- [BARU] Event listener untuk memformat input nominal ---
    inputs.nominal_beli.addEventListener('input', (e) => {
        // 1. Ambil nilai dan hapus semua karakter non-digit
        let value = e.target.value.replace(/\D/g, '');
        // 2. Format dengan pemisah ribuan jika ada nilai
        if (value) {
            e.target.value = parseInt(value, 10).toLocaleString('id-ID');
        } else {
            e.target.value = ''; // Kosongkan jika tidak ada angka
        }
    });

    // --- EVENT LISTENER UNTUK SUBMIT FORM ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // --- PENGAMBILAN DAN VALIDASI INPUT ---
        const tarifPerKwh = parseFloat(inputs.tarif_kwh.value) || 0;
        const nominalBeli = parseFloat(inputs.nominal_beli.value.replace(/\./g, '')) || 0;
        
        if (tarifPerKwh <= 0) {
            showErrorModal("Harga per kWh harus lebih besar dari nol.");
            return;
        }
        if (nominalBeli <= 0) {
            showErrorModal("Nominal pembelian harus lebih besar dari nol.");
            return;
        }

        // --- LOGIKA PERHITUNGAN ---
        const ppj = (PAJAK_PERSEN / 100) * nominalBeli;
        const kwhDidapat = (nominalBeli - ppj) / tarifPerKwh;

        // --- [PERBAIKAN] PEMBUATAN TAMPILAN HASIL (HTML) ---
        // Detail perhitungan dikembalikan ke gaya semula (satu baris) namun dengan formula yang akurat.
        hasilSection.innerHTML = `
            <div class="bg-gradient-to-br from-yellow-300 to-teal-500 p-1 rounded-2xl shadow-lg shadow-slate-200/80 slide-fade-in">
                <div class="bg-white p-5 sm:p-7 rounded-xl">
                    <h2 class="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-6">Rincian kWh Didapat</h2>
                    
                    <div class="bg-gradient-to-br from-yellow-400/50 via-teal-500/80 to-teal-500 text-white p-5 rounded-xl space-y-2">
                        <div class="flex justify-between items-baseline">
                            <span class="text-sm font-semibold uppercase opacity-90">Nominal Pembelian</span>
                            <span class="text-lg font-bold tracking-tight">${formatRupiah(nominalBeli)}</span>
                        </div>
                        <div class="flex justify-between items-baseline">
                            <span class="text-sm font-semibold uppercase opacity-90">kWh Yang Didapat</span>
                            <span class="text-xl font-extrabold tracking-tight">${formatAngka(kwhDidapat, 2)} kWh</span>
                        </div>
                    </div>

                    <div class="mt-6">
                        <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">Detail Perhitungan</h3>
                        <div class="p-4 bg-teal-50 border-2 border-teal-100 rounded-lg text-center font-mono text-slate-600 text-sm sm:text-base">
                            (${formatRupiah(nominalBeli)} - ${formatRupiah(ppj)} (PPJ)) / ${formatRupiah(tarifPerKwh, 2)} = <strong class="text-slate-800">${formatAngka(kwhDidapat, 2)} kWh</strong>
                        </div>
                        <p class="text-center text-xs text-slate-500 mt-2 px-2">
                            *Nominal dikurangi PPJ (${PAJAK_PERSEN}%).
                        </p>
                    </div>
                    <div class="mt-8">
                        <button class="reset-button w-full bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all duration-300">Hitung Ulang</button>
                    </div>
                </div>
            </div>`;
        // --- AKHIR PERBAIKAN ---

        hasilSection.classList.remove('hidden');
        
        hasilSection.querySelector('.reset-button').addEventListener('click', () => {
            form.reset();
            inputs.tarif_kwh.value = '1444.70';
            hasilSection.classList.add('hidden');
            hasilSection.innerHTML = '';
        });
        setTimeout(() => hasilSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    });
});