'use client';

import React from 'react';

export type BrandType = 
  | 'BCA' 
  | 'MANDIRI' 
  | 'BRI' 
  | 'BNI' 
  | 'SEABANK' 
  | 'SUPERBANK' 
  | 'GOPAY' 
  | 'OVO' 
  | 'DANA' 
  | 'SHOPEEPAY' 
  | 'QRIS' 
  | 'RECEIPT' 
  | 'CASH' 
  | 'GENERIC';

interface BrandBadgeProps {
  brand?: string;
  size?: number;
  showLabel?: boolean;
  className?: string;
}

export function detectBrand(name: string): BrandType {
  const n = (name || '').toUpperCase();
  if (n.includes('BCA') || n.includes('BLU')) return 'BCA';
  if (n.includes('MANDIRI') || n.includes('LIVIN')) return 'MANDIRI';
  if (n.includes('BRI') || n.includes('BRIMO')) return 'BRI';
  if (n.includes('BNI') || n.includes('WONDR')) return 'BNI';
  if (n.includes('SEABANK') || n.includes('SEA BANK')) return 'SEABANK';
  if (n.includes('SUPERBANK') || n.includes('SUPER BANK') || n.includes('GRAB')) return 'SUPERBANK';
  if (n.includes('GOPAY') || n.includes('GOJEK') || n.includes('GOTO')) return 'GOPAY';
  if (n.includes('OVO')) return 'OVO';
  if (n.includes('DANA')) return 'DANA';
  if (n.includes('SHOPEEPAY') || n.includes('SHOPEE')) return 'SHOPEEPAY';
  if (n.includes('QRIS')) return 'QRIS';
  if (n.includes('NOTA') || n.includes('KASIR') || n.includes('RECEIPT') || n.includes('STRUK')) return 'RECEIPT';
  if (n.includes('TUNAI') || n.includes('CASH')) return 'CASH';
  return 'GENERIC';
}

