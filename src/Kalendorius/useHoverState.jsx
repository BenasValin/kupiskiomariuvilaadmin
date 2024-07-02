import { useState, useCallback } from 'react';

const useHoverState = () => {
    const [hoveredDate, setHoveredDate] = useState(null);

    const handleDayHover = useCallback((day) => {
        setHoveredDate(day);
    }, []);

    const resetHover = useCallback(() => {
        setHoveredDate(null);
    }, []);

    return { hoveredDate, handleDayHover, resetHover };
};

export default useHoverState;