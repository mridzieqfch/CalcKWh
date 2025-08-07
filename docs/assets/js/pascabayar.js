// File: assets/js/pascabayar.js

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('content-pascabayar')) return;

    const form = document.getElementById('form-pascabayar');
    const hasilSection = document.getElementById('hasil-pascabayar');
    const selectGolongan = document.getElementById('pascabayar-golongan-tarif');
    const tarifDisplay = document.getElementById('pascabayar-tarif-display');
    const inputPpj = document.getElementById('pascabayar-ppj');
    const inputs = {
        kwhAwal: document.getElementById('pascabayar-kwh-awal'),
        kwhAkhir: document.getElementById('pascabayar-kwh-akhir'),
    };

    const initGolonganSelect = () => {
        selectGolongan.innerHTML = '';
        TARIF_DATA.golongan.forEach(g => {
            const option = document.createElement('option');
            option.value = g.tarif_kwh;
            option.dataset.nama = g.nama;
            option.textContent = g.nama;
            selectGolongan.appendChild(option);
        });
        updateTarifDisplay();
    };

    const updateTarifDisplay = () => {
        tarifDisplay.textContent = `${formatRupiah(parseFloat(selectGolongan.value))}/kWh`;
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const tarifPerKwh = parseFloat(selectGolongan.value) || 0;
        const kwhAwal = parseFloat(inputs.kwhAwal.value);
        const kwhAkhir = parseFloat(inputs.kwhAkhir.value);
        const ppjPersen = (parseFloat(inputPpj.value) || 0) / 100;
        
        if (tarifPerKwh <= 0) {
            showErrorModal("Silakan pilih golongan tarif yang valid.");
            return;
        }
        if (isNaN(kwhAwal) || isNaN(kwhAkhir)) {
            showErrorModal("Mohon isi meter awal dan akhir dengan angka.");
            return;
        }
        if (kwhAkhir < kwhAwal) {
            showErrorModal("Meter akhir harus lebih besar atau sama dengan meter awal.");
            return;
        }
        if (ppjPersen < 0) {
            showErrorModal("Persentase PPJ tidak boleh negatif.");
            return;
        }

        const pemakaianKwh = kwhAkhir - kwhAwal;
        const subtotalBiaya = pemakaianKwh * tarifPerKwh;
        const biayaPpj = subtotalBiaya * ppjPersen;
        const biayaMateraiFinal = subtotalBiaya >= TARIF_DATA.materai.batas ? TARIF_DATA.materai.biaya : 0;
        const totalTagihan = subtotalBiaya + biayaPpj + biayaMateraiFinal;

        const invoiceHTML = `
            <div id="pascabayar-tab-invoice">
                <div class="mb-6"><h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Rincian Pemakaian</h3><div class="flex justify-between items-center bg-slate-50 p-3 rounded-lg"><span class="text-slate-600">Total Pemakaian kWh</span><span class="font-bold text-slate-800 text-base sm:text-lg">${formatAngka(pemakaianKwh, 0)} kWh</span></div></div>
                <div class="mb-6"><h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Rincian Biaya</h3><div class="space-y-2 text-slate-700"><div class="flex justify-between items-center py-2 border-b border-slate-200"><span>Biaya Pemakaian</span><span class="font-semibold">${formatRupiah(subtotalBiaya)}</span></div><div class="flex justify-between items-center py-2 border-b border-slate-200"><span>PPJ (${(ppjPersen * 100).toFixed(1)}%)</span><span class="font-semibold">${formatRupiah(biayaPpj)}</span></div><div class="flex justify-between items-center py-2"><span>Biaya Materai</span><span class="font-semibold">${formatRupiah(biayaMateraiFinal)}</span></div></div></div>
                <div class="bg-gradient-to-br from-yellow-400/50 via-teal-500/80 to-teal-500 text-white p-4 rounded-xl mt-6"><div class="flex justify-between items-center"><span class="text-lg sm:text-xl font-bold uppercase">Total Tagihan</span><span class="text-lg sm:text-xl font-extrabold tracking-tight">${formatRupiah(totalTagihan)}</span></div></div>
            </div>`;
        
        const detailHTML = `
            <div id="pascabayar-tab-detail" class="hidden">
                <div class="space-y-4 text-sm text-slate-600">
                    <div class="p-3 bg-slate-100 rounded-lg"><p class="font-semibold">Pemakaian kWh</p><p class="mt-1 font-mono">${formatAngka(kwhAkhir, 2)} - ${formatAngka(kwhAwal, 2)} = <strong class="text-slate-900">${formatAngka(pemakaianKwh, 2)} kWh</strong></p></div>
                    <div class="p-3 bg-slate-100 rounded-lg"><p class="font-semibold">Biaya Pemakaian</p><p class="mt-1 font-mono">${formatAngka(pemakaianKwh, 2)} kWh &times; ${formatRupiah(tarifPerKwh)} = <strong class="text-slate-900">${formatRupiah(subtotalBiaya)}</strong></p></div>
                    <div class="p-3 bg-teal-50 rounded-lg border border-teal-200"><p class="font-semibold">Total Tagihan</p><p class="mt-1 font-mono">${formatRupiah(subtotalBiaya)} + ${formatRupiah(biayaPpj)} (PPJ) + ${formatRupiah(biayaMateraiFinal)} (Materai) = <strong class="text-teal-900">${formatRupiah(totalTagihan)}</strong></p></div>
                </div>
            </div>`;

        hasilSection.innerHTML = `
            <div class="bg-gradient-to-br from-yellow-300 to-teal-500 p-1 rounded-2xl shadow-lg slide-fade-in">
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
                    <div class="mt-8 grid grid-cols-2 gap-4">
                        <button class="reset-button w-full bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-300">Hitung Ulang</button>
                        <button id="btn-simpan-pascabayar" class="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-teal-600">Simpan Hasil</button>
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
                hasilSection.querySelector('#pascabayar-tab-invoice').classList.toggle('hidden', tabName !== 'invoice');
                hasilSection.querySelector('#pascabayar-tab-detail').classList.toggle('hidden', tabName !== 'detail');
            });
        });

        hasilSection.querySelector('.reset-button').addEventListener('click', () => {
            form.reset();
            inputPpj.value = '3';
            updateTarifDisplay();
            hasilSection.classList.add('hidden');
        });

        hasilSection.querySelector('#btn-simpan-pascabayar').addEventListener('click', (e) => {
            const namaGolongan = selectGolongan.options[selectGolongan.selectedIndex].dataset.nama;
            const riwayatItem = {
                id: `pascabayar-${Date.now()}`,
                tipe: 'Pascabayar',
                tanggal: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
                deskripsi: `${namaGolongan} (${formatAngka(pemakaianKwh, 0)} kWh)`,
                total: totalTagihan,
                detailHTML: detailHTML.replace('class="hidden"', '')
            };

            let riwayat = JSON.parse(localStorage.getItem('riwayatTagihan')) || [];
            riwayat.unshift(riwayatItem);
            localStorage.setItem('riwayatTagihan', JSON.stringify(riwayat));

            e.target.textContent = 'Tersimpan!';
            e.target.disabled = true;
        });

        setTimeout(() => hasilSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    });

    selectGolongan.addEventListener('change', updateTarifDisplay);
    initGolonganSelect();
});