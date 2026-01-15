import React from 'react';
import { motion } from 'framer-motion';

// Helper para obtener estilo según estado
const getSeatColor = (status, isMyFamily, isSelected) => {
    if (status === 'locked' || status === 'occupied') {
        return 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300';
    }
    // Desbloqueo global: Mostrar disponible para todos
    // if (!isMyFamily) return 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50';

    if (isSelected) return 'bg-gold text-dark-black scale-110 shadow-lg border-2 border-white ring-2 ring-gold';
    return 'bg-royal-blue text-white hover:bg-blue-600 cursor-pointer shadow-md hover:shadow-xl transform hover:-translate-y-1';
};

export default function SeatMap({ seats, selectedFamily, onSelectSeat, currentSelection }) {
    // 3 Mesas (30 total)
    // Mesa 1: A1-A10 (10 Inv)
    // Mesa 2: A11-A18 (8 Inv) + NOVIO + NOVIA (2) = 10 Total
    // Mesa 3: A19-A28 (10 Inv)

    // Ordenar numéricamente para garantizar layout correcto (A1, A2, A3... no A1, A10, A2)
    const sortByNumber = (a, b) => {
        const nA = parseInt(a.id.substring(1));
        const nB = parseInt(b.id.substring(1));
        return nA - nB;
    };

    const mesa1 = seats.filter(s => { const n = parseInt(s.id.substring(1)); return n >= 1 && n <= 10; }).sort(sortByNumber);
    const mesa2 = seats.filter(s => { const n = parseInt(s.id.substring(1)); return n >= 11 && n <= 18; }).sort(sortByNumber);
    const mesa3 = seats.filter(s => { const n = parseInt(s.id.substring(1)); return n >= 19 && n <= 28; }).sort(sortByNumber);

    const novios = seats.filter(s => s.id === 'NOVIO' || s.id === 'NOVIA');

    const renderSeat = (seat) => {
        if (!seat) return null;

        // Acceso Global
        const isMyFamily = true;

        const isSelected = Array.isArray(currentSelection)
            ? currentSelection.find(s => s.id === seat.id)
            : currentSelection?.id === seat.id;

        // Render especial para Novios
        if (seat.id === 'NOVIO' || seat.id === 'NOVIA') {
            return (
                <div key={seat.id} className="relative flex flex-col items-center group z-20 mx-1">
                    <div className="w-12 h-12 rounded-full bg-gold text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-gold cursor-default text-[9px] font-bold uppercase">
                        {seat.label}
                    </div>
                </div>
            );
        }

        const isOccupied = seat.status === 'occupied' || seat.status === 'locked';

        return (
            <div key={seat.id} className="relative flex flex-col items-center group z-10 mx-1">
                <motion.button
                    whileHover={isMyFamily && !isOccupied ? { scale: 1.15 } : {}}
                    whileTap={isMyFamily && !isOccupied ? { scale: 0.95 } : {}}
                    onClick={() => isMyFamily && !isOccupied && onSelectSeat(seat)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-sm ${getSeatColor(seat.status, isMyFamily, isSelected)}`}
                    disabled={!isMyFamily || isOccupied}
                >
                    {isOccupied ? "X" : seat.id.replace('A', '')}
                </motion.button>

                {/* Nombre Hover */}
                {isOccupied && seat.assigned_guest_name && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {seat.assigned_guest_name}
                    </div>
                )}
                {/* Nombre Corto */}
                {isOccupied && seat.assigned_guest_name && (
                    <span className="absolute top-10 text-[8px] text-gray-500 font-medium w-16 text-center truncate pointer-events-none bg-white/80 rounded px-1">
                        {seat.assigned_guest_name.split(" ")[0]}
                    </span>
                )}
            </div>
        );
    };

    // Mesa Vertical con Cabeceras (1 Top, 4 Left, 4 Right, 1 Bottom)
    const renderVerticalTable = (tableSeats, side) => {
        // Total 10 seats
        // Order logic:
        // Seat 0: Top Header
        // Seats 1-4: Left Side (or Right depending on side?) Let's keep it simple: Side A
        // Seats 5-8: Side B
        // Seat 9: Bottom Header

        // Asumiendo orden numérico del array:
        const seatTop = tableSeats[0];
        const seatsSideA = tableSeats.slice(1, 5); // 4 sillas
        const seatsSideB = tableSeats.slice(5, 9); // 4 sillas
        const seatBottom = tableSeats[9];

        return (
            <div className="flex flex-col items-center">
                {/* Cabecera Superior */}
                <div className="mb-2">
                    {renderSeat(seatTop)}
                </div>

                <div className="flex flex-row items-center">
                    {/* Lado A */}
                    <div className="flex flex-col gap-4 mx-2">
                        {seatsSideA.map(seat => renderSeat(seat))}
                    </div>

                    {/* Mesa Surface */}
                    <div className="w-24 h-[350px] bg-white border-2 border-slate-300 rounded-lg shadow-sm flex items-center justify-center relative">
                        <span className="transform -rotate-90 text-slate-300 font-serif tracking-widest text-xs uppercase whitespace-nowrap">
                            {side === 'left' ? "Mesa 1 (Novio)" : "Mesa 3 (Novia)"}
                        </span>
                    </div>

                    {/* Lado B */}
                    <div className="flex flex-col gap-4 mx-2">
                        {seatsSideB.map(seat => renderSeat(seat))}
                    </div>
                </div>

                {/* Cabecera Inferior */}
                <div className="mt-2">
                    {renderSeat(seatBottom)}
                </div>
            </div>
        );
    };

    // Mesa Horizontal con Cabeceras (1 Left, 4 Top, 4 Bottom, 1 Right)
    const renderHorizontalTable = (guestSeats, noviosList) => {
        // guestSeats: A11-A18 (8 total) + novios (2)

        const novio = noviosList.find(n => n.id === 'NOVIO');
        const novia = noviosList.find(n => n.id === 'NOVIA');

        // Headers
        const seatLeft = guestSeats[0]; // A11
        const seatRight = guestSeats[guestSeats.length - 1]; // A18

        // Top Row: A12, Novia, Novio, A13 (4 seats)
        const topRow = [
            guestSeats[1],
            novia,
            novio,
            guestSeats[2]
        ].filter(Boolean);

        // Bottom Row: A14, A15, A16, A17 (4 seats)
        const bottomRow = guestSeats.slice(3, 7);

        return (
            <div className="flex flex-row items-center">
                {/* Cabecera Izquierda */}
                <div className="mr-2">
                    {renderSeat(seatLeft)}
                </div>

                <div className="flex flex-col items-center">
                    <div className="flex gap-4 my-2 items-end">
                        {topRow.map(seat => renderSeat(seat))}
                    </div>

                    <div className="w-[350px] h-24 bg-white border-2 border-slate-300 rounded-lg shadow-sm flex items-center justify-center">
                        <span className="text-slate-300 font-serif tracking-widest text-xs uppercase">Mesa 2 (Mesa de Honor)</span>
                    </div>

                    <div className="flex gap-4 my-2">
                        {bottomRow.map(seat => renderSeat(seat))}
                    </div>
                </div>

                {/* Cabecera Derecha */}
                <div className="ml-2">
                    {renderSeat(seatRight)}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center bg-gray-50 p-6 md:p-12 rounded-xl overflow-x-auto min-h-[800px]">

            {/* Headers decorativos si se desean, pero la U habla por si misma */}

            {/* U LAYOUT */}
            <div className="flex flex-col items-center relative mt-8">

                {/* Fila Superior: Mesa Horizontal (Mesa 2 Integrada) */}
                <div className="z-10">
                    {renderHorizontalTable(mesa2, novios)}
                </div>

                {/* Filas Laterales: Mesas Verticales */}
                <div className="flex justify-center items-start gap-32 lg:gap-64 -mt-6 px-10">

                    {/* Mesa Izquierda (Mesa 1) */}
                    <div className="transform translate-y-24">
                        {renderVerticalTable(mesa1, 'left')}
                    </div>

                    {/* Mesa Derecha (Mesa 3) */}
                    <div className="transform translate-y-24">
                        {renderVerticalTable(mesa3, 'right')}
                    </div>
                </div>

                {/* Texto BODA Fondo */}
                <div className="absolute top-[400px] opacity-10 pointer-events-none">
                    <span className="text-8xl font-serif text-royal-blue transform rotate-0 select-none">BODA</span>
                </div>

            </div>

            {/* Leyenda */}
            <div className="mt-20 flex gap-6 text-xs bg-white px-6 py-3 rounded-full shadow-md border border-gray-100 mb-8">
                <div className="flex items-center"><div className="w-3 h-3 bg-royal-blue rounded-full mr-2"></div> Disponible</div>
                <div className="flex items-center"><div className="w-3 h-3 bg-gold rounded-full mr-2"></div> Tu Selección</div>
                <div className="flex items-center"><div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div> Ocupado</div>
                <div className="flex items-center"><div className="w-3 h-3 bg-gold ring-2 ring-gold border-2 border-white rounded-full mr-2"></div> Novios</div>
            </div>
        </div>
    );
}
