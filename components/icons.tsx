import React from 'react';

type IconProps = {
  className?: string;
  style?: React.CSSProperties;
};

export const SparklesIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.07 1.976-1.07 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.312l-4.12 3.515 1.58 5.395c.325 1.108-.956 2.053-1.956 1.442L12 18.252l-4.903 2.992c-1-.611-2.28- .334-1.956-1.442l1.58-5.395L2.637 10.962c-.887-.767-.415-2.219.749-2.312l5.404-.434L10.788 3.21z" clipRule="evenodd" />
  </svg>
);

export const BrainChipIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M15.75 3v1.5m0 16.5v-1.5m3.75-12H21m-18 0h1.5m15 3.75H21m-18 0h1.5m15 3.75H21m-18 0h1.5M12 6.75v10.5M15.75 21v-1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5h7.5v9h-7.5z" />
  </svg>
);

export const HeartIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

export const ShieldCheckIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
  </svg>
);

export const GalaxyIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
     <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5C7.25 4.5 4.5 7.25 4.5 12s2.75 7.5 7.5 7.5 7.5-2.75 7.5-7.5S16.75 4.5 12 4.5z" />
     <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5c-2.317 0-4.43.9-5.96 2.4A7.5 7.5 0 0112 19.5a7.5 7.5 0 015.96-12.6C16.43 5.4 14.317 4.5 12 4.5z" />
     <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

export const CodeBracketSquareIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v17.25h17.25V3H3.75zm3 3.75h-.75v-.75h.75v.75zm3 0h-.75v-.75h.75v.75zm3 0h-.75v-.75h.75v.75zm-6 3.75h-.75v-.75h.75v.75zm3 0h-.75v-.75h.75v.75zm3 0h-.75v-.75h.75v.75z" />
  </svg>
);

export const MapIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20.25h6m-6 0a3.75 3.75 0 01-3.75-3.75V9.75A3.75 3.75 0 019 6h6a3.75 3.75 0 013.75 3.75v6.75a3.75 3.75 0 01-3.75 3.75M9 20.25h6M12 14.25v2.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6V3.75A1.75 1.75 0 0110.75 2h2.5A1.75 1.75 0 0115 3.75V6" />
  </svg>
);

export const ScaleIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m-6-12h12M6 9.75a3.75 3.75 0 013.75-3.75h1.5A3.75 3.75 0 0115 9.75m-6 4.5h6m-6 0a3.75 3.75 0 00-3.75 3.75v.75c0 1.036.84 1.875 1.875 1.875h1.5c1.036 0 1.875-.84 1.875-1.875v-.75a3.75 3.75 0 00-3.75-3.75z" />
  </svg>
);

export const ArrowsPathIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.693l-3.182-3.182a8.25 8.25 0 00-11.667 0L2.985 14.651" />
  </svg>
);

export const WrenchScrewdriverIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h12.75" />
  </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

export const SendIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

export const UserIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

export const CopyIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375v-3.375c0-.621-.504-1.125-1.125-1.125h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125H10.5a2.25 2.25 0 002.25-2.25v-1.5c0-.621-.504-1.125-1.125-1.125h-3.375" />
  </svg>
);

export const ThumbUpIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.424 2.002-1.116A4.502 4.502 0 0112 9c1.052 0 2.062.18 3.064.524C16.965 9.88 18 11.434 18 13.5c0 .828-.447 1.555-1.176 2.002A9.01 9.01 0 0112 16.5c-2.404 0-4.636-.85-6.367-2.312C4.402 13.266 4 12.392 4 11.5c0-1.07.376-2.075 1.05-2.85C5.463 8.16 6.027 8.25 6.633 8.25c.348 0 .685-.098.985-.282C8.618 7.51 9 6.84 9 6c0-.528-.168-1.018-.466-1.423A3.75 3.75 0 006.633 3.75c-1.282 0-2.45.62-3.167 1.583C2.868 6.022 2.25 7.18 2.25 8.5c0 1.34.618 2.592 1.583 3.428" />
  </svg>
);

