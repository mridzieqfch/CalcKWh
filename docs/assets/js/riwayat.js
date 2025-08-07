// File: assets/js/riwayat.js

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('content-riwayat')) return;

    const riwayatContainer = document.getElementById('riwayat-container');
    const pesanKosong = document.getElementById('riwayat-pesan-kosong');
    const btnHapusRiwayat = document.getElementById('btn-hapus-riwayat');

    const renderRiwayat = () => {
        const riwayat = JSON.parse(localStorage.getItem('riwayatTagihan')) || [];
        riwayatContainer.innerHTML = ''; 

        if (riwayat.length === 0) {
            riwayatContainer.appendChild(pesanKosong);
            pesanKosong.classList.remove('hidden');
            btnHapusRiwayat.disabled = true;
            return;
        }

        pesanKosong.classList.add('hidden');
        btnHapusRiwayat.disabled = false;

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
            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">${item.tanggal}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${item.tipe === 'Pascabayar' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}">
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

        riwayatContainer.appendChild(table);
    };

    document.addEventListener('tabchanged', (e) => {
        if (e.detail.tabName === 'riwayat') {
            renderRiwayat();
        }
    });

    btnHapusRiwayat.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin menghapus semua riwayat tagihan?')) {
            localStorage.removeItem('riwayatTagihan');
            renderRiwayat();
        }
    });

    riwayatContainer.addEventListener('click', (e) => {
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