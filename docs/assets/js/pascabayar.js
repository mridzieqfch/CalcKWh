document.addEventListener('DOMContentLoaded', () => {
    // --- KONSTANTA UNTUK PASCABAYAR ---
    const PAJAK_PERSEN = 0.03;
    const BIAYA_MATERAI = 10000;
    const BATAS_MATERAI = 1000000;

    // --- ELEMEN DOM ---
    const form = document.getElementById('form-pascabayar');
    const hasilSection = document.getElementById('hasil-pascabayar');
    const inputs = {
        tarif_kwh: document.getElementById('pascabayar-tarif-kwh'),
        kwh_awal: document.getElementById('pascabayar-kwh-awal'),
        kwh_akhir: document.getElementById('pascabayar-kwh-akhir'),
    };

    // Keluar jika form tidak ditemukan
    if (!form) return;

    // --- EVENT LISTENER UNTUK SUBMIT FORM ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // --- PENGAMBILAN DAN VALIDASI INPUT ---
        const tarif_per_kwh = parseFloat(inputs.tarif_kwh.value) || 0;
        const kwh_awal = parseFloat(inputs.kwh_awal.value);
        const kwh_akhir = parseFloat(inputs.kwh_akhir.value);
        
        if (isNaN(kwh_awal) || isNaN(kwh_akhir) || isNaN(tarif_per_kwh) || tarif_per_kwh <= 0) {
            showErrorModal("Mohon isi semua kolom dengan angka yang valid.");
            return;
        }
        if (kwh_akhir < kwh_awal) {
            showErrorModal("Data Akhir Bulan harus lebih besar atau sama dengan Data Awal Bulan.");
            return;
        }

        // --- LOGIKA PERHITUNGAN ---
        const pemakaian_kwh = kwh_akhir - kwh_awal;
        const subtotal_biaya = pemakaian_kwh * tarif_per_kwh;
        const biaya_ppj = subtotal_biaya * PAJAK_PERSEN;
        const biaya_materai_final = subtotal_biaya >= BATAS_MATERAI ? BIAYA_MATERAI : 0;
        const total_tagihan = subtotal_biaya + biaya_ppj + biaya_materai_final;

        // --- PEMBUATAN TAMPILAN HASIL (HTML) ---
        const invoiceHTML = `
            <div id="pascabayar-tab-invoice">
                <div class="mb-6"><h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Rincian Pemakaian</h3><div class="flex justify-between items-center bg-slate-50 p-3 rounded-lg"><span class="text-slate-600">Total Pemakaian kWh</span><span class="font-bold text-slate-800 text-base sm:text-lg">${formatAngka(pemakaian_kwh, 0)} kWh</span></div></div>
                <div class="mb-6"><h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Rincian Biaya</h3><div class="space-y-2 text-slate-700"><div class="flex justify-between items-center py-2 border-b border-slate-200"><span>Biaya Pemakaian</span><span class="font-semibold">${formatRupiah(subtotal_biaya)}</span></div><div class="flex justify-between items-center py-2 border-b border-slate-200"><span>PPJ (${PAJAK_PERSEN * 100}%)</span><span class="font-semibold">${formatRupiah(biaya_ppj)}</span></div><div class="flex justify-between items-center py-2"><span>Biaya Materai</span><span class="font-semibold">${formatRupiah(biaya_materai_final)}</span></div></div></div>
                <div class="bg-gradient-to-br from-yellow-400/50 via-teal-500/80 to-teal-500 text-white p-4 rounded-xl mt-6"><div class="flex justify-between items-center"><span class="text-lg sm:text-xl font-bold uppercase">Total Tagihan</span><span class="text-lg sm:text-xl font-extrabold tracking-tight">${formatRupiah(total_tagihan)}</span></div></div>
            </div>`;
        
        const detailHTML = `
            <div id="pascabayar-tab-detail" class="hidden">
                <div class="space-y-4 text-sm text-slate-600">
                    <div class="p-3 bg-slate-100 rounded-lg"><p class="font-semibold text-slate-800">Pemakaian kWh</p><p class="mt-1 font-mono">(${formatAngka(kwh_akhir, 2)} - ${formatAngka(kwh_awal, 2)}) = <strong class="text-slate-900">${formatAngka(pemakaian_kwh, 2)} kWh</strong></p></div>
                    <div class="p-3 bg-slate-100 rounded-lg"><p class="font-semibold text-slate-800">Biaya Pemakaian</p><p class="mt-1 font-mono">${formatAngka(pemakaian_kwh, 2)} kWh &times; ${formatRupiah(tarif_per_kwh)} = <strong class="text-slate-900">${formatRupiah(subtotal_biaya)}</strong></p></div>
                    <div class="p-3 bg-slate-100 rounded-lg"><p class="font-semibold text-slate-800">PPJ (${PAJAK_PERSEN * 100}%)</p><p class="mt-1 font-mono">${formatRupiah(subtotal_biaya)} &times; ${PAJAK_PERSEN * 100}% = <strong class="text-slate-900">${formatRupiah(biaya_ppj)}</strong></p></div>
                    <div class="p-3 bg-teal-50 rounded-lg border border-teal-200"><p class="font-semibold text-teal-800">Total Tagihan</p><p class="mt-1 font-mono">${formatRupiah(subtotal_biaya)} + ${formatRupiah(biaya_ppj)} + ${formatRupiah(biaya_materai_final)} (Materai) = <strong class="text-teal-900">${formatRupiah(total_tagihan)}</strong></p></div>
                </div>
            </div>`;

        hasilSection.innerHTML = `
            <div class="bg-gradient-to-br from-yellow-300 to-teal-500 p-1 rounded-2xl shadow-lg shadow-slate-200/80 slide-fade-in">
                <div class="bg-white p-5 sm:p-7 rounded-xl">
                    <h2 class="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-4">Rincian Estimasi Tagihan</h2>
                    <div class="flex justify-center border-b border-slate-200 mb-6">
                        <button data-tab="invoice" class="result-tab-button py-2 px-6 active">Detail Invoice</button>
                        <button data-tab="detail" class="result-tab-button py-2 px-6">Detail Perhitungan</button>
                    </div>
                    <div id="pascabayar-tab-content">
                        ${invoiceHTML}
                        ${detailHTML}
                    </div>
                    <div class="mt-8"><button class="reset-button w-full bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all duration-300">Hitung Ulang</button></div>
                </div>
            </div>`;

        hasilSection.classList.remove('hidden');
        
        // --- LOGIKA TAB HASIL (INVOICE/DETAIL) ---
        const resultTabButtons = hasilSection.querySelectorAll('.result-tab-button');
        const tabInvoice = hasilSection.querySelector('#pascabayar-tab-invoice');
        const tabDetail = hasilSection.querySelector('#pascabayar-tab-detail');
        resultTabButtons.forEach(button => {
            button.addEventListener('click', () => {
                resultTabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                if (button.dataset.tab === 'invoice') {
                    tabInvoice.classList.remove('hidden');
                    tabDetail.classList.add('hidden');
                } else {
                    tabInvoice.classList.add('hidden');
                    tabDetail.classList.remove('hidden');
                }
            });
        });

        // --- EVENT LISTENER UNTUK TOMBOL RESET ---
        hasilSection.querySelector('.reset-button').addEventListener('click', () => {
            form.reset();
            inputs.tarif_kwh.value = '1444.70';
            hasilSection.classList.add('hidden');
            hasilSection.innerHTML = '';
        });
        setTimeout(() => hasilSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    });
});