export const ThumbDownIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533.424 2.002 1.116A4.502 4.502 0 0012 12c1.052 0 2.062-.18 3.064-.524C16.965 11.12 18 9.566 18 7.5c0-.828-.447-1.555-1.176-2.002A9.01 9.01 0 0012 4.5c-2.404 0-4.636-.85-6.367 2.312C4.402 7.734 4 8.608 4 9.5c0 1.07.376 2.075 1.05 2.85C5.463 12.84 6.027 12.75 6.633 12.75c.348 0 .685.098.985.282C8.618 13.49 9 14.16 9 15c0 .528-.168 1.018-.466 1.423A3.75 3.75 0 016.633 17.25c-1.282 0-2.45-.62-3.167-1.583C2.868 14.978 2.25 13.82 2.25 12.5c0-1.34-.618-2.592-1.583-3.428" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5c2.404 0 4.636.85 6.367 2.312C19.598 7.734 20 8.608 20 9.5c0 1.07-.376 2.075-1.05 2.85c-.463.51-1.027.59-1.633.59c-.348 0-.685-.098-.985-.282C15.382 12.49 15 11.84 15 11c0-.528.168-1.018.466-1.423A3.75 3.75 0 0017.367 7.5c1.282 0 2.45-.62 3.167-1.583C21.132 4.978 21.75 3.82 21.75 2.5c0-1.34-.618-2.592-1.583-3.428" />
  </svg>
);

export const GlobeIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
  </svg>
);

export const ServerStackIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122" />
  </svg>
);

export const CursorArrowRaysIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-2.225-2.51-2.225.569 2.225-2.225-2.51.569 2.225L6.489 12l2.225-.569L6.489 9.205l2.225.569-2.225-2.51.569 2.225L4.267 6.57m1.06.242 1.282 1.282" />
  </svg>
);

export const ChevronDoubleRightIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
  </svg>
);

export const ViewfinderCircleIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 15.375v-2.25zM12 18.75v-2.25c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 0112 18.75zM12 7.5v-2.25c0-.621-.504-1.125-1.125-1.125H8.625c-.621 0-1.125.504-1.125 1.125v2.25c0 .621.504 1.125 1.125 1.125h2.25A1.125 1.125 0 0012 7.5zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const XMarkIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const CameraIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h2l2-2h6l2 2h2a2 2 0 012 2v2M3 7v12a2 2 0 002 2h14a2 2 0 002-2V7H3z"/>
    <circle cx="12" cy="13" r="3"/>
  </svg>
);

export const MicrophoneIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 013-3 3 3 0 013 3v8.25a3 3 0 01-3 3z" />
  </svg>
);

export const CodeBracketIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25" />
  </svg>
);

export const BookOpenIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

export const AtomIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
    <ellipse cx="12" cy="12" rx="3.43" ry="9.43" transform="rotate(-45 12 12)"/>
    <ellipse cx="12" cy="12" rx="3.43" ry="9.43" transform="rotate(45 12 12)"/>
    <path d="M12 12h.01"/>
  </svg>
);

export const QuantumConnectomeIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
    <ellipse cx="12" cy="12" rx="3.43" ry="9.43" transform="rotate(-45 12 12)"/>
    <ellipse cx="12" cy="12" rx="3.43" ry="9.43" transform="rotate(45 12 12)"/>
    <path d="M12 12h.01"/>
  </svg>
);

export const PuzzlePieceIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75v-4.5a1.125 1.125 0 00-1.125-1.125H10.5a1.125 1.125 0 00-1.125 1.125v4.5m3.75 3.75-3.75 3.75M14.25 13.5l3.75 3.75m-3.75-3.75v4.5a1.125 1.125 0 001.125 1.125h2.625a1.125 1.125 0 001.125-1.125v-4.5m3.75-3.75-3.75 3.75m-3.75-3.75H6.375a1.125 1.125 0 00-1.125 1.125v6.75c0 .621.504 1.125 1.125 1.125h6.75a1.125 1.125 0 001.125-1.125v-6.75a1.125 1.125 0 00-1.125-1.125H9.75" />
  </svg>
);

export const OrchestratorIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-2.438c.157-.194.298-.396.437-.602a9.337 9.337 0 00-4.12-2.438 9.38 9.38 0 00-2.625.372m-8.883-2.438a9.337 9.337 0 014.121-2.438c.157.194.298.396.437.602a9.337 9.337 0 01-4.12 2.438 9.38 9.38 0 01-2.625-.372M6.375 19.128a9.38 9.38 0 012.625.372 9.337 9.337 0 014.121-2.438c-.157-.194-.298-.396-.437-.602a9.337 9.337 0 01-4.12-2.438 9.38 9.38 0 01-2.625.372m8.883-2.438a9.337 9.337 0 014.121-2.438c.157.194.298.396.437.602a9.337 9.337 0 01-4.12 2.438 9.38 9.38 0 01-2.625-.372" />
  </svg>
);

