// File: assets/js/riwayat.js

document.addEventListener('DOMContentLoaded', () => {
    // Memastikan skrip hanya berjalan di halaman yang memiliki elemen riwayat
    if (!document.getElementById('content-riwayat')) return;

    // Mengambil elemen-elemen baru dari DOM untuk dashboard
    const tableContainer = document.getElementById('riwayat-table-container');
    const summaryContainer = document.getElementById('riwayat-summary-cards');
    const chartContainer = document.getElementById('riwayat-chart-container');
    const pesanKosong = document.getElementById('riwayat-pesan-kosong');
    const btnHapusRiwayat = document.getElementById('btn-hapus-riwayat');
    let activeChart = null; // Variabel untuk menyimpan instance grafik

    const renderRiwayat = () => {
        // Mengambil data dari localStorage
        const riwayat = JSON.parse(localStorage.getItem('riwayatTagihan')) || [];

        // Mereset semua kontainer sebelum render ulang
        tableContainer.innerHTML = '';
        summaryContainer.innerHTML = '';
        chartContainer.innerHTML = '';
        if (activeChart) {
            activeChart.destroy(); // Hancurkan grafik lama untuk mencegah memory leak
            activeChart = null;
        }

        // Jika tidak ada data, tampilkan pesan kosong dan nonaktifkan tombol hapus
        if (riwayat.length === 0) {
            tableContainer.appendChild(pesanKosong);
            pesanKosong.classList.remove('hidden');
            btnHapusRiwayat.disabled = true;
            // Kosongkan juga summary card
            summaryContainer.innerHTML = `
                <div class="bg-slate-50 p-4 rounded-lg text-center text-slate-500 col-span-full">Data riwayat kosong.</div>
            `;
            return;
        }

        // Jika ada data, aktifkan tombol hapus dan sembunyikan pesan kosong
        pesanKosong.classList.add('hidden');
        btnHapusRiwayat.disabled = false;

        // --- 1. RENDER KARTU RINGKASAN ---
        const totalPengeluaran = riwayat.reduce((sum, item) => sum + item.total, 0);
        const rataRata = totalPengeluaran / riwayat.length;
        const tagihanTertinggi = Math.max(...riwayat.map(item => item.total));

        summaryContainer.innerHTML = `
            <div class="bg-teal-50 p-4 rounded-lg text-center">
                <p class="text-sm text-teal-700 font-semibold">Total Riwayat</p>
                <p class="text-lg font-bold text-teal-900">${riwayat.length}</p>
            </div>
            <div class="bg-blue-50 p-4 rounded-lg text-center">
                <p class="text-sm text-blue-700 font-semibold">Total Pengeluaran</p>
                <p class="text-md font-bold text-blue-900">${formatRupiah(totalPengeluaran)}</p>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg text-center">
                <p class="text-sm text-purple-700 font-semibold">Rata-Rata/Tagihan</p>
                <p class="text-md font-bold text-purple-900">${formatRupiah(rataRata)}</p>
            </div>
            <div class="bg-yellow-50 p-4 rounded-lg text-center">
                <p class="text-sm text-yellow-700 font-semibold">Tagihan Tertinggi</p>
                <p class="text-md font-bold text-yellow-900">${formatRupiah(tagihanTertinggi)}</p>
            </div>
        `;

        // --- 2. RENDER GRAFIK ---
        // Urutkan data berdasarkan ID (timestamp) untuk memastikan urutan kronologis
        const sortedRiwayat = [...riwayat].sort((a, b) => parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1]));

        const chartOptions = {
            series: [{
                name: 'Total Tagihan',
                data: sortedRiwayat.map(item => item.total)
            }],
            chart: {
                type: 'area',
                height: 300,
                toolbar: { show: false },
                zoom: { enabled: false }
            },
            xaxis: {
                categories: sortedRiwayat.map(item => new Date(parseInt(item.id.split('-')[1])).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})),
                labels: {
                    style: {
                        colors: '#64748b',
                        fontSize: '12px',
                    },
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#64748b',
                    },
                    formatter: (value) => { return formatRupiah(value); }
                }
            },
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 2 },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.6,
                    opacityTo: 0.2,
                    stops: [0, 90, 100]
                }
            },
            tooltip: {
                y: {
                    formatter: (val) => { return formatRupiah(val); }
                }
            },
            colors: ['#14b8a6']
        };
        activeChart = new ApexCharts(chartContainer, chartOptions);
        activeChart.render();

        // --- 3. RENDER TABEL DETAIL ---
        const table = document.createElement('table');
        table.className = 'w-full text-sm text-left text-slate-500';
        table.innerHTML = `
            <thead class="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                    <th scope="col" class="px-6 py-3 rounded-l-lg">Tanggal</th>
                    <th scope="col" class="px-6 py-3">Tipe</th>
                    <th scope="col" class="px-6 py-3">Total</th>
                    <th scope="col" class="px-6 py-3 text-center rounded-r-lg">Aksi</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        
        const tbody = table.querySelector('tbody');
        // Gunakan data `riwayat` yang belum diurutkan agar data terbaru tetap di atas tabel
        riwayat.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b hover:bg-slate-50';
            const tipeKelas = item.tipe === 'Pascabayar' ? 'bg-blue-100 text-blue-800' : 
                              item.tipe === 'Industri' ? 'bg-gray-100 text-gray-800' :
                              'bg-purple-100 text-purple-800';
            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">${item.tanggal}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${tipeKelas}">
                        ${item.tipe}
                    </span>
                </td>
                <td class="px-6 py-4 font-bold text-slate-800">${formatRupiah(item.total)}</td>
                <td class="px-6 py-4 text-center">
                    <div class="flex justify-center items-center gap-4">
                        <button data-id="${item.id}" class="btn-lihat-detail text-teal-600 hover:text-teal-800" title="Lihat Detail">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button data-id="${item.id}" class="btn-hapus-item text-red-500 hover:text-red-700" title="Hapus">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        tableContainer.appendChild(table);
    };

    // Event listener untuk merender ulang saat tab 'riwayat' aktif
    document.addEventListener('tabchanged', (e) => {
        if (e.detail.tabName === 'riwayat') {
            renderRiwayat();
        }
    });

    // Event listener untuk menghapus semua riwayat
    btnHapusRiwayat.addEventListener('click', () => {
        // Menggunakan modal custom, bukan confirm() bawaan
        showModal(
            '<span class="text-red-600">Konfirmasi Penghapusan</span>',
            `<p class="text-slate-600 mb-6">Apakah Anda yakin ingin menghapus semua riwayat tagihan? Tindakan ini tidak dapat dibatalkan.</p>
             <div class="flex justify-end gap-3">
                <button class="modal-close-button bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-lg hover:bg-slate-300">Batal</button>
                <button id="confirm-delete-all" class="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">Ya, Hapus Semua</button>
             </div>
            `
        );
        document.getElementById('confirm-delete-all').addEventListener('click', () => {
            localStorage.removeItem('riwayatTagihan');
            renderRiwayat();
            document.querySelector('.dynamic-modal .modal-close-button').click(); // Tutup modal setelah hapus
        });
    });

    // Event delegation untuk tombol lihat detail dan hapus item
    tableContainer.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const riwayat = JSON.parse(localStorage.getItem('riwayatTagihan')) || [];
        const itemId = button.dataset.id;

        if (button.classList.contains('btn-hapus-item')) {
            const riwayatBaru = riwayat.filter(item => item.id !== itemId);
            localStorage.setItem('riwayatTagihan', JSON.stringify(riwayatBaru));
            renderRiwayat();
        } else if (button.classList.contains('btn-lihat-detail')) {
            const item = riwayat.find(r => r.id === itemId);
            if (item && item.detailHTML) {
                showModal('Detail Perhitungan Tersimpan', item.detailHTML);
            } else {
                showErrorModal('Detail perhitungan untuk item ini tidak tersedia.');
            }
        }
    });
});