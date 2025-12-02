
import React, { useEffect, useRef } from 'react';

// Make sure JsBarcode is loaded from the script tag in index.html
declare var JsBarcode: any;

interface BarcodeProps {
    value: string;
}

const Barcode: React.FC<BarcodeProps> = ({ value }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (svgRef.current && value) {
            try {
                JsBarcode(svgRef.current, value, {
                    format: 'CODE128',
                    height: 40,
                    displayValue: true,
                    fontSize: 14,
                    margin: 0,
                });
            } catch (e) {
                console.error('Error generating barcode', e);
            }
        }
    }, [value]);

    return <svg ref={svgRef}></svg>;
};

export default Barcode;