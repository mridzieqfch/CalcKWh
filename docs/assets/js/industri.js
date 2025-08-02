document.addEventListener('DOMContentLoaded', () => {
    // --- KONSTANTA UNTUK INDUSTRI ---
    const HARGA_WBP = 1553.67;
    const HARGA_LWBP = 1035.76996;
    const HARGA_KVARH = 1114.74;
    const FAKTOR_TAN_PHI = 0.62;
    const PPJ_RATE = 0.03;
    const BIAYA_MATERAI = 10000;
    const BATAS_MATERAI = 1000000;

    // --- ELEMEN DOM ---
    const form = document.getElementById('form-industri');
    const hasilSection = document.getElementById('hasil-industri');
    const inputs = {
        faktor_kali: document.getElementById('industri-faktor-kali'),
        wbp_awal: document.getElementById('industri-wbp-awal'),
        lwbp_awal: document.getElementById('industri-lwbp-awal'),
        kvarh_awal: document.getElementById('industri-kvarh-awal'),
        wbp_akhir: document.getElementById('industri-wbp-akhir'),
        lwbp_akhir: document.getElementById('industri-lwbp-akhir'),
        kvarh_akhir: document.getElementById('industri-kvarh-akhir'),
    };

    // Keluar jika form tidak ditemukan
    if (!form) return;

    // --- EVENT LISTENER UNTUK SUBMIT FORM ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // --- PENGAMBILAN DAN VALIDASI INPUT ---
        const faktor_kali = parseFloat(inputs.faktor_kali.value) || 0;
        const wbp_awal = parseFloat(inputs.wbp_awal.value) || 0;
        const lwbp_awal = parseFloat(inputs.lwbp_awal.value) || 0;
        const kvarh_awal = parseFloat(inputs.kvarh_awal.value) || 0;
        const wbp_akhir = parseFloat(inputs.wbp_akhir.value) || 0;
        const lwbp_akhir = parseFloat(inputs.lwbp_akhir.value) || 0;
        const kvarh_akhir = parseFloat(inputs.kvarh_akhir.value) || 0;

        if (wbp_akhir < wbp_awal || lwbp_akhir < lwbp_awal || kvarh_akhir < kvarh_awal) {
            showErrorModal("Data Akhir Bulan harus lebih besar atau sama dengan Data Awal Bulan.");
            return;
        }

        // --- LOGIKA PERHITUNGAN ---
        const pem_wbp = (wbp_akhir - wbp_awal) * faktor_kali;
        const pem_lwbp = (lwbp_akhir - lwbp_awal) * faktor_kali;
        const pem_kvarh_total = (kvarh_akhir - kvarh_awal) * faktor_kali;
        const pem_kwh_total = pem_wbp + pem_lwbp;
        const batas_kvarh = pem_kwh_total * FAKTOR_TAN_PHI;
        const kelebihan_kvarh = Math.max(0, pem_kvarh_total - batas_kvarh);
        
        const biaya_wbp = pem_wbp * HARGA_WBP;
        const biaya_lwbp = pem_lwbp * HARGA_LWBP;
        const biaya_kvarh = kelebihan_kvarh * HARGA_KVARH;

        const subtotal_biaya = biaya_wbp + biaya_lwbp + biaya_kvarh;
        const biaya_ppj = subtotal_biaya * PPJ_RATE;
        const biaya_materai_final = (subtotal_biaya >= BATAS_MATERAI) ? BIAYA_MATERAI : 0;
        const total_tagihan = subtotal_biaya + biaya_ppj + biaya_materai_final;

        // --- PEMBUATAN TAMPILAN HASIL (HTML) ---
        const ringkasanHTML = `
            <div id="industri-tab-ringkasan">
                <div class="mb-6"><h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Rincian Pemakaian</h3><div class="space-y-3"><div class="flex justify-between items-center bg-slate-50 p-3 rounded-lg"><span class="text-slate-600">Pemakaian WBP</span><span class="font-bold text-slate-800 text-base sm:text-lg">${formatAngka(Math.round(pem_wbp))} kWh</span></div><div class="flex justify-between items-center bg-slate-50 p-3 rounded-lg"><span class="text-slate-600">Pemakaian LWBP</span><span class="font-bold text-slate-800 text-base sm:text-lg">${formatAngka(Math.round(pem_lwbp))} kWh</span></div><div class="flex justify-between items-center bg-slate-50 p-3 rounded-lg"><span class="text-slate-600">Total Pemakaian kVARh</span><span class="font-bold text-slate-800 text-base sm:text-lg">${formatAngka(Math.round(pem_kvarh_total))} kVARh</span></div><div class="flex justify-between items-center bg-red-50 text-red-700 p-3 rounded-lg"><span class="font-semibold">Kelebihan Pemakaian kVARh</span><span class="font-bold text-base sm:text-lg">${formatAngka(Math.round(kelebihan_kvarh))} kVARh</span></div></div></div>
                <div class="mb-6"><h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Rincian Biaya</h3><div class="space-y-2 text-slate-700"><div class="flex justify-between items-center py-2 border-b border-slate-200"><span>Biaya Pemakaian WBP</span><span class="font-semibold">${formatRupiah(biaya_wbp)}</span></div><div class="flex justify-between items-center py-2 border-b border-slate-200"><span>Biaya Pemakaian LWBP</span><span class="font-semibold">${formatRupiah(biaya_lwbp)}</span></div><div class="flex justify-between items-center py-2 border-b border-slate-200"><span>Biaya Kelebihan kVARh</span><span class="font-semibold">${formatRupiah(biaya_kvarh)}</span></div><div class="flex justify-between items-center font-bold py-2 border-b-2 border-slate-300"><span>Subtotal Biaya</span><span class="font-semibold">${formatRupiah(subtotal_biaya)}</span></div><div class="flex justify-between items-center py-2 border-b border-slate-200"><span>PPJ (${PPJ_RATE*100}%)</span><span class="font-semibold">${formatRupiah(biaya_ppj)}</span></div><div class="flex justify-between items-center py-2"><span>Biaya Materai</span><span class="font-semibold">${formatRupiah(biaya_materai_final)}</span></div></div></div>
                <div class="bg-gradient-to-br from-yellow-400/50 via-teal-500/80 to-teal-500 text-white p-4 rounded-xl mt-6"><div class="flex justify-between items-center"><span class="text-lg sm:text-xl font-bold uppercase">Total Tagihan</span><span class="text-lg sm:text-xl font-extrabold tracking-tight">${formatRupiah(total_tagihan)}</span></div></div>
            </div>`;
        
        const detailHTML = `
            <div id="industri-tab-detail" class="hidden">
                <div class="space-y-4 text-sm text-slate-600">
                    <div class="p-3 bg-slate-100 rounded-lg"><p class="font-semibold text-slate-800">Pemakaian WBP</p><p class="mt-1 font-mono">(${formatAngka(wbp_akhir,2)}) - ${formatAngka(wbp_awal,2)}) &times; ${formatAngka(faktor_kali,2)} = <strong class="text-slate-900">${formatAngka(pem_wbp,2)} kWh</strong></p></div>
                    <div class="p-3 bg-slate-100 rounded-lg"><p class="font-semibold text-slate-800">Biaya WBP</p><p class="mt-1 font-mono">${formatAngka(pem_wbp,2)} kWh &times; ${formatRupiah(HARGA_WBP)} = <strong class="text-slate-900">${formatRupiah(biaya_wbp)}</strong></p></div>
                    <div class="p-3 bg-slate-100 rounded-lg"><p class="font-semibold text-slate-800">Pemakaian LWBP</p><p class="mt-1 font-mono">(${formatAngka(lwbp_akhir,2)} - ${formatAngka(lwbp_awal,2)}) &times; ${formatAngka(faktor_kali,2)} = <strong class="text-slate-900">${formatAngka(pem_lwbp,2)} kWh</strong></p></div>
                    <div class="p-3 bg-slate-100 rounded-lg"><p class="font-semibold text-slate-800">Biaya LWBP</p><p class="mt-1 font-mono">${formatAngka(pem_lwbp,2)} kWh &times; ${formatRupiah(HARGA_LWBP)} = <strong class="text-slate-900">${formatRupiah(biaya_lwbp)}</strong></p></div>
                    <div class="p-3 bg-slate-100 rounded-lg"><p class="font-semibold text-slate-800">Kelebihan kVARh</p><p class="mt-1 font-mono">Total kVARh: (${formatAngka(kvarh_akhir,2)} - ${formatAngka(kvarh_awal,2)}) &times; ${formatAngka(faktor_kali,2)} = ${formatAngka(pem_kvarh_total,2)}<br>Batas kVARh: (${formatAngka(pem_wbp,2)} + ${formatAngka(pem_lwbp,2)}) &times; ${FAKTOR_TAN_PHI} = ${formatAngka(batas_kvarh,2)}<br>Kelebihan: ${formatAngka(pem_kvarh_total,2)} - ${formatAngka(batas_kvarh,2)} = <strong class="text-red-700">${formatAngka(kelebihan_kvarh,2)} kVARh</strong></p></div>
                    <div class="p-3 bg-slate-100 rounded-lg"><p class="font-semibold text-slate-800">Biaya Kelebihan kVARh</p><p class="mt-1 font-mono">${formatAngka(kelebihan_kvarh,2)} kVARh &times; ${formatRupiah(HARGA_KVARH)} = <strong class="text-slate-900">${formatRupiah(biaya_kvarh)}</strong></p></div>
                    <div class="p-3 bg-teal-50 rounded-lg border border-teal-200"><p class="font-semibold text-teal-800">Total Tagihan</p><p class="mt-1 font-mono">${formatRupiah(subtotal_biaya)} + ${formatRupiah(biaya_ppj)} + ${formatRupiah(biaya_materai_final)} = <strong class="text-teal-900">${formatRupiah(total_tagihan)}</strong></p></div>
                </div>
            </div>`;

        hasilSection.innerHTML = `
            <div class="bg-gradient-to-br from-yellow-300 to-teal-500 p-1 rounded-2xl shadow-lg shadow-slate-200/80 slide-fade-in">
                <div class="bg-white p-5 sm:p-7 rounded-xl">
                    <h2 class="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-4">Rincian Estimasi Tagihan</h2>
                    <div class="flex justify-center border-b border-slate-200 mb-6">
                        <button data-tab="ringkasan" class="result-tab-button py-2 px-6 active">Detail Invoice</button>
                        <button data-tab="detail" class="result-tab-button py-2 px-6">Detail Perhitungan</button>
                    </div>
                    <div id="industri-tab-content">
                        ${ringkasanHTML}
                        ${detailHTML}
                    </div>
                    <div class="mt-8"><button class="reset-button w-full bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all duration-300">Hitung Ulang</button></div>
                </div>
            </div>`;
        
        hasilSection.classList.remove('hidden');

        // --- LOGIKA TAB HASIL (RINGKASAN/DETAIL) ---
        const resultTabButtons = hasilSection.querySelectorAll('.result-tab-button');
        const tabRingkasan = hasilSection.querySelector('#industri-tab-ringkasan');
        const tabDetail = hasilSection.querySelector('#industri-tab-detail');
        resultTabButtons.forEach(button => {
            button.addEventListener('click', () => {
                resultTabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                if (button.dataset.tab === 'ringkasan') {
                    tabRingkasan.classList.remove('hidden');
                    tabDetail.classList.add('hidden');
                } else {
                    tabRingkasan.classList.add('hidden');
                    tabDetail.classList.remove('hidden');
                }
            });
        });

        // --- EVENT LISTENER UNTUK TOMBOL RESET ---
        hasilSection.querySelector('.reset-button').addEventListener('click', () => {
            form.reset();
            inputs.faktor_kali.value = '400'; 
            hasilSection.classList.add('hidden');
            hasilSection.innerHTML = '';
        });

        setTimeout(() => hasilSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    });
});