document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('burnupChart').getContext('2d');
    
    // Get data from the server-rendered template
    const documentCounts = JSON.parse(document.getElementById('document-counts').textContent);
    const statuses = Object.keys(documentCounts.byStatus);
    const counts = Object.values(documentCounts.byStatus);
    
    // Calculate cumulative totals
    const cumulativeTotals = counts.reduce((acc, curr, idx) => {
        acc.push((acc[idx - 1] || 0) + curr);
        return acc;
    }, []);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: statuses,
            datasets: [
                {
                    label: 'Cumulative Documents',
                    data: cumulativeTotals,
                    borderColor: '#8B0000',
                    backgroundColor: 'rgba(139, 0, 0, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Total Documents',
                    data: Array(statuses.length).fill(documentCounts.total),
                    borderColor: '#666',
                    borderDash: [5, 5],
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Document Progress Over Time',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Documents'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Status'
                    }
                }
            }
        }
    });
}); 