export function widgetLayout(family: string, size: {width?: number; height?: number} | undefined, hasMessage = false) {
 const narrow = family === 'systemSmall';
 const compactRows = family === 'systemMedium';
 const width = Number(size?.width) || (narrow ? 155 : 329);
 const height = Number(size?.height) || (family === 'systemLarge' ? 345 : 155);
 // Reserve system margins, a one-line heading, footer and stack spacing.
 const available = Math.max(24, height - 32 - 18 - 20 - 12 - (hasMessage ? 16 : 0));
 const titleLines = Math.max(1, Math.min(compactRows ? 2 : 3, Math.floor((available - (compactRows ? 0 : 18)) / 15)));
 const rowBudget = Math.max(20, titleLines * 15 + (compactRows ? 0 : 18)) + 6;
 const limit = family === 'systemLarge' || family === 'systemExtraLarge' ? Math.max(1, Math.min(6, Math.floor((available + 6) / rowBudget))) : compactRows ? Math.max(1,Math.min(2,Math.floor((available+6)/rowBudget))) : 1;
 return {narrow, compactRows, width, height, titleLines, limit};
}
