/**
 * Exports an SVG element to a crisp high-resolution PNG image
 */
export async function exportSvgToPng(
  svgElement: SVGSVGElement,
  buildingName: string,
  startNodeId: string,
  targetExitId: string | null,
  totalCost: number | null
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
      
      // Ensure SVG has explicit dimensions and inline styles
      const bbox = svgElement.getBoundingClientRect();
      const width = Math.max(bbox.width, 1000);
      const height = Math.max(bbox.height, 700);

      svgClone.setAttribute('width', `${width}`);
      svgClone.setAttribute('height', `${height}`);

      // Serialize SVG
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgClone);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        // Create canvas with 2x resolution for high DPI crispness
        const scale = 2;
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = (height + 70) * scale; // Extra space for header/footer banner

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.scale(scale, scale);

        // Fill background
        ctx.fillStyle = '#020617'; // slate-950
        ctx.fillRect(0, 0, width, height + 70);

        // Draw Title Banner at top
        ctx.fillStyle = '#0f172a'; // slate-900
        ctx.fillRect(0, 0, width, 50);

        ctx.fillStyle = '#38bdf8'; // sky-400
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.fillText('SMART ESCAPE · EVACUATION SIMULATOR', 24, 30);

        ctx.fillStyle = '#94a3b8'; // slate-400
        ctx.font = '13px system-ui, sans-serif';
        ctx.fillText(`Building: ${buildingName}`, 380, 30);

        const routeText = targetExitId
          ? `Route: ${startNodeId} ➔ ${targetExitId} (Cost: ${totalCost})`
          : `Origin: ${startNodeId} (No route)`;
        ctx.fillStyle = '#34d399'; // emerald-400
        ctx.font = 'bold 13px system-ui, sans-serif';
        const routeWidth = ctx.measureText(routeText).width;
        ctx.fillText(routeText, width - routeWidth - 24, 30);

        // Draw SVG Map
        ctx.drawImage(image, 0, 50, width, height);

        // Draw Timestamp in bottom watermark
        ctx.fillStyle = '#475569';
        ctx.font = '11px system-ui, sans-serif';
        const timestamp = new Date().toLocaleString();
        ctx.fillText(`Generated: ${timestamp} · AI DevFest Smart Escape`, 24, height + 62);

        // Convert to PNG and trigger download
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to generate PNG blob'));
            return;
          }
          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const cleanName = buildingName.toLowerCase().replace(/[^a-z0-9]/g, '-');
          a.download = `smart-escape-${cleanName}-${startNodeId}.png`;
          a.href = downloadUrl;
          a.click();
          URL.revokeObjectURL(downloadUrl);
          URL.revokeObjectURL(blobURL);
          resolve();
        }, 'image/png');
      };

      image.onerror = (e) => {
        URL.revokeObjectURL(blobURL);
        reject(e);
      };

      image.src = blobURL;
    } catch (err) {
      reject(err);
    }
  });
}
