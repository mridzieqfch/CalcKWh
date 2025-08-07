// File: assets/js/industri.js

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('content-industri')) return;

    const form = document.getElementById('form-industri');
    const hasilSection = document.getElementById('hasil-industri');
    const inputs = {
        faktorKali: document.getElementById('industri-faktor-kali'),
        wbpAwal: document.getElementById('industri-wbp-awal'),
        lwbpAwal: document.getElementById('industri-lwbp-awal'),
        kvarhAwal: document.getElementById('industri-kvarh-awal'),
        wbpAkhir: document.getElementById('industri-wbp-akhir'),
        lwbpAkhir: document.getElementById('industri-lwbp-akhir'),
        kvarhAkhir: document.getElementById('industri-kvarh-akhir'),
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const faktorKali = parseFloat(inputs.faktorKali.value) || 0;
        const wbpAwal = parseFloat(inputs.wbpAwal.value) || 0;
        const lwbpAwal = parseFloat(inputs.lwbpAwal.value) || 0;
        const kvarhAwal = parseFloat(inputs.kvarhAwal.value) || 0;
        const wbpAkhir = parseFloat(inputs.wbpAkhir.value) || 0;
        const lwbpAkhir = parseFloat(inputs.lwbpAkhir.value) || 0;
        const kvarhAkhir = parseFloat(inputs.kvarhAkhir.value) || 0;

        if (wbpAkhir < wbpAwal || lwbpAkhir < lwbpAwal || kvarhAkhir < kvarhAwal) {
            showErrorModal("Data Akhir Bulan harus lebih besar atau sama dengan Data Awal Bulan.");
            return;
        }
        if (faktorKali <= 0) {
            showErrorModal("Faktor kali harus berupa angka positif.");
            return;
        }

        const tarif = TARIF_DATA.industri;
        const pemWbp = (wbpAkhir - wbpAwal) * faktorKali;
        const pemLwbp = (lwbpAkhir - lwbpAwal) * faktorKali;
        const pemKvarhTotal = (kvarhAkhir - kvarhAwal) * faktorKali;
        const pemKwhTotal = pemWbp + pemLwbp;
        const batasKvarh = pemKwhTotal * tarif.faktor_tan_phi;
        const kelebihanKvarh = Math.max(0, pemKvarhTotal - batasKvarh);
        
        const biayaWbp = pemWbp * tarif.harga_wbp;
        const biayaLwbp = pemLwbp * tarif.harga_lwbp;
        const biayaKvarh = kelebihanKvarh * tarif.harga_kvarh;

        const subtotalBiaya = biayaWbp + biayaLwbp + biayaKvarh;
        const biayaPpj = subtotalBiaya * TARIF_DATA.ppj_persen;
        const biayaMateraiFinal = (subtotalBiaya >= TARIF_DATA.materai.batas) ? TARIF_DATA.materai.biaya : 0;
        const totalTagihan = subtotalBiaya + biayaPpj + biayaMateraiFinal;

        const ringkasanHTML = `
            <div id="industri-tab-ringkasan">
                <div class="mb-6">
                    <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Rincian Pemakaian</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center bg-slate-50 p-3 rounded-lg"><span class="text-slate-600">Pemakaian WBP</span><span class="font-bold text-slate-800">${formatAngka(pemWbp,3)} kWh</span></div>
                        <div class="flex justify-between items-center bg-slate-50 p-3 rounded-lg"><span class="text-slate-600">Pemakaian LWBP</span><span class="font-bold text-slate-800">${formatAngka(pemLwbp,3)} kWh</span></div>
                        <div class="flex justify-between items-center bg-slate-50 p-3 rounded-lg"><span class="text-slate-600">Total Pemakaian kVARh</span><span class="font-bold text-slate-800">${formatAngka(pemKvarhTotal,3)} kVARh</span></div>
                        <div class="flex justify-between items-center bg-red-50 text-red-700 p-3 rounded-lg"><span class="font-semibold">Kelebihan Pemakaian kVARh</span><span class="font-bold">${formatAngka(kelebihanKvarh,3)} kVARh</span></div>
                    </div>
                </div>
                <div class="mb-6">
                    <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Rincian Biaya</h3>
                    <div class="space-y-2 text-slate-700">
                        <div class="flex justify-between items-center py-2 border-b"><span>Biaya Pemakaian WBP</span><span class="font-semibold">${formatRupiah(biayaWbp)}</span></div>
                        <div class="flex justify-between items-center py-2 border-b"><span>Biaya Pemakaian LWBP</span><span class="font-semibold">${formatRupiah(biayaLwbp)}</span></div>
                        <div class="flex justify-between items-center py-2 border-b"><span>Biaya Kelebihan kVARh</span><span class="font-semibold">${formatRupiah(biayaKvarh)}</span></div>
                        <div class="flex justify-between items-center font-bold py-2 border-b-2"><span>Subtotal Biaya</span><span>${formatRupiah(subtotalBiaya)}</span></div>
                        <div class="flex justify-between items-center py-2 border-b"><span>PPJ (${(TARIF_DATA.ppj_persen*100).toFixed(1)}%)</span><span class="font-semibold">${formatRupiah(biayaPpj)}</span></div>
                        <div class="flex justify-between items-center py-2"><span>Biaya Materai</span><span class="font-semibold">${formatRupiah(biayaMateraiFinal)}</span></div>
                    </div>
                </div>
                <div class="bg-gradient-to-br from-yellow-400/50 via-teal-500/80 to-teal-500 text-white p-4 rounded-xl mt-6"><div class="flex justify-between items-center"><span class="text-lg font-bold uppercase">Total Tagihan</span><span class="text-xl font-extrabold">${formatRupiah(totalTagihan)}</span></div></div>
            </div>`;
        
        const detailHTML = `
            <div id="industri-tab-detail" class="hidden">
                <div class="space-y-4 text-sm text-slate-600">
                    <div class="p-3 bg-slate-100 rounded-lg"><p class="font-semibold">Pemakaian WBP</p><p class="mt-1 font-mono">(${formatAngka(wbpAkhir,2)} - ${formatAngka(wbpAwal,2)}) &times; ${formatAngka(faktorKali,0)} = <strong>${formatAngka(pemWbp,3)} kWh</strong></p></div>
                    <div class="p-3 bg-slate-100 rounded-lg"><p class="font-semibold">Biaya WBP</p><p class="mt-1 font-mono">${formatAngka(pemWbp,3)} kWh &times; ${formatRupiah(tarif.harga_wbp, 2)} = <strong>${formatRupiah(biayaWbp)}</strong></p></div>
                    <div class="p-3 bg-slate-100 rounded-lg"><p class="font-semibold">Pemakaian LWBP</p><p class="mt-1 font-mono">(${formatAngka(lwbpAkhir,2)} - ${formatAngka(lwbpAwal,2)}) &times; ${formatAngka(faktorKali,0)} = <strong>${formatAngka(pemLwbp,3)} kWh</strong></p></div>
                    <div class="p-3 bg-slate-100 rounded-lg"><p class="font-semibold">Biaya LWBP</p><p class="mt-1 font-mono">${formatAngka(pemLwbp,3)} kWh &times; ${formatRupiah(tarif.harga_lwbp, 2)} = <strong>${formatRupiah(biayaLwbp)}</strong></p></div>
                    <div class="p-3 bg-slate-100 rounded-lg"><p class="font-semibold">Kelebihan kVARh</p><p class="mt-1 font-mono">Total kVARh: (${formatAngka(kvarhAkhir,2)} - ${formatAngka(kvarhAwal,2)}) &times; ${formatAngka(faktorKali,0)} = ${formatAngka(pemKvarhTotal,3)}<br>Batas kVARh: (${formatAngka(pemWbp,3)} + ${formatAngka(pemLwbp,3)}) &times; ${tarif.faktor_tan_phi} = ${formatAngka(batasKvarh,3)}<br>Kelebihan: ${formatAngka(pemKvarhTotal,3)} - ${formatAngka(batasKvarh,3)} = <strong class="text-red-700">${formatAngka(kelebihanKvarh,3)} kVARh</strong></p></div>
                    <div class="p-3 bg-slate-100 rounded-lg"><p class="font-semibold">Biaya Kelebihan kVARh</p><p class="mt-1 font-mono">${formatAngka(kelebihanKvarh,3)} kVARh &times; ${formatRupiah(tarif.harga_kvarh, 2)} = <strong>${formatRupiah(biayaKvarh)}</strong></p></div>
                    <div class="p-3 bg-teal-50 rounded-lg border border-teal-200"><p class="font-semibold text-teal-800">Total Tagihan</p><p class="mt-1 font-mono">${formatRupiah(subtotalBiaya)} + ${formatRupiah(biayaPpj)} + ${formatRupiah(biayaMateraiFinal)} = <strong class="text-teal-900">${formatRupiah(totalTagihan)}</strong></p></div>
                </div>
            </div>`;

        hasilSection.innerHTML = `
            <div class="bg-gradient-to-br from-yellow-300 to-teal-500 p-1 rounded-2xl shadow-lg slide-fade-in">
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
                    <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button class="reset-button w-full bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-300">Hitung Ulang</button>
                        <button id="btn-simpan-industri" class="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-teal-600">Simpan Hasil</button>
                    </div>
                </div>
            </div>`;
        
        hasilSection.classList.remove('hidden');

        const tabButtons = hasilSection.querySelectorAll('.result-tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const tabName = button.dataset.tab;
                hasilSection.querySelector('#industri-tab-ringkasan').classList.toggle('hidden', tabName !== 'ringkasan');
                hasilSection.querySelector('#industri-tab-detail').classList.toggle('hidden', tabName !== 'detail');
            });
        });

        hasilSection.querySelector('.reset-button').addEventListener('click', () => {
            form.reset();
            inputs.faktorKali.value = '400'; 
            hasilSection.classList.add('hidden');
        });

        hasilSection.querySelector('#btn-simpan-industri').addEventListener('click', (e) => {
            const detailHTMLContent = hasilSection.querySelector('#industri-tab-detail').innerHTML;
            const riwayatItem = {
                id: `industri-${Date.now()}`,
                tipe: 'Industri',
                tanggal: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
                deskripsi: `Total Pemakaian ${formatAngka(pemKwhTotal, 0)} kWh`,
                total: totalTagihan,
                detailHTML: detailHTMLContent
            };

            let riwayat = JSON.parse(localStorage.getItem('riwayatTagihan')) || [];
            riwayat.unshift(riwayatItem);
            localStorage.setItem('riwayatTagihan', JSON.stringify(riwayat));

            e.target.textContent = 'Tersimpan!';
            e.target.disabled = true;
        });

        setTimeout(() => hasilSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    });
});