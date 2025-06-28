import { motion } from 'framer-motion';
import { CUP_INTERNAL_HEIGHT, CUP_INTERNAL_WIDTH, CUP_INTERNAL_X, CUP_INTERNAL_Y } from '../constants';

interface WaterCupProps {
    fillPercentage: number; // Percentage of the cup filled with water (0-100)
}

const WaterCup: React.FC<WaterCupProps> = ({ fillPercentage }) => {
    const waterRectHeight = (fillPercentage / 100) * CUP_INTERNAL_HEIGHT;
    const waterRectY = CUP_INTERNAL_Y + CUP_INTERNAL_HEIGHT - waterRectHeight + 1;

    return (
        <svg width="150" height="200" viewBox="0 0 150 250">
            {/* Cup Outline */}
            <rect
                x={CUP_INTERNAL_X}
                y={CUP_INTERNAL_Y}
                width={CUP_INTERNAL_WIDTH}
                height={CUP_INTERNAL_HEIGHT}
                fill="none"
                stroke="gray"
                strokeWidth="3"
            />
            <path d="M25 200 L125 200 L115 220 L35 220 Z" fill="none" stroke="gray" strokeWidth="3" /> {/* Base */}

            {/* Water */}
            <motion.rect
                x={CUP_INTERNAL_X + 1} // Small adjustment to avoid clipping with left stroke
                width={CUP_INTERNAL_WIDTH - 2} // Small adjustment to avoid clipping with strokes
                fill="#64B5F6" // Light blue
                initial={{ height: 0, y: CUP_INTERNAL_Y + CUP_INTERNAL_HEIGHT }}
                animate={{
                    height: waterRectHeight > 0 ? waterRectHeight - 1 : 0,
                    y: waterRectY
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
        </svg>
    );
};

export default WaterCup;