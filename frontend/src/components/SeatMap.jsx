import React from 'react';
import { motion } from 'framer-motion';

// Helper para obtener estilo según estado
// Helper para obtener estilo según estado
const getSeatColor = (status, id, isSelected) => {
    if (isSelected) {
        return 'bg-green-500 text-white shadow-lg ring-2 ring-green-400 border-2 border-white scale-110';
    }
    if (id === 'NOVIO' || id === 'NOVIA') {
        return 'bg-gold text-white shadow-lg ring-2 ring-gold border-2 border-white';
    }
    if (status === 'locked' || status === 'occupied') {
        return 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-100';
    }
    return 'bg-royal-blue text-white hover:bg-blue-600 cursor-pointer shadow-sm';
};

export default function SeatMap({ seats, onSelectSeat, currentSelection = [] }) {
    // Ordenar numéricamente
    const sortByNumber = (a, b) => {
        const nA = parseInt(a.id.substring(1));
        const nB = parseInt(b.id.substring(1));
        return nA - nB;
    };

    const mesa1 = seats.filter(s => { const n = parseInt(s.id.substring(1)); return n >= 1 && n <= 10; }).sort(sortByNumber);
    const mesa2 = seats.filter(s => { const n = parseInt(s.id.substring(1)); return n >= 11 && n <= 18; }).sort(sortByNumber);
    const mesa3 = seats.filter(s => { const n = parseInt(s.id.substring(1)); return n >= 19 && n <= 28; }).sort(sortByNumber);
    const novios = seats.filter(s => s.id === 'NOVIO' || s.id === 'NOVIA');

    const renderSeat = (seat, position = 'bottom') => {
        if (!seat) return null;

        const isOccupied = seat.status === 'occupied' || seat.status === 'locked';
        const isNovio = seat.id === 'NOVIO' || seat.id === 'NOVIA';
        const isSelected = currentSelection.some(s => s.id === seat.id);

        const getOffsetClass = () => {
            switch (position) {
                case 'top': return '-top-10 left-1/2 -translate-x-1/2 w-max';
                case 'bottom': return 'top-11 left-1/2 -translate-x-1/2 w-max';
                case 'left': return 'top-1/2 left-[110%] -translate-y-1/2 w-[200px] pl-1 text-left';
                case 'right': return 'top-1/2 right-[110%] -translate-y-1/2 w-[200px] pr-1 text-right';
                default: return 'top-11 left-1/2 -translate-x-1/2 w-max';
            }
        };

        return (
            <div key={seat.id} className="relative flex flex-col items-center z-10 mx-1">
                <motion.button
                    whileHover={!isOccupied ? { scale: 1.1 } : {}}
                    onClick={() => onSelectSeat(seat)}
                    disabled={isOccupied && !isNovio && !isSelected} // Permitir click si está seleccionado para des-seleccionar? ManualSeatAssignment maneja toggle.
                    className={`${isNovio ? 'w-12 h-12 text-[9px]' : 'w-9 h-9 text-[10px]'} rounded-full flex items-center justify-center font-bold transition-all duration-300 ${getSeatColor(seat.status, seat.id, isSelected)}`}
                >
                    {isNovio ? (seat.id === 'NOVIO' ? 'NOVIO' : 'NOVIA') : (isOccupied ? 'X' : seat.id.replace('A', ''))}
                </motion.button>

                {isOccupied && seat.assigned_guest_name && (
                    <div className={`absolute ${getOffsetClass()} z-20 pointer-events-none`}>
                        <span className="block text-royal-blue text-[12px] font-extrabold leading-tight drop-shadow-sm whitespace-pre-wrap">
                            {seat.assigned_guest_name}
                        </span>
                    </div>
                )}
            </div>
        );
    };

    const renderVerticalTable = (tableSeats, side) => {
        const seatTop = tableSeats[0];
        const seatsSideA = tableSeats.slice(1, 5);
        const seatsSideB = tableSeats.slice(5, 9);
        const seatBottom = tableSeats[9];

        return (
            <div className="flex flex-col items-center">
                <div className="mb-6">{renderSeat(seatTop, 'top')}</div>
                <div className="flex flex-row items-center">
                    <div className="flex flex-col gap-4 mr-4">
                        {seatsSideA.map(seat => renderSeat(seat, 'right'))}
                    </div>
                    <div className="w-20 h-[300px] bg-white border border-slate-200 rounded flex items-center justify-center relative shadow-sm">
                        <span className="transform -rotate-90 text-slate-300 font-serif tracking-[0.2em] text-[10px] uppercase opacity-50 whitespace-nowrap">
                            {side === 'left' ? "Mesa del NOVIO" : "Mesa de la NOVIA"}
                        </span>
                    </div>
                    <div className="flex flex-col gap-4 ml-4">
                        {seatsSideB.map(seat => renderSeat(seat, 'left'))}
                    </div>
                </div>
                <div className="mt-6">{renderSeat(seatBottom, 'bottom')}</div>
            </div>
        );
    };

    const renderHorizontalTable = (guestSeats, noviosList) => {
        const novio = noviosList.find(n => n.id === 'NOVIA');
        const novia = noviosList.find(n => n.id === 'NOVIO');
        const seatLeft = guestSeats[0];
        const seatRight = guestSeats[guestSeats.length - 1];
        const topRow = [guestSeats[1], novia, novio, guestSeats[2]].filter(Boolean);
        const bottomRow = guestSeats.slice(3, 7);

        return (
            <div className="flex flex-row items-center">
                <div className="mr-10">{renderSeat(seatLeft, 'right')}</div>
                <div className="flex flex-col items-center">
                    <div className="flex gap-24 mb-6 items-end">
                        {renderSeat(topRow[0], 'top')}
                        <div className="flex gap-4">
                            {renderSeat(topRow[1], 'top')}
                            {renderSeat(topRow[2], 'top')}
                        </div>
                        {renderSeat(topRow[3], 'top')}
                    </div>
                    <div className="w-[600px] h-20 bg-white border border-slate-200 rounded flex items-center justify-center shadow-sm">
                        <span className="text-slate-300 font-serif tracking-[0.2em] text-[10px] uppercase opacity-50">Mesa de Honor</span>
                    </div>
                    <div className="flex gap-32 mt-6">
                        {bottomRow.map(seat => renderSeat(seat, 'bottom'))}
                    </div>
                </div>
                <div className="ml-12">{renderSeat(seatRight, 'left')}</div>
            </div>
        );
    };

    return (
        <div className="w-full flex flex-col items-center bg-white p-2">
            {/* Contenedor principal sin overflow forzado para evitar el scroll-dentro-del-scroll */}
            <div className="w-full flex justify-center">
                <div className="flex flex-col items-center relative mt-8 origin-top transform scale-[0.45] sm:scale-75 md:scale-90 lg:scale-100 transition-transform duration-300">
                    <div className="mb-24">
                        {renderHorizontalTable(mesa2, novios)}
                    </div>
                    <div className="flex justify-center items-start gap-72 lg:gap-96">
                        {renderVerticalTable(mesa1, 'left')}
                        {renderVerticalTable(mesa3, 'right')}
                    </div>
                </div>
            </div>

            {/* Ajuste de margen para la leyenda, dependiendo del escalado móvil */}
            {/* Usamos un margen que se ajuste segun el breakpoint para evitar el solapamiento */}
            <div className="mt-[-420px] sm:mt-12 lg:mt-24 flex flex-wrap gap-4 sm:gap-8 text-[10px] uppercase tracking-widest text-gray-400 border-t pt-8 w-full max-w-lg justify-center relative z-10 bg-white px-4">
                <div className="flex items-center"><div className="w-2 h-2 bg-royal-blue rounded-full mr-2"></div> Disponible</div>
                <div className="flex items-center"><div className="w-2 h-2 bg-gray-200 rounded-full mr-2"></div> Ocupado</div>
                <div className="flex items-center"><div className="w-2 h-2 bg-gold rounded-full mr-2"></div> Novios</div>
            </div>
        </div>
    );
}