export const BrandBadge: React.FC<BrandBadgeProps> = ({
  brand = '',
  size = 28,
  showLabel = false,
  className = '',
}) => {
  const type = detectBrand(brand);

  const getBrandDetails = (b: BrandType) => {
    switch (b) {
      case 'BCA':
        return {
          bgColor: '#00529C',
          name: 'BCA',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full p-1">
              <path d="M12 2L4 6V12C4 16.5 7.5 20.8 12 22C16.5 20.8 20 16.5 20 12V6L12 2Z" fill="white" fillOpacity="0.2"/>
              <path d="M12 4L5.5 7.2V12C5.5 15.6 8.3 19.1 12 20.1C15.7 19.1 18.5 15.6 18.5 12V7.2L12 4Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M8.5 11.5L11 14L15.5 9.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )
        };
      case 'MANDIRI':
        return {
          bgColor: '#002D62',
          name: 'Mandiri',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full p-1">
              <path d="M4 14C8 10 14 10 20 14" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
              <path d="M4 18C8 14 14 14 20 18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="7" cy="8" r="2.5" fill="#F59E0B"/>
            </svg>
          )
        };
      case 'BRI':
        return {
          bgColor: '#00529C',
          name: 'BRI',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full p-1">
              <rect x="4" y="4" width="16" height="16" rx="4" stroke="white" strokeWidth="2"/>
              <path d="M8 8H13C14.6569 8 16 9.34315 16 11C16 12.6569 14.6569 14 13 14H8V8Z" fill="white" fillOpacity="0.3"/>
              <path d="M8 8H13C14.6569 8 16 9.34315 16 11C16 12.6569 14.6569 14 13 14H8V8Z" stroke="white" strokeWidth="2"/>
              <path d="M12 14L16 20" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M8 8V20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )
        };
      case 'BNI':
        return {
          bgColor: '#006677',
          name: 'BNI',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full p-1">
              <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2"/>
              <path d="M12 7V17" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M7 12H17" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="2" fill="#F97316"/>
            </svg>
          )
        };
      case 'SEABANK':
        return {
          bgColor: '#F97316',
          name: 'SeaBank',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full p-1">
              <path d="M16 8C15 6.5 13 6 11.5 6.5C10 7 9 8.5 9.5 10C10 11.5 14 12 14.5 13.5C15 15 13.5 17 11.5 17.5C9.5 18 8 16.5 7.5 15.5" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
              <circle cx="17" cy="7" r="1.5" fill="white"/>
            </svg>
          )
        };
      case 'SUPERBANK':
        return {
          bgColor: '#6D28D9',
          name: 'Superbank',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full p-1">
              <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="#84CC16" strokeWidth="2.2" strokeLinejoin="round"/>
              <path d="M12 7L16 9.5V14.5L12 17L8 14.5V9.5L12 7Z" fill="white" fillOpacity="0.2"/>
              <circle cx="12" cy="12" r="2.5" fill="#84CC16"/>
            </svg>
          )
        };
      case 'GOPAY':
        return {
          bgColor: '#00AED6',
          name: 'GoPay',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full p-1">
              <circle cx="12" cy="12" r="7.5" stroke="white" strokeWidth="2.6"/>
              <circle cx="12" cy="12" r="3" fill="white"/>
            </svg>
          )
        };
      case 'OVO':
        return {
          bgColor: '#4C3494',
          name: 'OVO',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full p-1">
              <circle cx="12" cy="12" r="7.5" stroke="white" strokeWidth="2.8"/>
              <circle cx="12" cy="12" r="4" stroke="#A855F7" strokeWidth="1.5"/>
            </svg>
          )
        };
      case 'DANA':
        return {
          bgColor: '#118EEA',
          name: 'DANA',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full p-1">
              <path d="M12 3L20 12L12 21L4 12L12 3Z" fill="white" fillOpacity="0.2"/>
              <path d="M12 4L19 12L12 20L5 12L12 4Z" stroke="white" strokeWidth="2.2" strokeLinejoin="round"/>
              <path d="M9 12H15" stroke="white" strokeWidth="2.4" strokeLinecap="round"/>
            </svg>
          )
        };
      case 'SHOPEEPAY':
        return {
          bgColor: '#EE4D2D',
          name: 'ShopeePay',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full p-1">
              <path d="M6 9H18V19C18 20.1046 17.1046 21 16 21H8C6.89543 21 6 20.1046 6 19V9Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M9 9V6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M13.5 12.5C13 12 12 12 11.5 12.5C11 13 11 14 13 14.5C14 15 14 16 13 16.5C12 17 11 16.5 10.5 16" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          )
        };
      case 'QRIS':
        return {
          bgColor: '#D32F2F',
          name: 'QRIS',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full p-1">
              <rect x="4" y="4" width="6" height="6" rx="1.5" stroke="white" strokeWidth="2"/>
              <rect x="14" y="4" width="6" height="6" rx="1.5" stroke="white" strokeWidth="2"/>
              <rect x="4" y="14" width="6" height="6" rx="1.5" stroke="white" strokeWidth="2"/>
              <rect x="14" y="14" width="3" height="3" fill="white"/>
              <rect x="18" y="18" width="3" height="3" fill="white"/>
              <circle cx="7" cy="7" r="1.2" fill="white"/>
              <circle cx="17" cy="7" r="1.2" fill="white"/>
              <circle cx="7" cy="17" r="1.2" fill="white"/>
            </svg>
          )
        };
      case 'RECEIPT':
        return {
          bgColor: '#334155',
          name: 'Nota Kasir',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full p-1">
              <path d="M5 4V20L8 18L11 20L14 18L17 20L19 18V4C19 3.44772 18.5523 3 18 3H6C5.44772 3 5 3.44772 5 4Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
              <line x1="8" y1="8" x2="16" y2="8" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
              <line x1="8" y1="12" x2="14" y2="12" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          )
        };
      case 'CASH':
        return {
          bgColor: '#059669',
          name: 'Tunai',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full p-1">
              <rect x="3" y="6" width="18" height="12" rx="2" stroke="white" strokeWidth="2"/>
              <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.8"/>
              <path d="M6 12H7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M17 12H18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )
        };
      default:
        return {
          bgColor: '#0F766E',
          name: brand || 'Dompet',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full p-1">
              <path d="M3 7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z" stroke="white" strokeWidth="2"/>
              <path d="M16 12H18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          )
        };
    }
  };

  const details = getBrandDetails(type);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: details.bgColor,
        }}
        className="rounded-lg flex items-center justify-center shrink-0 shadow-xs border border-white/10"
        title={details.name}
      >
        {details.svg}
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
          {details.name}
        </span>
      )}
    </div>
  );
};
