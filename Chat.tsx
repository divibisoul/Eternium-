import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, MessageRole, SystemAspect, GroundingMetadata } from './types.ts';
import { SparklesIcon, SendIcon, UserIcon, BrainChipIcon, HeartIcon, GalaxyIcon, CopyIcon, CheckIcon, ThumbUpIcon, ThumbDownIcon, GlobeIcon } from './icons.tsx';
import { SynthesisMetrics } from './SynthesisMetrics.tsx';
import { FusionProcessVisualizer } from './FusionProcessVisualizer.tsx';
import { MultimodalInputButton } from './MultimodalInputButton.tsx';
