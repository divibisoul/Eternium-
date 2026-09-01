import React from 'react';

type IconProps = { className?: string };
const Icon = ({ className = '' }: IconProps) => <span className={`inline-flex items-center justify-center ${className}`} aria-hidden="true">•</span>;
export const SparklesIcon = Icon;
export const SendIcon = Icon;
export const UserIcon = Icon;
export const BrainChipIcon = Icon;
export const HeartIcon = Icon;
export const GalaxyIcon = Icon;
export const CopyIcon = Icon;
export const CheckIcon = Icon;
export const ThumbUpIcon = Icon;
export const ThumbDownIcon = Icon;
export const GlobeIcon = Icon;
export const MicIcon = Icon;
export const ImageIcon = Icon;
export const PaperclipIcon = Icon;
