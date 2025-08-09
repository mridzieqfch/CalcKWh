// File: assets/js/riwayat.js

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('content-riwayat')) return;

    const tableContainer = document.getElementById('riwayat-table-container');
    const summaryContainer = document.getElementById('riwayat-summary-cards');
    const chartContainer = document.getElementById('riwayat-chart-container');
    const pesanKosong = document.getElementById('riwayat-pesan-kosong');
    const btnHapusRiwayat = document.getElementById('btn-hapus-riwayat');
    
    const inputTargetAnggaran = document.getElementById('input-target-anggaran');
    const btnSimpanTarget = document.getElementById('btn-simpan-target');
    const targetProgressContainer = document.getElementById('target-progress-container');
    const targetProgressBar = document.getElementById('target-progress-bar');
    const targetProgressLabel = document.getElementById('target-progress-label');
    
    const chartTypeButtons = document.querySelectorAll('.chart-type-button');
    const analisisPerangkatContainer = document.getElementById('analisis-perangkat-container');
    const analisisPerangkatContent = document.getElementById('analisis-perangkat-content');

    let activeChart = null;
    let currentChartType = 'rupiah';

    const setupGoalSetting = () => {
        const savedTarget = localStorage.getItem('targetAnggaran');
        if (savedTarget) {
            inputTargetAnggaran.value = parseInt(savedTarget, 10).toLocaleString('id-ID');
        }

        btnSimpanTarget.addEventListener('click', () => {
            const targetValue = parseFloat(inputTargetAnggaran.value.replace(/\D/g, '')) || 0;
            if (targetValue > 0) {
                localStorage.setItem('targetAnggaran', targetValue);
                btnSimpanTarget.textContent = 'Tersimpan!';
                setTimeout(() => { btnSimpanTarget.textContent = 'Simpan Target' }, 2000);
                renderRiwayat();
            } else {
                localStorage.removeItem('targetAnggaran');
                inputTargetAnggaran.value = '';
                targetProgressContainer.classList.add('hidden');
            }
        });

        inputTargetAnggaran.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            e.target.value = value ? parseInt(value, 10).toLocaleString('id-ID') : '';
        });
    };

    const updateGoalProgress = (riwayat) => {
        const target = parseFloat(localStorage.getItem('targetAnggaran')) || 0;
        if (target <= 0 || riwayat.length === 0) {
            targetProgressContainer.classList.add('hidden');
            return;
        }

        const tagihanTerakhir = riwayat[0].total;
        const progress = Math.min((tagihanTerakhir / target) * 100, 100);
        
        targetProgressContainer.classList.remove('hidden');
        targetProgressBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
            targetProgressBar.classList.remove('from-teal-400', 'to-cyan-500');
            targetProgressBar.classList.add('from-red-500', 'to-orange-500');
        } else {
            targetProgressBar.classList.remove('from-red-500', 'to-orange-500');
            targetProgressBar.classList.add('from-teal-400', 'to-cyan-500');
        }

        targetProgressLabel.textContent = `${formatRupiah(tagihanTerakhir)} / ${formatRupiah(target)}`;
    };

    const renderAnalisisPerangkat = (riwayat) => {
        const riwayatPerangkat = riwayat.filter(item => item.tipe === 'Perangkat' && item.perangkat);
        if (riwayatPerangkat.length === 0) {
            analisisPerangkatContainer.classList.add('hidden');
            return;
        }

        const agregatPerangkat = {};
        riwayatPerangkat.forEach(item => {
            item.perangkat.forEach(p => {
                const nama = p.nama.trim().toLowerCase();
                const konsumsiBulanan = (p.watt * p.jam * 30) / 1000;
                if (!agregatPerangkat[nama]) {
                    agregatPerangkat[nama] = { totalKwh: 0, count: 0 };
                }
                agregatPerangkat[nama].totalKwh += konsumsiBulanan;
                agregatPerangkat[nama].count++;
            });
        });

        const sortedPerangkat = Object.entries(agregatPerangkat)
            .map(([nama, data]) => ({ nama, ...data }))
            .sort((a, b) => b.totalKwh - a.totalKwh)
            .slice(0, 5);

        if (sortedPerangkat.length === 0) {
            analisisPerangkatContainer.classList.add('hidden');
            return;
        }
        
        analisisPerangkatContainer.classList.remove('hidden');
        analisisPerangkatContent.innerHTML = `
            <p class="text-sm text-slate-600 mb-4">Berdasarkan riwayat perhitungan 'Perangkat' Anda, berikut adalah 5 perangkat dengan estimasi konsumsi energi bulanan tertinggi:</p>
            <ul class="space-y-3">
                ${sortedPerangkat.map(p => `
                    <li class="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
                        <span class="font-semibold capitalize text-slate-800">${p.nama}</span>
                        <span class="font-bold text-teal-600">${formatAngka(p.totalKwh, 2)} kWh/bulan</span>
                    </li>
                `).join('')}
            </ul>
        `;
    };

    const renderRiwayat = () => {
        const riwayat = JSON.parse(localStorage.getItem('riwayatTagihan')) || [];

        tableContainer.innerHTML = '';
        summaryContainer.innerHTML = '';
        chartContainer.innerHTML = '';
        if (activeChart) {
            activeChart.destroy();
            activeChart = null;
        }

        if (riwayat.length === 0) {
            tableContainer.appendChild(pesanKosong);
            pesanKosong.classList.remove('hidden');
            btnHapusRiwayat.disabled = true;
            summaryContainer.innerHTML = `<div class="bg-slate-50 p-4 rounded-lg text-center text-slate-500 col-span-full">Data riwayat kosong.</div>`;
            analisisPerangkatContainer.classList.add('hidden');
            updateGoalProgress(riwayat);
            return;
        }

        pesanKosong.classList.add('hidden');
        btnHapusRiwayat.disabled = false;

        const totalPengeluaran = riwayat.reduce((sum, item) => sum + item.total, 0);
        const rataRata = totalPengeluaran / riwayat.length;
        const tagihanTertinggi = Math.max(...riwayat.map(item => item.total));

        summaryContainer.innerHTML = `
            <div class="bg-teal-50 p-4 rounded-lg text-center"><p class="text-sm text-teal-700 font-semibold">Total Riwayat</p><p class="text-lg font-bold text-teal-900">${riwayat.length}</p></div>
            <div class="bg-blue-50 p-4 rounded-lg text-center"><p class="text-sm text-blue-700 font-semibold">Total Pengeluaran</p><p class="text-md font-bold text-blue-900">${formatRupiah(totalPengeluaran)}</p></div>
            <div class="bg-purple-50 p-4 rounded-lg text-center"><p class="text-sm text-purple-700 font-semibold">Rata-Rata/Tagihan</p><p class="text-md font-bold text-purple-900">${formatRupiah(rataRata)}</p></div>
            <div class="bg-yellow-50 p-4 rounded-lg text-center"><p class="text-sm text-yellow-700 font-semibold">Tagihan Tertinggi</p><p class="text-md font-bold text-yellow-900">${formatRupiah(tagihanTertinggi)}</p></div>
        `;

        const sortedRiwayat = [...riwayat].sort((a, b) => parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1]));
        
        const chartData = currentChartType === 'rupiah' 
            ? sortedRiwayat.map(item => item.total) 
            : sortedRiwayat.map(item => item.kwh || 0);

        const chartOptions = {
            series: [{ name: currentChartType === 'rupiah' ? 'Total Tagihan' : 'Total Konsumsi', data: chartData }],
            chart: { type: 'area', height: 300, toolbar: { show: false }, zoom: { enabled: false } },
            xaxis: {
                categories: sortedRiwayat.map(item => new Date(parseInt(item.id.split('-')[1])).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})),
                labels: { style: { colors: '#64748b', fontSize: '12px' } }
            },
            yaxis: {
                labels: {
                    style: { colors: '#64748b' },
                    formatter: (value) => currentChartType === 'rupiah' ? formatRupiah(value) : `${formatAngka(value, 1)} kWh`
                }
            },
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 2 },
            fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.2, stops: [0, 90, 100] } },
            tooltip: {
                theme: 'light',
                y: { formatter: (val) => currentChartType === 'rupiah' ? formatRupiah(val) : `${formatAngka(val, 2)} kWh` }
            },
            colors: ['#14b8a6']
        };
        activeChart = new ApexCharts(chartContainer, chartOptions);
        activeChart.render();

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
        riwayat.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b hover:bg-slate-50';
            const tipeKelas = {
                'Pascabayar': 'bg-blue-100 text-blue-800',
                'Industri': 'bg-gray-100 text-gray-800',
                'Perangkat': 'bg-purple-100 text-purple-800'
            }[item.tipe] || 'bg-slate-100 text-slate-800';
            
            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">${item.tanggal}</td>
                <td class="px-6 py-4"><span class="px-2 py-1 text-xs font-semibold rounded-full ${tipeKelas}">${item.tipe}</span></td>
                <td class="px-6 py-4 font-bold text-slate-800">${formatRupiah(item.total)}</td>
                <td class="px-6 py-4 text-center">
                    <div class="flex justify-center items-center gap-4">
                        <button data-id="${item.id}" class="btn-lihat-detail text-teal-600 hover:text-teal-800" title="Lihat Detail"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                        <button data-id="${item.id}" class="btn-hapus-item text-red-500 hover:text-red-700" title="Hapus"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        tableContainer.appendChild(table);
        
        updateGoalProgress(riwayat);
        renderAnalisisPerangkat(riwayat);
    };

    chartTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            chartTypeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentChartType = button.dataset.chart;
            renderRiwayat();
        });
    });

    document.addEventListener('tabchanged', (e) => {
        if (e.detail.tabName === 'riwayat') renderRiwayat();
    });

    btnHapusRiwayat.addEventListener('click', () => {
        showModal(
            '<span class="text-red-600">Konfirmasi Penghapusan</span>',
            `<p class="mb-6">Apakah Anda yakin ingin menghapus semua riwayat tagihan? Tindakan ini tidak dapat dibatalkan.</p>
             <div class="flex justify-end gap-3">
                <button class="modal-close-button bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-lg hover:bg-slate-300">Batal</button>
                <button id="confirm-delete-all" class="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">Ya, Hapus Semua</button>
             </div>`
        );
        document.getElementById('confirm-delete-all').addEventListener('click', () => {
            localStorage.removeItem('riwayatTagihan');
            localStorage.removeItem('targetAnggaran');
            renderRiwayat();
            document.querySelector('.dynamic-modal .modal-close-button').click();
        });
    });

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

    setupGoalSetting();
});