export const IndraWebIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2m-2.93 7.07l-1.41-1.41M6.34 6.34L4.93 4.93m12.72 0l-1.41 1.41m-8.49 8.49l-1.41 1.41"/>
    <circle cx="12" cy="12" r="4"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2a10 10 0 00-7.07 2.93m14.14 0A10 10 0 0012 2m0 20a10 10 0 007.07-17.07M4.93 19.07A10 10 0 0012 22"/>
  </svg>
);

export const DnaIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
    <path d="M4 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8-8-3.582-8-8zm4.5 0c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5S10 14.328 10 13.5 9.328 12 8.5 12zm7 0c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5z"/>
    <path d="M8.5 12C7.119 12 6 10.881 6 9.5S7.119 7 8.5 7s2.5 1.119 2.5 2.5m4 2.5c1.381 0 2.5 1.119 2.5 2.5s-1.119 2.5-2.5 2.5-2.5-1.119-2.5-2.5m-4-7.5c-2.071 0-3.75 1.679-3.75 3.75m11.5 0c0-2.071-1.679-3.75-3.75-3.75"/>
  </svg>
);

export const RobotIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h9v9h-9v-9z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12H3m18 0h-1.5M12 4.5V3m0 18v-1.5m-4.096-9.596l-1.06-1.06M19.656 19.656l-1.06-1.06M6.404 19.656l1.06-1.06M17.596 6.404l1.06 1.06"/>
  </svg>
);

export const ChartBarIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

export const CubeTransparentIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);

export const BeakerIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 4.5v-.75a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v.75m-4.5 6.75a.75.75 0 00-.75.75v6a.75.75 0 00.75.75h6a.75.75 0 00.75-.75v-6a.75.75 0 00-.75-.75h-6zM3.75 5.25h16.5m-16.5 0v.75c0 .621.504 1.125 1.125 1.125h14.25c.621 0 1.125-.504 1.125-1.125V5.25" />
  </svg>
);

export const CpuChipIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M15.75 3v1.5m0 16.5v-1.5m3.75-12H21m-18 0h1.5m15 3.75H21m-18 0h1.5m15 3.75H21m-18 0h1.5M12 6.75v10.5" />
    <rect x="7.5" y="7.5" width="9" height="9" rx="1" ry="1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CircleStackIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375l-4.5 2.25-4.5-2.25-4.5 2.25-4.5-2.25L1.5 8.625v9.75l4.5-2.25 4.5 2.25 4.5-2.25 4.5 2.25v-9.75L20.25 6.375zM2.25 12l4.5-2.25 4.5 2.25 4.5-2.25 4.5 2.25M2.25 15l4.5-2.25 4.5 2.25 4.5-2.25 4.5 2.25" />
  </svg>
);

export const SatelliteIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
    <path d="M5 12.55a11 11 0 0114.08 0M1.42 9.03a15 15 0 0121.16 0M8.53 16.11a6 6 0 016.95 0"/>
    <path d="M12 20.23l-1.42 2.24h2.84L12 20.23zM12 2v2.77m0 12.69V20.23"/>
    <path d="M12 2l-2.47 3.88m4.94 0L12 2"/>
  </svg>
);

export const ResilienceIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M12 21.75c5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286-2.15 2.038-5.054 3.286-8.25 3.286H3C3.21 9.18 3 10.439 3 11.75c0 5.592 3.824 10.29 9 11.622z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 13.5h2.25l1.5-3 2.25 6L16.5 12" />
  </svg>
);

export const MagnifyingGlassIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

export const ShieldExclamationIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

export const PlayIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
  </svg>
);

export const RewindIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
  </svg>
);

export const CommandLineIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

export const BoltIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
);

export const LightBulbIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-11.25H10.5a6.01 6.01 0 001.5 11.25v.003zM7.5 18h9" />
  </svg>
);

export const DocumentMagnifyingGlassIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.5h-8.01a1.5 1.5 0 01-1.5-1.5V5.25a1.5 1.5 0 011.5-1.5h8.01a1.5 1.5 0 011.5 1.5v8.231l-2.231 2.231z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l3.75 3.75" />
  </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);