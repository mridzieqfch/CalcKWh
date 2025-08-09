// File: assets/js/harian.js

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('content-daya')) return;

    // Mengambil semua elemen DOM yang dibutuhkan
    const formTambahPerangkat = document.getElementById('form-tambah-perangkat');
    const selectGolonganTarif = document.getElementById('daya-golongan-tarif');
    const tarifDisplay = document.getElementById('daya-tarif-display');
    const containerDaftarPerangkat = document.getElementById('daftar-perangkat-container');
    const pesanKosong = document.getElementById('pesan-kosong-perangkat');
    const hasilSection = document.getElementById('hasil-daya');
    const inputPpj = document.getElementById('daya-ppj');
    const inputs = {
        namaAlat: document.getElementById('daya-nama-alat'),
        dayaWatt: document.getElementById('daya-watt'),
        jamPakai: document.getElementById('daya-jam'),
    };
    const inputAnggaran = document.getElementById('daya-anggaran');
    const rekomendasiSection = document.getElementById('rekomendasi-daya');

    let daftarPerangkat = [];
    let tarifKwhSaatIni = 0;
    let totalBiayaSaatIni = 0;
    let totalKwhBulananSaatIni = 0;

    const initGolonganSelect = () => {
        selectGolonganTarif.innerHTML = '';
        TARIF_DATA.golongan.forEach(g => {
            const option = document.createElement('option');
            option.value = g.tarif_kwh;
            option.textContent = g.nama;
            selectGolonganTarif.appendChild(option);
        });
        updateTarifDisplay();
    };

    const updateTarifDisplay = () => {
        tarifKwhSaatIni = parseFloat(selectGolonganTarif.value);
        tarifDisplay.textContent = `${formatRupiah(tarifKwhSaatIni)}/kWh`;
        renderDaftarPerangkat();
    };

    const generateRekomendasi = (selisih, totalBiaya, anggaran) => {
        let rekomendasiHTML = `
            <div class="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r-lg slide-fade-in">
                <h3 class="text-lg font-bold text-amber-800">Target Anggaran Terlampaui!</h3>
                <p class="text-amber-700 mb-4">Estimasi tagihan Anda (${formatRupiah(totalBiaya)}) melebihi target (${formatRupiah(anggaran)}) sebesar <strong class="font-bold">${formatRupiah(selisih)}</strong>. Coba beberapa tips berikut:</p>
                <ul class="list-disc list-inside space-y-2 text-slate-700 text-sm">`;

        const perangkatBoros = [...daftarPerangkat].sort((a, b) => (b.watt * b.jam) - (a.watt * a.jam));

        if (perangkatBoros.length > 0) {
            const boros = perangkatBoros[0];
            if (boros.jam > 1) {
                const kwhHematPerJam = (boros.watt * 1) / 1000;
                const biayaHematBulanan = kwhHematPerJam * 30 * tarifKwhSaatIni * (1 + (parseFloat(inputPpj.value) / 100));
                rekomendasiHTML += `<li>Mengurangi pemakaian <strong>${boros.nama}</strong> sebanyak 1 jam/hari dapat menghemat sekitar <strong>${formatRupiah(biayaHematBulanan)}/bulan</strong>.</li>`;
            }
        }

        const lampuPijar = daftarPerangkat.filter(p => p.nama.toLowerCase().includes('lampu') && p.watt >= 25);
        if (lampuPijar.length > 0) {
            let totalBiayaLama = 0;
            let totalBiayaBaru = 0;
            const wattLampuLED = 8;

            lampuPijar.forEach(lampu => {
                totalBiayaLama += ((lampu.watt * lampu.jam) / 1000) * 30 * tarifKwhSaatIni;
                totalBiayaBaru += ((wattLampuLED * lampu.jam) / 1000) * 30 * tarifKwhSaatIni;
            });
            
            const hematDariLampu = (totalBiayaLama - totalBiayaBaru) * (1 + (parseFloat(inputPpj.value) / 100));
            if (hematDariLampu > 0) {
                 rekomendasiHTML += `<li>Mengganti ${lampuPijar.length} lampu boros Anda dengan lampu LED (${wattLampuLED} Watt) dapat menghemat sekitar <strong>${formatRupiah(hematDariLampu)}/bulan</strong>.</li>`;
            }
        }
        
        rekomendasiHTML += `<li>Pastikan untuk selalu mematikan perangkat elektronik yang tidak terpakai dari stopkontak.</li>`;
        rekomendasiHTML += `</ul></div>`;
        rekomendasiSection.innerHTML = rekomendasiHTML;
    };

    const renderDaftarPerangkat = () => {
        containerDaftarPerangkat.innerHTML = '';
        if (daftarPerangkat.length === 0) {
            containerDaftarPerangkat.appendChild(pesanKosong);
            pesanKosong.classList.remove('hidden');
            hasilSection.classList.add('hidden');
            rekomendasiSection.classList.add('hidden');
            return;
        }

        pesanKosong.classList.add('hidden');
        daftarPerangkat.forEach((perangkat, index) => {
            const kwhHarian = (perangkat.watt * perangkat.jam) / 1000;
            const biayaHarian = kwhHarian * tarifKwhSaatIni;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'perangkat-item bg-slate-100 p-4 rounded-lg flex justify-between items-center';
            itemDiv.innerHTML = `
                <div>
                    <p class="font-bold text-slate-800">${perangkat.nama}</p>
                    <p class="text-sm text-slate-600">${perangkat.watt} Watt &times; ${perangkat.jam} Jam/Hari</p>
                    <p class="text-sm font-semibold text-teal-600">${formatRupiah(biayaHarian)} / hari</p>
                </div>
                <button data-index="${index}" class="btn-hapus-perangkat bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            `;
            containerDaftarPerangkat.appendChild(itemDiv);
        });
        renderTotalBiaya();
    };

    const renderTotalBiaya = () => {
        if (daftarPerangkat.length === 0) {
            hasilSection.classList.add('hidden');
            rekomendasiSection.classList.add('hidden');
            return;
        }

        const ppjPersen = (parseFloat(inputPpj.value) || 0) / 100;
        const totalKwhHarian = daftarPerangkat.reduce((total, p) => total + ((p.watt * p.jam) / 1000), 0);
        totalKwhBulananSaatIni = totalKwhHarian * 30;
        const subtotal = totalKwhBulananSaatIni * tarifKwhSaatIni;
        const ppj = subtotal * ppjPersen;
        totalBiayaSaatIni = subtotal + ppj;

        const ringkasanHTML = `
            <div id="daya-tab-ringkasan">
                <div class="space-y-2 text-slate-700">
                    <div class="flex justify-between items-center py-2 border-b"><span>Total Pemakaian Energi</span><span class="font-semibold">${formatAngka(totalKwhBulananSaatIni, 2)} kWh/Bulan</span></div>
                    <div class="flex justify-between items-center py-2 border-b"><span>Biaya Pemakaian</span><span class="font-semibold">${formatRupiah(subtotal)}</span></div>
                    <div class="flex justify-between items-center py-2"><span>PPJ (${(ppjPersen * 100).toFixed(1)}%)</span><span class="font-semibold">${formatRupiah(ppj)}</span></div>
                </div>
                <div class="bg-gradient-to-br from-yellow-400/80 via-teal-500 to-teal-500 text-white p-4 rounded-xl mt-6">
                    <div class="flex justify-between items-center">
                        <span class="text-lg font-bold uppercase">Total Tagihan</span>
                        <span class="text-xl font-extrabold">${formatRupiah(totalBiayaSaatIni)}</span>
                    </div>
                </div>
            </div>`;
        
        const detailHTML = `
            <div id="daya-tab-detail" class="hidden">
                <div class="space-y-4 text-sm text-slate-600">
                    ${daftarPerangkat.map(p => {
                        const kwhBulananPerangkat = (p.watt * p.jam / 1000) * 30;
                        return `
                        <div class="p-3 bg-slate-100 rounded-lg">
                            <p class="font-semibold text-slate-800">${p.nama}</p>
                            <p class="mt-1 font-mono">(${p.watt}W &times; ${p.jam}Jam / 1000) &times; 30Hari = <strong class="text-slate-900">${formatAngka(kwhBulananPerangkat, 2)} kWh</strong></p>
                        </div>
                    `}).join('')}
                    <div class="p-3 bg-teal-50 rounded-lg border border-teal-200">
                        <p class="font-semibold text-teal-800">Total Biaya & Pajak</p>
                        <p class="mt-1 font-mono">
                            Subtotal: ${formatAngka(totalKwhBulananSaatIni, 2)} kWh &times; ${formatRupiah(tarifKwhSaatIni)} = <strong class="text-teal-900">${formatRupiah(subtotal)}</strong>
                            <br>
                            PPJ: ${formatRupiah(subtotal)} &times; ${(ppjPersen * 100).toFixed(1)}% = <strong class="text-teal-900">${formatRupiah(ppj)}</strong>
                        </p>
                        <hr class="border-dashed border-teal-200 my-2">
                        <p class="font-mono text-base">Total: ${formatRupiah(subtotal)} + ${formatRupiah(ppj)} = <strong class="text-teal-900">${formatRupiah(totalBiayaSaatIni)}</strong></p>
                    </div>
                </div>
            </div>`;

        hasilSection.innerHTML = `
            <div class="bg-gradient-to-br from-yellow-300 to-teal-500 p-1 rounded-2xl shadow-lg slide-fade-in">
                <div class="bg-white p-5 sm:p-7 rounded-xl">
                    <h2 class="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-4">Total Estimasi Biaya</h2>
                    <div class="flex justify-center border-b border-slate-200 mb-6">
                        <button data-tab="ringkasan" class="result-tab-button py-2 px-6 active">Ringkasan</button>
                        <button data-tab="detail" class="result-tab-button py-2 px-6">Detail Perhitungan</button>
                    </div>
                    <div id="daya-tab-content">
                        ${ringkasanHTML}
                        ${detailHTML}
                    </div>
                    <div class="mt-8">
                        <button id="btn-simpan-daya" class="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-teal-600 transition">Simpan ke Riwayat</button>
                    </div>
                </div>
            </div>`;
        hasilSection.classList.remove('hidden');

        const anggaran = parseFloat(inputAnggaran.value.replace(/\./g, '')) || 0;
        rekomendasiSection.innerHTML = '';
        rekomendasiSection.classList.add('hidden');

        if (anggaran > 0 && totalBiayaSaatIni > anggaran) {
            const selisih = totalBiayaSaatIni - anggaran;
            generateRekomendasi(selisih, totalBiayaSaatIni, anggaran);
            rekomendasiSection.classList.remove('hidden');
        }
        
        const tabButtons = hasilSection.querySelectorAll('.result-tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const tabName = button.dataset.tab;
                hasilSection.querySelector('#daya-tab-ringkasan').classList.toggle('hidden', tabName !== 'ringkasan');
                hasilSection.querySelector('#daya-tab-detail').classList.toggle('hidden', tabName !== 'detail');
            });
        });

        hasilSection.querySelector('#btn-simpan-daya').addEventListener('click', (e) => {
            const riwayatItem = {
                id: `perangkat-${Date.now()}`,
                tipe: 'Perangkat',
                tanggal: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
                deskripsi: `${daftarPerangkat.length} perangkat`,
                total: totalBiayaSaatIni,
                kwh: totalKwhBulananSaatIni,
                detailHTML: hasilSection.querySelector('#daya-tab-detail').innerHTML,
                perangkat: daftarPerangkat
            };

            let riwayat = JSON.parse(localStorage.getItem('riwayatTagihan')) || [];
            riwayat.unshift(riwayatItem);
            localStorage.setItem('riwayatTagihan', JSON.stringify(riwayat));

            e.target.textContent = 'Tersimpan!';
            e.target.disabled = true;
            e.target.classList.add('bg-green-500');

            setTimeout(() => {
                e.target.textContent = 'Simpan ke Riwayat';
                e.target.disabled = false;
                e.target.classList.remove('bg-green-500');
            }, 2000);
        });

        setTimeout(() => hasilSection.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    };

    selectGolonganTarif.addEventListener('change', updateTarifDisplay);
    inputPpj.addEventListener('input', renderDaftarPerangkat);

    inputAnggaran.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        e.target.value = value ? parseInt(value, 10).toLocaleString('id-ID') : '';
        renderTotalBiaya();
    });

    formTambahPerangkat.addEventListener('submit', (e) => {
        e.preventDefault();
        const nama = inputs.namaAlat.value.trim();
        const watt = parseFloat(inputs.dayaWatt.value);
        const jam = parseFloat(inputs.jamPakai.value);

        if (!nama || isNaN(watt) || isNaN(jam) || watt <= 0 || jam <= 0) {
            showErrorModal("Pastikan semua kolom perangkat diisi dengan benar.");
            return;
        }
        if (tarifKwhSaatIni <= 0) {
            showErrorModal("Silakan pilih golongan tarif terlebih dahulu.");
            return;
        }

        daftarPerangkat.push({ nama, watt, jam });
        renderDaftarPerangkat();
        formTambahPerangkat.reset();
        inputs.namaAlat.focus();
    });

    containerDaftarPerangkat.addEventListener('click', (e) => {
        const hapusButton = e.target.closest('.btn-hapus-perangkat');
        if (hapusButton) {
            daftarPerangkat.splice(parseInt(hapusButton.dataset.index, 10), 1);
            renderDaftarPerangkat();
        }
    });

    initGolonganSelect();
});