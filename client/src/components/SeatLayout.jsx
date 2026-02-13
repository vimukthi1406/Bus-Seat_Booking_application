import React from 'react';

const TOTAL_SEATS = 40; // 10 rows of 4

const SeatLayout = ({ bookedSeats, selectedSeat, onSelect }) => {
    // Generate seats 1 to 40
    const seats = Array.from({ length: TOTAL_SEATS }, (_, i) => i + 1);

    const getSeatStatus = (seatNum) => {
        if (bookedSeats.includes(seatNum)) return 'booked';
        if (seatNum === selectedSeat) return 'selected';
        return 'available';
    };

    return (
        <div className="card" style={{ maxWidth: '350px', margin: '0 auto' }}>
            <h3 className="text-xl mb-4" style={{ textAlign: 'center' }}>Front of Bus</h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                columnGap: '2.5rem' /* Aisle gap */
            }}>
                {seats.map(seatNum => {
                    const status = getSeatStatus(seatNum);

                    let bgColor = 'var(--surface)';
                    let borderColor = '#cbd5e1'; // slate-300
                    let cursor = 'pointer';
                    let textColor = 'var(--text-main)';

                    if (status === 'booked') {
                        bgColor = 'var(--danger)';
                        borderColor = 'var(--danger)';
                        cursor = 'not-allowed';
                        textColor = 'white';
                    } else if (status === 'selected') {
                        bgColor = 'var(--primary)';
                        borderColor = 'var(--primary)';
                        textColor = 'white';
                    } else {
                        // Available
                        bgColor = 'white';
                        borderColor = 'var(--accent)';
                        textColor = 'var(--accent)'; // text-green
                    }

                    // Add aisle spacer logic if using plain flex? No, grid handles it.
                    // Wait, simple grid 4 columns doesn't give me an aisle in the middle.
                    // I can add margin-right to 2nd column items using nth-child.

                    const isRightSide = seatNum % 4 === 3 || seatNum % 4 === 0;

                    return (
                        <div
                            key={seatNum}
                            onClick={() => status !== 'booked' && onSelect(seatNum)}
                            style={{
                                height: '3rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '0.5rem',
                                backgroundColor: bgColor,
                                border: `2px solid ${borderColor}`,
                                color: textColor,
                                cursor: cursor,
                                fontWeight: 'bold',
                                // Add aisle gap manually via margin if needed, or use grid column gap tweak
                                // Grid approach with column-gap 2.5rem covers the aisle if I treat the whole thing as one block? 
                                // No, 4 cols equal width. Gap applies to all. 
                                // For a true aisle:
                                // Grid template: 1fr 1fr 20px 1fr 1fr ? 
                                // But I'm iterating linear list.
                                // Let's stick to 4 cols with a larger gap? 
                                // Simplest visual: 
                                // 1 2   3 4
                                marginRight: (seatNum % 4 === 2) ? '1.5rem' : '0' // Gap after 2nd seat in row
                            }}
                        >
                            {seatNum}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 flex justify-center gap-4 text-sm text-muted">
                <div className="flex items-center gap-2">
                    <div style={{ width: 16, height: 16, border: '2px solid var(--accent)', borderRadius: 4 }}></div> Available
                </div>
                <div className="flex items-center gap-2">
                    <div style={{ width: 16, height: 16, backgroundColor: 'var(--danger)', borderRadius: 4 }}></div> Booked
                </div>
                <div className="flex items-center gap-2">
                    <div style={{ width: 16, height: 16, backgroundColor: 'var(--primary)', borderRadius: 4 }}></div> Selected
                </div>
            </div>
        </div>
    );
};

export default SeatLayout;
