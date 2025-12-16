import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Dimension } from '@/lib/types';

interface RadarChartProps {
  dimensions: Dimension[];
  size?: number;
}

export function RadarChart({ dimensions, size = 400 }: RadarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || dimensions.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = 80;
    const width = size;
    const height = size;
    const radius = Math.min(width, height) / 2 - margin;
    const centerX = width / 2;
    const centerY = height / 2;

    const levels = 5;
    const angleSlice = (Math.PI * 2) / dimensions.length;

    const g = svg
      .append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    const rScale = d3.scaleLinear().domain([1, 5]).range([0, radius]);

    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius / levels) * level;

      g.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', levelRadius)
        .attr('fill', 'none')
        .attr('stroke', 'var(--chart-grid)')
        .attr('stroke-width', 1)
        .attr('opacity', 0.4);
    }

    dimensions.forEach((dim, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const lineX = radius * Math.cos(angle);
      const lineY = radius * Math.sin(angle);

      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', lineX)
        .attr('y2', lineY)
        .attr('stroke', 'var(--chart-grid)')
        .attr('stroke-width', 1)
        .attr('opacity', 0.4);

      const labelRadius = radius + 30;
      const labelX = labelRadius * Math.cos(angle);
      const labelY = labelRadius * Math.sin(angle);

      const text = g.append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'var(--foreground)')
        .style('font-size', '14px')
        .style('font-weight', '500')
        .text(dim.name);

      if (Math.abs(labelX) < 5) {
        text.attr('text-anchor', 'middle');
      } else if (labelX > 0) {
        text.attr('text-anchor', 'start');
      } else {
        text.attr('text-anchor', 'end');
      }
    });

    const dataPoints = dimensions.map((dim, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const r = rScale(dim.value);
      return [r * Math.cos(angle), r * Math.sin(angle)];
    });

    g.append('polygon')
      .attr('points', dataPoints.map(p => p.join(',')).join(' '))
      .attr('fill', 'var(--chart-primary-fill)')
      .attr('stroke', 'var(--chart-primary)')
      .attr('stroke-width', 3)
      .attr('opacity', 0)
      .transition()
      .duration(400)
      .attr('opacity', 1);

    dataPoints.forEach((point) => {
      g.append('circle')
        .attr('cx', point[0])
        .attr('cy', point[1])
        .attr('r', 0)
        .attr('fill', 'var(--chart-primary)')
        .transition()
        .duration(400)
        .attr('r', 5);
    });

  }, [dimensions, size]);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      className="mx-auto"
    />
  );
}
