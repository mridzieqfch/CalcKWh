document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMEN DOM ---
    const form = document.getElementById('form-daya');
    const hasilSection = document.getElementById('hasil-daya');
    const inputs = {
        tarifKwh: document.getElementById('daya-tarif-kwh'),
        dayaWatt: document.getElementById('daya-watt'),
        jamPerHari: document.getElementById('daya-jam'),
        jumlahHari: document.getElementById('daya-hari'),
    };

    // Keluar jika form tidak ditemukan
    if (!form) return;

    // --- EVENT LISTENER UNTUK SUBMIT FORM ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // --- PENGAMBILAN DAN VALIDASI INPUT ---
        const hargaPerKwh = parseFloat(inputs.tarifKwh.value) || 0;
        const dayaWatt = parseFloat(inputs.dayaWatt.value) || 0;
        const jamPerHari = parseFloat(inputs.jamPerHari.value) || 0;
        const jumlahHari = parseInt(inputs.jumlahHari.value, 10) || 0;

        if (hargaPerKwh <= 0 || dayaWatt <= 0 || jamPerHari <= 0 || jumlahHari <= 0) {
            showErrorModal("Mohon isi semua kolom dengan angka positif yang valid.");
            return;
        }

        // --- LOGIKA PERHITUNGAN LAMA (JANGAN DIHILANGKAN) ---
        // const kwhHarian = (dayaWatt * jamPerHari) / 1000.0;
        // const kwhBulanan = kwhHarian * jumlahHari;
        // const biayaHarian = Math.round(kwhHarian * hargaPerKwh);
        // const biayaBulanan = Math.round(kwhBulanan * hargaPerKwh);

        // const kwhHarian = (dayaWatt * jamPerHari) / 1000.0;
        // const kwhBulanan = kwhHarian * jumlahHari;
        // const biayaHarianTanpaPPJ = kwhHarian * hargaPerKwh;
        // const biayaBulananTanpaPPJ = kwhBulanan * hargaPerKwh;
        // const biayaHarian = Math.round(biayaHarianTanpaPPJ * 1.03);
        // const biayaBulanan = Math.round(biayaBulananTanpaPPJ * 1.03);

        // --- LOGIKA PERHITUNGAN BARU
        // --- [PERBAIKAN] LOGIKA PERHITUNGAN TAGIHAN ---
        // Perhitungan tagihan (pascabayar) menambahkan pajak di atas biaya pemakaian.
        const ppjPersen = 2.36; // Pajak Penerangan Jalan

        // 1. Hitung pemakaian energi (kWh)
        const kwhHarian = (dayaWatt * jamPerHari) / 1000.0;
        const kwhBulanan = kwhHarian * jumlahHari;

        // 2. Hitung biaya energi sebelum pajak
        const biayaHarianTanpaPPJ = kwhHarian * hargaPerKwh;
        const biayaBulananTanpaPPJ = kwhBulanan * hargaPerKwh;

        // 3. Hitung besar pajak (PPJ)
        const ppjHarian = biayaHarianTanpaPPJ * (ppjPersen / 100);
        const ppjBulanan = biayaBulananTanpaPPJ * (ppjPersen / 100);

        // 4. Hitung total biaya setelah ditambah pajak (dibulatkan)
        const biayaHarian = Math.round(biayaHarianTanpaPPJ + ppjHarian);
        const biayaBulanan = Math.round(biayaBulananTanpaPPJ + ppjBulanan);


        // --- [PERBAIKAN] PEMBUATAN TAMPILAN HASIL (HTML) ---
        // "Detail Perhitungan" diubah agar transparan menunjukkan penambahan pajak (PPJ).
        const hasilHTML = `
        <div class="bg-gradient-to-br from-yellow-300 to-teal-500 p-1 rounded-2xl shadow-lg shadow-slate-200/80 slide-fade-in">
            <div class="bg-white p-5 sm:p-7 rounded-xl">
                <h2 class="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-6">Rincian Biaya Alat</h2>
                
                <div class="mb-6">
                    <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Detail Perhitungan Biaya</h3>
                    <div class="space-y-3 text-sm text-slate-600">
                        <div class="p-3 bg-teal-50 border-2 border-teal-100 rounded-lg">
                            <p class="font-semibold text-teal-800">Estimasi Biaya Harian</p>
                            <p class="mt-2 font-mono">${formatAngka(dayaWatt, 0)} W &times; ${formatAngka(jamPerHari)} Jam / 1000 = ${formatAngka(kwhHarian, 3)} kWh</p>
                            <p class="mt-1 font-mono">${formatAngka(kwhHarian, 3)} &times; ${formatRupiah(hargaPerKwh)} = ${formatRupiah(biayaHarianTanpaPPJ)}</p>
                            <p class="mt-1 font-mono">Pajak PPJ (${ppjPersen}%): + ${formatRupiah(ppjHarian)}</p>
                            <hr class="border-dashed border-teal-200 my-1">
                            <p class="mt-1 font-mono text-base"><strong class="text-slate-900">Total Harian: ${formatRupiah(biayaHarian)}</strong></p>
                        </div>
                        <div class="p-3 bg-teal-50 border-2 border-teal-100 rounded-lg">
                            <p class="font-semibold text-teal-800">Estimasi Biaya Bulanan (${jumlahHari} Hari)</p>
                            <p class="mt-2 font-mono">Biaya Energi: ${formatAngka(kwhBulanan, 2)} &times; ${formatRupiah(hargaPerKwh)} = ${formatRupiah(biayaBulananTanpaPPJ)}</p>
                            <p class="mt-1 font-mono">Pajak PPJ (${ppjPersen}%): + ${formatRupiah(ppjBulanan)}</p>
                            <hr class="border-dashed border-teal-200 my-1">
                            <p class="mt-1 font-mono text-base"><strong class="text-slate-900">Total Bulanan: ${formatRupiah(biayaBulanan)}</strong></p>
                        </div>
                    </div>
                </div>

                <div class="border-t-2 border-dashed border-slate-200 my-6"></div>

                <div class="bg-gradient-to-br from-yellow-400/50 via-teal-500/80 to-teal-500 text-white p-4 rounded-xl">
                    <div class="flex justify-between items-center">
                        <span class="text-lg font-bold uppercase">Estimasi Biaya</span>
                        <span class="text-xl font-extrabold tracking-tight">${formatRupiah(biayaBulanan)}</span>
                    </div>
                </div>

                <div class="mt-8"><button class="reset-button w-full bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all duration-300">Hitung Ulang</button></div>
            </div>
        </div>`;

        hasilSection.innerHTML = hasilHTML;
        hasilSection.classList.remove('hidden');

        // --- EVENT LISTENER UNTUK TOMBOL RESET ---
        hasilSection.querySelector('.reset-button').addEventListener('click', () => {
            form.reset();
            inputs.tarifKwh.value = '1444.70';
            inputs.jumlahHari.value = '30';
            hasilSection.classList.add('hidden');
            hasilSection.innerHTML = '';
        });

        setTimeout(() => hasilSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    });
});